#!/usr/bin/env node
/* Before every deploy: node tools/bump.js
   Raises VERSION in sw.js and APP_VERSION in app.js by one, and rebuilds the service worker's
   ASSETS list from index.html and the manifest so every file gets cached. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = (f) => path.join(ROOT, f);
const sw = fs.readFileSync(file('sw.js'), 'utf8');
const app = fs.readFileSync(file('app.js'), 'utf8');
const html = fs.readFileSync(file('index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(file('manifest.webmanifest'), 'utf8'));

const current = Number((/const VERSION = (\d+);/.exec(sw) || [])[1]);
if (!current) {
  console.error('sw.js has no "const VERSION = <number>;"');
  process.exit(1);
}
const next = current + 1;

const assets = ['./', 'index.html'];
const add = (f) => { if (f && !/^https?:/.test(f) && !assets.includes(f)) assets.push(f); };
[...html.matchAll(/<link\b[^>]*\bhref="([^"#]+)"/g)].forEach((m) => add(m[1]));
[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].forEach((m) => add(m[1]));
manifest.icons.forEach((i) => add(i.src));
const missing = assets.filter((a) => a !== './' && !fs.existsSync(file(a)));
if (missing.length) {
  console.error('These files are referenced but missing:\n  ' + missing.join('\n  '));
  process.exit(1);
}

const list = 'const ASSETS = [\n' + assets.map((a) => `  '${a}'`).join(',\n') + '\n];';
fs.writeFileSync(file('sw.js'), sw.replace(/const VERSION = \d+;/, `const VERSION = ${next};`).replace(/const ASSETS = \[[\s\S]*?\];/, list));
fs.writeFileSync(file('app.js'), app.replace(/const APP_VERSION = \d+;/, `const APP_VERSION = ${next};`));
console.log(`Version ${current} → ${next}. The service worker caches ${assets.length} files.`);
