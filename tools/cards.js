#!/usr/bin/env node
/* A compact view of the deck, for checking overlap and finding IDs without reading whole files.
     node tools/cards.js                   one line per card: id, level, topic, question
     node tools/cards.js re-debt hotel-val only these modules
     node tools/cards.js --grep "debt yield"  cards whose text mentions all the words (any field)
     node tools/cards.js --next re-debt    the next free ID in a module
     node tools/cards.js --topics          topics only, grouped by module (shortest overview) */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ROOT, 'deck.js'), 'utf8'), ctx);
for (const f of fs.readdirSync(path.join(ROOT, 'data')).filter((x) => x.endsWith('.js')).sort()) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'), ctx, { filename: f }); } catch (e) { console.error(`${f}: ${e.message}`); }
}
const Deck = ctx.Deck;
const plain = (t) => String(t || '').replace(/\[\[|\]\]/g, '');
const args = process.argv.slice(2);

if (args[0] === '--next') {
  const mod = args[1];
  const nums = Deck.cards.filter((c) => c.module === mod).map((c) => parseInt(c.id.slice(-3), 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  console.log(`${mod}-${String(next).padStart(3, '0')}`);
  process.exit(0);
}

if (args[0] === '--topics') {
  for (const m of Deck.modules) {
    const cards = Deck.cards.filter((c) => c.module === m.id);
    if (cards.length) console.log(`${m.id} (${cards.length}): ${cards.map((c) => c.topic).join('; ')}`);
  }
  process.exit(0);
}

let cards = Deck.cards;
if (args[0] === '--grep') {
  const terms = args.slice(1).join(' ').toLowerCase().split(/\s+/).filter(Boolean);
  cards = cards.filter((c) => {
    const text = plain([c.q, c.a, c.why, c.example, c.trap, c.formula, c.topic].join(' ')).toLowerCase();
    return terms.every((t) => text.includes(t));
  });
} else if (args.length) {
  cards = cards.filter((c) => args.includes(c.module));
}

for (const c of cards) {
  const q = plain(c.q);
  console.log(`${c.id}  L${c.level}${c.classic ? '*' : ' '} ${c.type === 'qa' ? '  ' : c.type[0].toUpperCase() + ' '}${c.topic} | ${q.length > 110 ? q.slice(0, 107) + '...' : q}`);
}
console.error(`${cards.length} cards`);
