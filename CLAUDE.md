# Technicals: notes for Claude

A personal swipe feed of IB, real estate and hotel technicals: plain HTML/CSS/JS, no build step, no dependencies, no external requests. It must work from `file://` (so card data loads via `<script>` tags, never fetch) and on GitHub Pages as an installable, offline PWA. Live at https://danitookoff.github.io/technicals/ (GitHub Pages from `main` of danitookoff/technicals; commits use the account's no-reply email). README.md explains the app; COVERAGE.md is the content map and the place to resume ("Continue from COVERAGE.md").

## Status

Phase 2 (app, sample deck of 50 cards, 10 drills, validator, first deploy) is done and waiting for the owner's feedback on style, answer length and difficulty. Don't write Phase 3 content until that feedback is in. Build phases 3–5 are described in the "Where things stand" section of COVERAGE.md.

## Files

- `deck.js`: `Deck.add`, module registry (id, track, full name matching COVERAGE.md, short caption name; order = study order), `[[ ]]` markup helpers.
- `data/<module>.js`: one file per module, each `Deck.add([...])`. File name = module slug.
- `drills/engine.js` (RNG, formatting, IRR solver), `drills/{ib,re,hotel}.js` (one file per track).
- `visuals.js`, `app.js`, `styles.css`, `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`.
- `tools/validate.js`, `tools/bump.js`, `tools/icons.js`.

## Card schema

```js
{
  id: "re-debt-006",      // `${module}-${nnn}`; next free number in that module. Never renumber or reuse.
  track: "re",            // "ib" | "re" | "hotel", must match the module's track
  module: "re-debt",      // slug from COVERAGE.md and deck.js
  topic: "Loan sizing",   // short, sentence case
  level: 2,               // 1 must know cold, 2 standard interview, 3 advanced / on the job / modeling test
  type: "qa",             // "qa" | "walk" (walk me through) | "primer" (short lesson; q is "Primer: ...")
  classic: true,          // optional; one of the most commonly asked questions
  q: "...",               // ≤ 220 characters
  a: "...",               // ≤ 60 words (walk ≤ 80, primer lesson ≤ 90); first sentence answers the question
  why: "...",             // ≤ 110 words; teaches the reasoning (for primers: key terms)
  formula: "a = b ÷ c\n...",   // optional, ≤ 4 lines
  example: "...",         // optional, ≤ 90 words; given inputs in [[ ]], calculated figures plain
  trap: "...",            // optional, ≤ 45 words; the classic wrong answer or next follow-up
  visual: { kind: "table" | "flow" | "bars" | "stack" | "waterfall" | "threeStatement", ... }
}
```

Visual shapes are checked by `tools/validate.js` (see `checkVisual`); existing cards show each kind. Primers stay at 10% of the deck or less.

## Content rules (short)

Accuracy over volume; US GAAP by default with IFRS noted where it changes the answer; where practice varies, say so and give the common convention. Every number ties: recompute every example with a scratch script before finishing a batch. Walk-throughs state the tax rate (default 25%). One idea per card, no near-duplicates, no trivia. Own words only. Fictional companies, illustrative numbers, never current market levels as fact (typical ranges as rough). Plain language, sentence case, define jargon (usually in the primer). The owner learns best from reasoning: `why` must teach how to think about it.

## Workflows

- **"Add 30 cards on hotel management agreements":** edit `data/hotel-agreements.js`, continue from the highest existing ID, write the cards, recompute every number, run `node tools/validate.js --update-coverage`, tick the covered subtopics and update the Status in COVERAGE.md, then bump, commit, push.
- **"Fix these flagged cards: ...":** flags arrive as `id: question` plus `Note:` lines (drills include a seed). Edit the card in place, keeping its ID. For a drill, reproduce with `Drills.run(id, seed)` in Node.
- **New module file:** add `<script defer src="data/<slug>.js">` to index.html before `drills/engine.js`; `bump.js` adds it to the service worker cache.
- **New drill:** `Drills.add({ id: 'drill-<track>-<name>', track, module, topic, level, ranges, make(r), check(p) })` in `drills/<track>.js`. `make` returns `{ q, a, why, formula, steps, visual?, values }`; `check` must re-derive the answer a different way. List the ID in COVERAGE.md's drill list.
- **Every change:** `node tools/validate.js` (must print OK) → `node tools/bump.js` → `git add -A && git commit` → `git push`.

## Never

- Never rename `STORE_KEY` (`technicals.progress.v1`) or change the progress shape without a migration in `Store.normalize`. Progress is keyed by card ID, so IDs are permanent.
- Never add fetch/XHR, CDN scripts or web fonts.

## Testing

`python3 -m http.server 8765` serves the app. The service worker caches everything, so after edits either bump the version or unregister it (Playwright: `navigator.serviceWorker.getRegistrations()` → `unregister()`, then clear `caches`). The app flushes progress on `pagehide`, so dispatch `pagehide` before editing localStorage in a test. Only about six cards are in the DOM at once; move through the feed one card at a time (J/K) or open specific cards through search.
