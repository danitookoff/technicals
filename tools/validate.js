#!/usr/bin/env node
/* Technicals validator.
     node tools/validate.js                    check everything, print a summary, exit 1 on errors
     node tools/validate.js --update-coverage  also refresh counts, drill ticks and the summary in COVERAGE.md
     node tools/validate.js --strict           treat warnings as errors
     node tools/validate.js --verbose          list every warning in full */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ARGS = new Set(process.argv.slice(2));
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const listJs = (dir) => (exists(dir) ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.js')).sort().map((f) => `${dir}/${f}`) : []);

const TRACKS = ['ib', 're', 'hotel'];
const TYPES = ['qa', 'walk', 'primer'];
const CARD_FIELDS = ['id', 'track', 'module', 'topic', 'level', 'type', 'classic', 'q', 'a', 'why', 'formula', 'example', 'trap', 'visual'];
const LIMITS = { q: 220, a: 60, aWalk: 80, aPrimer: 90, why: 110, example: 90, trap: 45, drillQ: 260 };
const DRILL_SEEDS = 500;

const plain = (t) => String(t).replace(/\[\[|\]\]/g, '');
const words = (t) => plain(t).trim().split(/\s+/).filter(Boolean).length;

// [[ ]] must open and close in pairs, without nesting.
function markersOk(text) {
  let open = false;
  for (let i = 0; i < text.length - 1; i++) {
    const two = text.slice(i, i + 2);
    if (two === '[[') { if (open) return false; open = true; i++; }
    else if (two === ']]') { if (!open) return false; open = false; i++; }
  }
  return !open;
}

// Every string inside a value (for marker and junk checks).
function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

const decimals = (x) => {
  const s = String(x);
  return s.includes('.') ? s.split('.')[1].length : 0;
};

// ---------------------------------------------------------------- visuals
const VISUAL_KEYS = {
  table: ['headers', 'rows'],
  flow: ['steps'],
  bars: ['items'],
  stack: ['items', 'columns'],
  waterfall: ['start', 'steps', 'end'],
  threeStatement: ['is', 'cfs', 'bs']
};

function checkVisual(v, where) {
  const bad = (m) => err(`${where}: visual ${m}`);
  if (!v || typeof v !== 'object') return bad('must be an object');
  if (!VISUAL_KEYS[v.kind]) return bad(`has unknown kind "${v.kind}"`);
  const allowed = ['kind', 'caption', 'unit', 'dp'].concat(VISUAL_KEYS[v.kind]);
  Object.keys(v).forEach((k) => { if (!allowed.includes(k)) bad(`(${v.kind}) has unknown field "${k}"`); });
  if (v.caption != null && typeof v.caption !== 'string') bad('caption must be a string');
  if (v.unit != null && typeof v.unit !== 'string') bad('unit must be a string');
  if (v.dp != null && !(Number.isInteger(v.dp) && v.dp >= 0 && v.dp <= 3)) bad('dp must be 0–3');
  const fin = (x) => typeof x === 'number' && isFinite(x);
  const labelled = (it) => it && typeof it.label === 'string' && it.label.trim() && fin(it.value);

  switch (v.kind) {
    case 'table': {
      if (!Array.isArray(v.headers) || !v.headers.length || !v.headers.every((h) => typeof h === 'string')) bad('(table) needs headers: an array of strings');
      if (!Array.isArray(v.rows) || !v.rows.length) { bad('(table) needs rows'); break; }
      v.rows.forEach((row, i) => {
        if (!Array.isArray(row)) return bad(`(table) row ${i + 1} must be an array`);
        if (Array.isArray(v.headers) && row.length !== v.headers.length) bad(`(table) row ${i + 1} has ${row.length} cells for ${v.headers.length} headers`);
        row.forEach((c) => { if (typeof c !== 'string' && !fin(c)) bad(`(table) row ${i + 1} has a cell that isn't text or a number`); });
      });
      break;
    }
    case 'flow': {
      if (!Array.isArray(v.steps) || v.steps.length < 2) { bad('(flow) needs at least 2 steps'); break; }
      v.steps.forEach((s, i) => {
        const ok = typeof s === 'string' ? s.trim() : s && typeof s.label === 'string' && s.label.trim() && (s.note == null || typeof s.note === 'string');
        if (!ok) bad(`(flow) step ${i + 1} must be text or { label, note? }`);
      });
      break;
    }
    case 'bars': {
      if (!Array.isArray(v.items) || v.items.length < 2) { bad('(bars) needs at least 2 items'); break; }
      v.items.forEach((it, i) => { if (!labelled(it)) bad(`(bars) item ${i + 1} needs a label and a finite value`); });
      break;
    }
    case 'stack': {
      const cols = v.columns || (v.items ? [{ title: '', items: v.items }] : null);
      if (!cols || !Array.isArray(cols) || !cols.length || cols.length > 2) { bad('(stack) needs items, or 1–2 columns'); break; }
      if (v.columns && v.items) bad('(stack) use items or columns, not both');
      const totals = cols.map((col, ci) => {
        if (!col || !Array.isArray(col.items) || !col.items.length) { bad(`(stack) column ${ci + 1} needs items`); return 0; }
        if (v.columns && typeof col.title !== 'string') bad(`(stack) column ${ci + 1} needs a title`);
        col.items.forEach((it, i) => { if (!labelled(it) || it.value < 0) bad(`(stack) column ${ci + 1} item ${i + 1} needs a label and a value ≥ 0`); });
        return col.items.reduce((s, it) => s + (fin(it.value) ? it.value : 0), 0);
      });
      if (totals.length === 2 && Math.abs(totals[0] - totals[1]) > 1e-6 * Math.max(1, totals[0])) bad(`(stack) columns don't balance: ${totals[0]} vs ${totals[1]}`);
      break;
    }
    case 'waterfall': {
      if (!labelled(v.start)) bad('(waterfall) start needs { label, value }');
      if (!v.end || typeof v.end.label !== 'string') bad('(waterfall) end needs a label');
      if (!Array.isArray(v.steps) || !v.steps.length) { bad('(waterfall) needs steps'); break; }
      let run = fin(v.start && v.start.value) ? v.start.value : 0;
      const vals = [run];
      v.steps.forEach((s, i) => {
        if (!s || typeof s.label !== 'string') return bad(`(waterfall) step ${i + 1} needs a label`);
        if (s.subtotal) { if (s.delta != null) bad(`(waterfall) subtotal step ${i + 1} can't have a delta`); return; }
        if (!fin(s.delta)) return bad(`(waterfall) step ${i + 1} needs a finite delta`);
        run += s.delta;
        vals.push(s.delta);
      });
      if (v.end && v.end.value != null) {
        if (!fin(v.end.value)) bad('(waterfall) end value must be finite');
        const dp = v.dp != null ? v.dp : Math.max(...vals.concat([v.end.value]).map(decimals));
        const tol = 0.5 * Math.pow(10, -dp) * (vals.length + 1) + 1e-9;
        if (Math.abs(run - v.end.value) > tol) bad(`(waterfall) doesn't tie: start + steps = ${+run.toFixed(6)}, end = ${v.end.value}`);
      }
      break;
    }
    case 'threeStatement': {
      const lines = (arr, name) => {
        if (!Array.isArray(arr)) { bad(`(threeStatement) ${name} must be an array`); return []; }
        arr.forEach((l, i) => { if (!labelled(l)) bad(`(threeStatement) ${name} line ${i + 1} needs a label and a finite value`); });
        return arr;
      };
      lines(v.is, 'is');
      const cfs = lines(v.cfs, 'cfs');
      if (!v.bs || typeof v.bs !== 'object') { bad('(threeStatement) needs bs: { assets, le }'); break; }
      const assets = lines(v.bs.assets, 'bs.assets');
      const le = lines(v.bs.le, 'bs.le');
      const sum = (arr) => arr.reduce((s, l) => s + (fin(l.value) ? l.value : 0), 0);
      if (Math.abs(sum(assets) - sum(le)) > 1e-6) bad(`(threeStatement) balance sheet doesn't balance: assets ${sum(assets)} vs liabilities and equity ${sum(le)}`);
      const cashLine = assets.find((l) => /^cash$/i.test(l.label));
      const cashChange = cfs.find((l) => /change in cash/i.test(l.label));
      if (cashLine && cashChange && Math.abs(cashLine.value - cashChange.value) > 1e-6) bad(`(threeStatement) balance sheet cash ${cashLine.value} ≠ cash flow statement ${cashChange.value}`);
      break;
    }
  }
  strings(v).forEach((s) => { if (!markersOk(s)) bad(`has unbalanced [[ ]] in "${s.slice(0, 40)}"`); });
}

// ---------------------------------------------------------------- COVERAGE.md
function parseCoverage() {
  const text = read('COVERAGE.md');
  const modules = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const m = /^### `([a-z0-9-]+)` (.+)$/.exec(line);
    if (!m) return;
    const status = /^Target: (\d+) · Written: (\d+) · Classic: (\d+) · Status: (.+)$/.exec(lines[i + 1] || '');
    if (!status) err(`COVERAGE.md: \`${m[1]}\` needs a status line right below its heading`);
    const trackHeading = lines.slice(0, i).reverse().find((l) => /^## /.test(l)) || '';
    modules.push({ id: m[1], name: m[2].trim(), line: i + 1, target: status ? +status[1] : 0, status: status ? status[4].trim() : '?', trackHeading });
  });
  const drills = [...text.matchAll(/^- \[( |x)\] `(drill-[a-z0-9-]+)`/gm)].map((m) => ({ id: m[2], ticked: m[1] === 'x' }));
  return { text, modules, drills };
}

