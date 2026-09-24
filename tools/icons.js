#!/usr/bin/env node
/* Draws the app icons: a Lucite deal tombstone on ink. No dependencies.
   node tools/icons.js writes icons/*.png and icons/icon.svg. */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'icons');
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const INK = '#16181C';
// Shapes in a 512 × 512 space, painted in order. The face clips the glare.
const face = { x: 160, y: 112, w: 192, h: 278, r: 6 };
const SHAPES = [
  { rect: { x: 134, y: 398, w: 244, h: 14, r: 3 }, color: '#3A3F46' },             // shelf
  { rect: { x: 152, y: 104, w: 208, h: 294, r: 10 }, color: '#E6F2EF' },            // polished edge
  { rect: face, color: '#CFE6E0' },                                                  // block face
  { tri: [[160, 112], [268, 112], [160, 250]], color: '#FFFFFF', alpha: 0.32, clip: face }, // glare
  { rect: { x: 221, y: 146, w: 70, h: 10, r: 5 }, color: '#7FA79D' },               // track
  { rect: { x: 206, y: 174, w: 100, h: 50, r: 8 }, color: '#6E988E' },              // big figure
  { rect: { x: 216, y: 236, w: 80, h: 9, r: 4.5 }, color: '#7FA79D' },              // "cards mastered"
  { rect: { x: 226, y: 264, w: 60, h: 3, r: 1.5 }, color: '#7FA79D' },              // rule
  { rect: { x: 186, y: 284, w: 140, h: 13, r: 6.5 }, color: '#6E988E' },            // module name
  { rect: { x: 206, y: 306, w: 100, h: 13, r: 6.5 }, color: '#6E988E' },
  { rect: { x: 226, y: 334, w: 60, h: 3, r: 1.5 }, color: '#7FA79D' },              // rule
  { rect: { x: 216, y: 350, w: 80, h: 9, r: 4.5 }, color: '#7FA79D' }               // date
];

function inRect(px, py, { x, y, w, h, r }) {
  if (px < x || py < y || px > x + w || py > y + h) return false;
  const cx = Math.min(Math.max(px, x + r), x + w - r);
  const cy = Math.min(Math.max(py, y + r), y + h - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

function inTri(px, py, [[x1, y1], [x2, y2], [x3, y3]]) {
  const d = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
  const a = ((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py)) / d;
  const b = ((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py)) / d;
  return a >= 0 && b >= 0 && a + b <= 1;
}

// Render at size × size with 4 × 4 supersampling. corner = background corner radius (0 for full bleed).
function render(size, corner) {
  const SS = 4;
  const scale = 512 / size;
  const bg = { rect: { x: 0, y: 0, w: 512, h: 512, r: corner }, color: INK };
  const shapes = [bg].concat(SHAPES).map((s) => ({ ...s, rgb: hex(s.color), a: s.alpha == null ? 1 : s.alpha }));
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let R = 0, G = 0, B = 0, A = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) * scale;
          const v = (y + (sy + 0.5) / SS) * scale;
          let r = 0, g = 0, b = 0, a = 0; // premultiplied
          for (const s of shapes) {
            const hit = s.rect ? inRect(u, v, s.rect) : inTri(u, v, s.tri);
            if (!hit || (s.clip && !inRect(u, v, s.clip))) continue;
            r = s.rgb[0] * s.a + r * (1 - s.a);
            g = s.rgb[1] * s.a + g * (1 - s.a);
            b = s.rgb[2] * s.a + b * (1 - s.a);
            a = s.a + a * (1 - s.a);
          }
          R += r; G += g; B += b; A += a;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      px[i + 3] = Math.round((255 * A) / n);
      if (A > 0) {
        px[i] = Math.round(R / A);
        px[i + 1] = Math.round(G / A);
        px[i + 2] = Math.round(B / A);
      }
    }
  }
  return encodePNG(size, size, px);
}

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function svg() {
  const rect = ({ x, y, w, h, r }, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${extra}/>`;
  const parts = [rect({ x: 0, y: 0, w: 512, h: 512, r: 112 }, INK)];
  parts.push('<defs><clipPath id="face">' + rect(face, '#000') + '</clipPath></defs>');
  for (const s of SHAPES) {
    if (s.rect) parts.push(rect(s.rect, s.color));
    else parts.push(`<polygon points="${s.tri.map((p) => p.join(',')).join(' ')}" fill="${s.color}" fill-opacity="${s.alpha}" clip-path="url(#face)"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${parts.join('')}</svg>\n`;
}

fs.mkdirSync(OUT, { recursive: true });
const files = [
  ['apple-touch-icon.png', 180, 0],   // iOS rounds the corners itself
  ['icon-192.png', 192, 112],
  ['icon-512.png', 512, 112],
  ['icon-maskable-512.png', 512, 0],  // full bleed; the tombstone sits inside the safe zone
  ['favicon-32.png', 32, 112]
];
for (const [name, size, corner] of files) {
  fs.writeFileSync(path.join(OUT, name), render(size, corner));
  console.log('wrote icons/' + name);
}
fs.writeFileSync(path.join(OUT, 'icon.svg'), svg());
console.log('wrote icons/icon.svg');