// ---------------------------------------------------------------- similarity
const STOP = new Set('a an the of to and or in on for is are be what whats how why do does you your it its with at by that this which would can if as from their there when than then into about'.split(' '));
function tokens(q) {
  return plain(q).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9%$.\s-]/g, ' ').split(/\s+/)
    .filter((w) => w && !STOP.has(w));
}
function trigrams(q) {
  const s = ' ' + tokens(q).join(' ') + ' ';
  const set = new Set();
  for (let i = 0; i < s.length - 2; i++) set.add(s.slice(i, i + 3));
  return set;
}
function jaccard(a, b) {
  let inter = 0;
  a.forEach((x) => { if (b.has(x)) inter++; });
  return inter / (a.size + b.size - inter || 1);
}

// ================================================================ run
function main() {
  // ---- files and index.html
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  const dataFiles = listJs('data');
  const drillFiles = listJs('drills').filter((f) => f !== 'drills/engine.js');
  const expected = ['deck.js', ...dataFiles, 'drills/engine.js', ...drillFiles, 'visuals.js', 'app.js'];
  expected.forEach((f) => { if (!scripts.includes(f)) err(`index.html doesn't load ${f}`); });
  scripts.forEach((s) => {
    if (!exists(s)) err(`index.html loads ${s}, which doesn't exist`);
    else if (!expected.includes(s)) warn(`index.html loads ${s}, which isn't a data or drill file`);
  });
  const at = (f) => scripts.indexOf(f);
  if (at('deck.js') !== 0) err('index.html: deck.js must load first');
  if (at('app.js') !== scripts.length - 1) err('index.html: app.js must load last');
  dataFiles.forEach((f) => { if (at(f) > at('drills/engine.js')) err(`index.html: ${f} must load before drills/engine.js`); });
  drillFiles.forEach((f) => { if (at(f) < at('drills/engine.js')) err(`index.html: ${f} must load after drills/engine.js`); });
  if (at('visuals.js') > at('app.js')) err('index.html: visuals.js must load before app.js');
  scripts.forEach((s) => {
    const tag = html.match(new RegExp(`<script[^>]*src="${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`));
    if (tag && !/\bdefer\b/.test(tag[0])) warn(`index.html: ${s} should use defer so the page paints before data loads`);
  });

  // ---- service worker and versions
  const sw = read('sw.js');
  const swVersion = (/const VERSION = (\d+);/.exec(sw) || [])[1];
  const appVersion = (/const APP_VERSION = (\d+);/.exec(read('app.js')) || [])[1];
  if (!swVersion) err('sw.js: missing "const VERSION = <number>;"');
  if (!appVersion) err('app.js: missing "const APP_VERSION = <number>;"');
  if (swVersion && appVersion && swVersion !== appVersion) err(`Version mismatch: sw.js ${swVersion}, app.js ${appVersion} (run node tools/bump.js)`);
  const assetBlock = (/const ASSETS = \[([\s\S]*?)\];/.exec(sw) || [])[1] || '';
  const assets = [...assetBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  if (!assets.length) err('sw.js: no ASSETS list found');
  const referenced = new Set(scripts);
  [...html.matchAll(/<link\b[^>]*\bhref="([^"#]+)"/g)].forEach((m) => referenced.add(m[1]));
  referenced.add('index.html');
  try {
    JSON.parse(read('manifest.webmanifest')).icons.forEach((i) => referenced.add(i.src));
  } catch (e) { err(`manifest.webmanifest: ${e.message}`); }
  referenced.forEach((f) => { if (!/^https?:/.test(f) && !assets.includes(f)) err(`sw.js ASSETS is missing ${f}`); });
  assets.filter((a) => a !== './').forEach((a) => { if (!exists(a)) err(`sw.js caches ${a}, which doesn't exist`); });
  checkVersionBump(swVersion);

  // ---- cards
  const ctx = vm.createContext({ console });
  vm.runInContext(read('deck.js'), ctx, { filename: 'deck.js' });
  const Deck = ctx.Deck;
  const original = Deck.add;
  const raw = [];
  let current = null;
  Deck.add = (list) => {
    if (Array.isArray(list)) list.forEach((c) => raw.push({ card: c, file: current }));
    else err(`${current}: Deck.add needs an array`);
    return original(list);
  };
  dataFiles.forEach((f) => {
    current = f;
    try { vm.runInContext(read(f), ctx, { filename: f }); } catch (e) { err(`${f}: ${e.message}`); }
  });

  const cov = parseCoverage();
  const covIds = new Set(cov.modules.map((m) => m.id));
  const deckModules = new Map(Deck.modules.map((m) => [m.id, m]));
  Deck.modules.forEach((m) => {
    if (!covIds.has(m.id)) err(`deck.js module ${m.id} isn't in COVERAGE.md`);
    if (!TRACKS.includes(m.track)) err(`deck.js module ${m.id} has unknown track ${m.track}`);
  });
  cov.modules.forEach((m) => {
    const d = deckModules.get(m.id);
    if (!d) return err(`COVERAGE.md module ${m.id} isn't registered in deck.js`);
    if (d.name !== m.name) warn(`Module name differs: deck.js "${d.name}" vs COVERAGE.md "${m.name}"`);
  });
  dataFiles.forEach((f) => {
    const slug = path.basename(f, '.js');
    if (!deckModules.has(slug)) err(`${f}: file name isn't a module slug`);
  });

  const seen = new Map();
  const perModule = new Map(Deck.modules.map((m) => [m.id, { cards: 0, classic: 0, primer: 0, levels: [0, 0, 0] }]));
  raw.forEach(({ card: c, file }) => {
    const where = `${file} ${c && c.id ? c.id : '(no id)'}`;
    if (!c || typeof c !== 'object') return err(`${file}: a card isn't an object`);
    Object.keys(c).forEach((k) => { if (!CARD_FIELDS.includes(k)) err(`${where}: unknown field "${k}"`); });
    ['id', 'track', 'module', 'topic', 'q', 'a'].forEach((k) => {
      if (typeof c[k] !== 'string' || !c[k].trim()) err(`${where}: "${k}" is required`);
    });
    if (typeof c.id !== 'string') return;
    if (seen.has(c.id)) err(`${where}: duplicate id (also in ${seen.get(c.id)})`);
    seen.set(c.id, file);
    const idm = /^([a-z]+(?:-[a-z]+)*)-(\d{3})$/.exec(c.id);
    if (!idm) err(`${where}: id must look like <module>-<nnn>`);
    else if (idm[1] !== c.module) err(`${where}: id prefix doesn't match module ${c.module}`);
    const mod = deckModules.get(c.module);
    if (!mod) err(`${where}: unknown module ${c.module}`);
    else if (mod.track !== c.track) err(`${where}: track ${c.track} doesn't match module track ${mod.track}`);
    if (file !== `data/${c.module}.js`) err(`${where}: cards for ${c.module} belong in data/${c.module}.js`);
    if (!TRACKS.includes(c.track)) err(`${where}: track must be one of ${TRACKS.join(', ')}`);
    if (![1, 2, 3].includes(c.level)) err(`${where}: level must be 1, 2 or 3`);
    if (!TYPES.includes(c.type)) err(`${where}: type must be one of ${TYPES.join(', ')}`);
    if (c.classic != null && typeof c.classic !== 'boolean') err(`${where}: classic must be true or false`);
    ['why', 'formula', 'example', 'trap'].forEach((k) => {
      if (c[k] != null && (typeof c[k] !== 'string' || !c[k].trim())) err(`${where}: "${k}" must be non-empty text when present`);
    });

    if (typeof c.q === 'string' && plain(c.q).length > LIMITS.q) err(`${where}: q is ${plain(c.q).length} characters (max ${LIMITS.q})`);
    const aMax = c.type === 'walk' ? LIMITS.aWalk : c.type === 'primer' ? LIMITS.aPrimer : LIMITS.a;
    if (typeof c.a === 'string' && words(c.a) > aMax) err(`${where}: a is ${words(c.a)} words (max ${aMax})`);
    ['why', 'example', 'trap'].forEach((k) => {
      if (typeof c[k] === 'string' && words(c[k]) > LIMITS[k]) err(`${where}: ${k} is ${words(c[k])} words (max ${LIMITS[k]})`);
    });
    if (c.type !== 'primer' && !c.why) warn(`${where}: no "why"`);
    if (typeof c.formula === 'string' && c.formula.split('\n').length > 4) warn(`${where}: formula has more than 4 lines`);
    ['q', 'a', 'why', 'formula', 'example', 'trap'].forEach((k) => {
      if (typeof c[k] !== 'string') return;
      if (!markersOk(c[k])) err(`${where}: unbalanced [[ ]] in ${k}`);
      if (/\b(TODO|TBD|FIXME|lorem)\b/i.test(c[k])) err(`${where}: placeholder text in ${k}`);
    });
    if (c.visual != null) checkVisual(c.visual, where);

    const s = perModule.get(c.module);
    if (s) {
      s.cards++;
      if (c.classic) s.classic++;
      if (c.type === 'primer') s.primer++;
      if ([1, 2, 3].includes(c.level)) s.levels[c.level - 1]++;
    }
  });
  Deck.problems.forEach((p) => err(`deck.js: ${p}`));

  const all = raw.map((r) => r.card).filter((c) => c && typeof c.q === 'string');
  const primers = all.filter((c) => c.type === 'primer').length;
  if (all.length && primers / all.length > 0.1) err(`Primers are ${(100 * primers / all.length).toFixed(1)}% of the deck (max 10%)`);

  // ---- near-duplicate questions
  const prepared = all.filter((c) => c.type !== 'primer').map((c) => ({ c, t: new Set(tokens(c.q)), g: trigrams(c.q) }));
  for (let i = 0; i < prepared.length; i++) {
    for (let j = i + 1; j < prepared.length; j++) {
      const A = prepared[i], B = prepared[j];
      if (A.c.type === 'walk' && B.c.type === 'walk' && A.c.module === B.c.module && A.c.module === 'ib-walk') continue;
      const tok = A.t.size >= 3 && B.t.size >= 3 ? jaccard(A.t, B.t) : 0;
      const tri = jaccard(A.g, B.g);
      if (tok >= 0.75 || tri >= 0.72) warn(`Possible near-duplicates (${Math.round(100 * Math.max(tok, tri))}%): ${A.c.id} / ${B.c.id}`);
    }
  }

  // ---- drills
  const dctx = vm.createContext({ console });
  let Drills = null;
  try {
    vm.runInContext(read('drills/engine.js'), dctx, { filename: 'drills/engine.js' });
    Drills = dctx.Drills;
  } catch (e) { err(`drills/engine.js: ${e.message}`); }
  const drillStats = [];
  if (Drills) {
    selfTest(Drills);
    const fileOf = new Map();
    drillFiles.forEach((f) => {
      const before = Drills.list.length;
      try { vm.runInContext(read(f), dctx, { filename: f }); } catch (e) { err(`${f}: ${e.message}`); }
      Drills.list.slice(before).forEach((d) => fileOf.set(d.id, f));
    });
    Drills.problems.forEach((p) => err(`drills: ${p}`));
    const covDrills = new Set(cov.drills.map((d) => d.id));
    Drills.list.forEach((d) => {
      const where = d.id;
      const m = /^drill-(ib|re|hotel)-[a-z0-9-]+$/.exec(d.id);
      if (!m) err(`${where}: id must look like drill-<track>-<name>`);
      else if (m[1] !== d.track) err(`${where}: id track doesn't match track ${d.track}`);
      if (fileOf.get(d.id) !== `drills/${d.track}.js`) err(`${where}: belongs in drills/${d.track}.js`);
      const mod = deckModules.get(d.module);
      if (!mod) err(`${where}: unknown module ${d.module}`);
      else if (mod.track !== d.track) err(`${where}: module ${d.module} isn't in track ${d.track}`);
      if (![1, 2, 3].includes(d.level)) err(`${where}: level must be 1, 2 or 3`);
      if (typeof d.topic !== 'string' || !d.topic.trim()) err(`${where}: topic is required`);
      if (!d.ranges || !Object.keys(d.ranges).length) err(`${where}: needs ranges for its key results`);
      if (!covDrills.has(d.id)) err(`${where}: not listed in the COVERAGE.md drill list`);
      drillStats.push(runDrill(Drills, d));
    });
  }

  // ---- report
  if (ARGS.has('--update-coverage')) updateCoverage(cov, perModule, Drills);
  printSummary(Deck, cov, perModule, drillStats, all.length, primers);
  const failed = errors.length || (ARGS.has('--strict') && warnings.length);
  process.exit(failed ? 1 : 0);
}

function runDrill(Drills, d) {
  const where = d.id;
  const stat = { id: d.id, ok: 0, checkFails: 0, errors: 0 };
  const junk = /\b(NaN|Infinity|undefined|null)\b|\[object /;
  const report = new Set();
  const once = (key, msg) => { if (!report.has(key)) { report.add(key); err(msg); } };
  for (let k = 0; k < DRILL_SEEDS; k++) {
    const seed = (Math.imul(k + 1, 2654435761) >>> 0) || 1;
    let p;
    try { p = Drills.run(d.id, seed); } catch (e) { stat.errors++; once('throw', `${where}: make() threw on seed ${seed}: ${e.message}`); continue; }
    let bad = false;
    const fail = (key, msg) => { bad = true; once(key, `${where} (seed ${seed}): ${msg}`); };
    ['q', 'a', 'why', 'formula'].forEach((f) => { if (typeof p[f] !== 'string' || !p[f].trim()) fail('field-' + f, `${f} is missing`); });
    if (!Array.isArray(p.steps) || !p.steps.length || !p.steps.every((s) => typeof s === 'string' && s.trim())) fail('steps', 'steps must be a non-empty list of text');
    if (typeof p.q === 'string' && plain(p.q).length > LIMITS.drillQ) fail('qlen', `q is ${plain(p.q).length} characters (max ${LIMITS.drillQ})`);
    strings([p.q, p.a, p.why, p.formula, p.steps, p.visual]).forEach((s) => {
      if (junk.test(s)) fail('junk', `text contains NaN, Infinity, undefined or null: "${s.slice(0, 80)}"`);
      if (!markersOk(s)) fail('markers', `unbalanced [[ ]] in "${s.slice(0, 60)}"`);
    });
    if (p.visual != null) {
      const before = errors.length;
      checkVisual(p.visual, `${where} (seed ${seed})`);
      if (errors.length > before) {
        const found = errors.splice(before);
        fail('visual', found[0].replace(`${where} (seed ${seed}): `, ''));
      }
    }
    if (!p.values || typeof p.values !== 'object') fail('values', 'make() must return values');
    else {
      Object.entries(p.values).forEach(([k, v]) => { if (typeof v === 'number' && !isFinite(v)) fail('nan-' + k, `values.${k} is ${v}`); });
      Object.entries(d.ranges || {}).forEach(([k, [lo, hi]]) => {
        const v = p.values[k];
        if (typeof v !== 'number') fail('range-missing-' + k, `ranges names ${k}, but values.${k} isn't a number`);
        else if (v < lo || v > hi) fail('range-' + k, `values.${k} = ${v} is outside [${lo}, ${hi}]`);
      });
    }
    let checked = false;
    try { checked = d.check(p) === true; } catch (e) { fail('check-throw', `check() threw: ${e.message}`); }
    if (!checked) { stat.checkFails++; fail('check', 'check() failed'); }
    if (k < 25 && JSON.stringify(Drills.run(d.id, seed)) !== JSON.stringify(p)) fail('determinism', 'same seed gave different output');
    if (!bad) stat.ok++;
  }
  return stat;
}

// The number formatting has to be right for every drill, so test it directly.
function selfTest(Drills) {
  const { fmt, round, irr, constant } = Drills;
  const cases = [
    [fmt.money(149760), '$150K'], [fmt.money(999600), '$1.00M'], [fmt.money(19.5e6), '$19.5M'],
    [fmt.money(22153846), '$22.2M'], [fmt.money(1.44e6), '$1.44M'], [fmt.money(1.25e9), '$1.25B'],
    [fmt.money(9450), '$9,450'], [fmt.money(-266000), '−$266K'], [fmt.money(99999), '$100K'],
    [fmt.money(9999000), '$10.0M'], [fmt.money(23400), '$23.4K'], [fmt.money(19.5e6, 2), '$19.50M'],
    [fmt.pct(0.0625), '6.25%'], [fmt.pct(0.065), '6.5%'], [fmt.pct(0.07), '7.0%'], [fmt.pct(0.07, 0), '7%'],
    [fmt.mult(1.25, 2), '1.25x'], [fmt.millions(9230), '$9,230M'], [fmt.inM(520000), '$0.52M'],
    [fmt.dollars(212.5, 2), '$212.50'], [fmt.signed(-7.5, 1), '−7.5'], [fmt.signed(2.5, 1), '+2.5'],
    [fmt.bps(0.0125), '125 bps'], [String(round(1.005, 2)), '1.01'], [String(round(-2.5, 0)), '-3']
  ];
  cases.forEach(([got, want]) => { if (got !== want) err(`drills/engine.js formatting: expected "${want}", got "${got}"`); });
  const r = irr([-100, 0, 0, 0, 0, 200]);
  if (Math.abs(r - (Math.pow(2, 0.2) - 1)) > 1e-9) err(`drills/engine.js: irr() returned ${r} for 2x over 5 years`);
  const r2 = irr([-10, 0.6, 0.6, 0.6, 0.6, 11.6]);
  if (Math.abs(r2 - 0.0771430) > 1e-6) err(`drills/engine.js: irr() returned ${r2}, expected about 7.714%`);
  if (Math.abs(constant(0.06, 30) - 0.0719461) > 1e-6) err(`drills/engine.js: constant(6%, 30y) returned ${constant(0.06, 30)}`);
}

// Warn when app files changed since the last commit but the version wasn't bumped (the service worker
// would keep serving the old cache).
function checkVersionBump(version) {
  try {
    execSync('git rev-parse --verify HEAD', { cwd: ROOT, stdio: 'ignore' });
  } catch (e) { return; }
  try {
    const head = execSync('git show HEAD:sw.js', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const headVersion = (/const VERSION = (\d+);/.exec(head) || [])[1];
    const changed = execSync("git status --porcelain -- . ':!*.md' ':!tools'", { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().split('\n').filter(Boolean);
    if (changed.length && headVersion === version) warn(`App files changed since the last commit but VERSION is still ${version}. Run node tools/bump.js before you push.`);
  } catch (e) { /* not a repo or no git: skip */ }
}

function updateCoverage(cov, perModule, Drills) {
  let text = cov.text;
  const registered = new Set(Drills ? Drills.list.map((d) => d.id) : []);
  text = text.replace(/^(### `([a-z0-9-]+)` .+\n)Target: (\d+) · Written: \d+ · Classic: \d+ · Status: (.+)$/gm, (all, head, id, target, status) => {
    const s = perModule.get(id) || { cards: 0, classic: 0 };
    return `${head}Target: ${target} · Written: ${s.cards} · Classic: ${s.classic} · Status: ${status}`;
  });
  text = text.replace(/^- \[( |x)\] `(drill-[a-z0-9-]+)`/gm, (all, mark, id) => `- [${registered.has(id) ? 'x' : ' '}] \`${id}\``);

  const trackName = { ib: 'IB', re: 'Real estate', hotel: 'Hotels' };
  const rows = [];
  const tot = { modules: 0, target: 0, cards: 0, classic: 0, built: 0, planned: 0 };
  ['ib', 're', 'hotel'].forEach((t) => {
    const mods = cov.modules.filter((m) => (Deck().module(m.id) || {}).track === t);
    const r = { modules: mods.length, target: 0, cards: 0, classic: 0 };
    mods.forEach((m) => { const s = perModule.get(m.id) || { cards: 0, classic: 0 }; r.target += m.target; r.cards += s.cards; r.classic += s.classic; });
    const planned = cov.drills.filter((d) => d.id.startsWith(`drill-${t}-`));
    const built = planned.filter((d) => registered.has(d.id)).length;
    rows.push(`| ${trackName[t]} | ${r.modules} | ${r.target} | ${r.cards} | ${r.classic} | ${built} of ${planned.length} |`);
    tot.modules += r.modules; tot.target += r.target; tot.cards += r.cards; tot.classic += r.classic; tot.built += built; tot.planned += planned.length;
  });
  const table = ['| Track | Modules | Target | Written | Classic | Drills built |', '|---|---:|---:|---:|---:|---:|']
    .concat(rows)
    .concat([`| **Total** | **${tot.modules}** | **${tot.target}** | **${tot.cards}** | **${tot.classic}** | **${tot.built} of ${tot.planned}** |`]).join('\n');
  text = text.replace(/<!-- summary:start -->[\s\S]*?<!-- summary:end -->/, `<!-- summary:start -->\n${table}\n<!-- summary:end -->`);
  if (text !== cov.text) {
    fs.writeFileSync(path.join(ROOT, 'COVERAGE.md'), text);
    console.log('Updated COVERAGE.md counts.\n');
  }
}

// deck.js registry, loaded once for helpers that need module lookups.
let deckCache = null;
function Deck() {
  if (!deckCache) {
    const c = vm.createContext({});
    vm.runInContext(read('deck.js'), c);
    deckCache = c.Deck;
  }
  return deckCache;
}

function printSummary(D, cov, perModule, drillStats, cardCount, primers) {
  const pad = (s, n) => String(s).padEnd(n);
  const lpad = (s, n) => String(s).padStart(n);
  const out = [];
  out.push('Module                  Cards  Target  Classic   L1  L2  L3  Status');
  out.push('─'.repeat(78));
  ['ib', 're', 'hotel'].forEach((t) => {
    cov.modules.filter((m) => (D.module(m.id) || {}).track === t).forEach((m) => {
      const s = perModule.get(m.id) || { cards: 0, classic: 0, levels: [0, 0, 0] };
      out.push(`${pad(m.id, 22)}${lpad(s.cards, 7)}${lpad(m.target, 8)}${lpad(s.classic, 9)}${lpad(s.levels[0], 5)}${lpad(s.levels[1], 4)}${lpad(s.levels[2], 4)}  ${m.status}`);
    });
  });
  const target = cov.modules.reduce((s, m) => s + m.target, 0);
  const classic = [...perModule.values()].reduce((s, x) => s + x.classic, 0);
  out.push('─'.repeat(78));
  out.push(`${pad('Total', 22)}${lpad(cardCount, 7)}${lpad(target, 8)}${lpad(classic, 9)}   primers ${primers} (${cardCount ? (100 * primers / cardCount).toFixed(0) : 0}%)`);
  out.push('');
  out.push(`Drills: ${drillStats.length} registered, ${DRILL_SEEDS} seeds each`);
  drillStats.forEach((d) => out.push(`  ${pad(d.id, 30)} ${d.ok === DRILL_SEEDS ? 'ok' : `${d.ok}/${DRILL_SEEDS} clean, ${d.checkFails} check failures, ${d.errors} errors`}`));
  out.push('');
  console.log(out.join('\n'));

  const verbose = ARGS.has('--verbose');
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    (verbose ? warnings : warnings.slice(0, 15)).forEach((w) => console.log('  - ' + w));
    if (!verbose && warnings.length > 15) console.log(`  … ${warnings.length - 15} more (use --verbose)`);
    console.log('');
  }
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.forEach((e) => console.log('  ✗ ' + e));
    console.log('\nFAILED');
  } else {
    console.log(`OK: ${cardCount} cards, ${drillStats.length} drills, no errors.`);
  }
}

main();
