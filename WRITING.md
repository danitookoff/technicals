# Writing cards and drills

The house style for Technicals content. The owner approved the 50 sample cards (style, length and difficulty), so new cards should read like them. Good references: `data/re-debt.js`, `data/re-noi.js`, `data/hotel-metrics.js`, `data/ib-walk.js`.

## Who it's for

A finance student recruiting for real estate and hotel ownership roles (asset management, acquisitions, development and feasibility, capital markets, CRE and hotel lending), still interviewing for some banking roles. IB fundamentals are solid (has built comps, DCFs and LBOs), so IB basics belong in the deck but should clear quickly. Real estate and hotels are newer: build from the fundamentals up to pro forma, debt sizing and waterfall level. They learn fastest by understanding how to think about something, so **every answer teaches the reasoning, not just the definition.**

The bar: everything a top IB, REPE or real estate asset management, CRE lending or hotel investment interview, superday or modeling test could ask, plus what an analyst actually does on the job.

## The card

Fields in this order, double-quoted strings, one field per line, exactly as the existing data files:

```js
{
  id: "re-debt-006",
  track: "re",
  module: "re-debt",
  topic: "Mortgage constant",
  level: 2,
  type: "qa",
  classic: true,
  q: "...",
  a: "...",
  why: "...",
  formula: "...",
  example: "...",
  trap: "...",
  visual: { ... }
},
```

- **id**: `${module}-${nnn}`, continuing from the highest number already in the file. Never renumber, reuse or change an existing ID; progress is keyed to it. Don't rewrite existing cards unless one is actually wrong.
- **topic**: a short noun phrase in sentence case ("Debt yield", "Base-year recoveries"). It shows in the caption.
- **level**: 1 = must know cold (definitions and mechanics any interviewer expects); 2 = standard interview question that needs reasoning or a calculation; 3 = advanced: superday, modeling test or on-the-job nuance. Aim for roughly 35% level 1, 45% level 2, 20% level 3, and order doesn't matter (the app sorts by level).
- **type**: `qa` for most; `walk` for "walk me through" questions; `primer` for the module's short lesson.
- **classic**: `true` only for the questions interviewers ask most, typically 15–30% of a module. Leave it out otherwise.
- **q** (≤ 220 characters): what an interviewer or a modeling test would actually ask. Specific and answerable; include the numbers when the question is numeric.
- **a** (≤ 60 words; walk-throughs ≤ 80): what you'd say out loud. **The first sentence answers the question.** No throat-clearing, no "it depends" without saying on what.
- **why** (≤ 110 words): teaches the reasoning: the mechanism, the intuition, the "because". It must add something `a` doesn't; never restate it. Where practice varies, say so and give the common convention.
- **formula** (optional, ≤ 4 lines): equations in words, one per line, with ÷ and ×.
- **example** (optional, ≤ 90 words): a worked example with fictional, illustrative numbers. **Given inputs go in `[[ ]]` (they render blue); calculated figures stay plain.** It must tie exactly.
- **trap** (optional, ≤ 45 words): the classic wrong answer, or the follow-up an interviewer asks next.
- **visual** (optional): only when it genuinely helps. Schemas below.

Word limits count every space-separated token, so `$1.8M ÷ 9%` is three words. The front (`q`) and the answer must fit a phone screen; the Explain sheet may scroll.

### Primers

Each module has **one** primer (`type: "primer"`, level 1): `q` is `"Primer: <what it covers>"`, `a` is a lesson of at most 90 words that orients a newcomer to the module, and `why` holds **key terms**: short definitions of the jargon the module uses. A visual (often `flow` or `table`) is welcome. If the module already has a primer, don't add another. Primers must stay under 10% of the deck.

### Walk-throughs of the three statements (ib-walk)

State the tax rate in the answer (default 25%). Give income statement, cash flow statement and balance sheet effects in that order and end by confirming the balance sheet balances. Always include a `threeStatement` visual. Say which convention you use where interviews differ (for example, whether stock comp is treated as deductible now).

## Voice

- Plain, direct and calm. Sentence case everywhere. No hype, no exclamation marks, no filler ("Great question", "Basically", "It's important to note").
- Short sentences. Active verbs. Say "you" for the analyst or buyer when it reads naturally.
- Define jargon the first time the module uses it, usually in the primer's key terms.
- No Oxford comma ("taxes, insurance and maintenance"). Straight quotes. The minus sign for negatives is `−` (U+2212): `−$134K`.
- Numbers the way a professional writes them: `$1.8M`, `$450K`, `$19.5M`, `6.5%`, `1.25x`, `125 bps`, `$42/SF` or `$42 per SF`, `$300K per key`. Round sensibly and consistently.
- Write everything in your own words. Don't reproduce text from interview guides, textbooks or courses.

## Accuracy rules

1. **Accuracy beats volume.** Use standard, widely taught conventions. Default to US GAAP and note IFRS wherever it changes the answer. Where practice varies (mid-year convention, adding back stock comp, leases in the EV bridge, reserves above or below NOI, hotel NOI after the FF&E reserve), say so and give the common convention.
2. **Every number ties.** Before you finish, recompute every figure in every `example`, `a` and visual with a scratch Node script and fix anything that doesn't reconcile. Waterfalls must add up; three-statement visuals must balance.
3. **Fictional companies and properties only** ("a 200-unit apartment building", "Company A"). Generic references to real institutions or programs are fine where they are the subject (agency lenders, CMBS, STR comp-set reports, Section 382, 1031 exchanges). Don't use real public companies as examples.
4. **Never state current market levels as fact** (rates, spreads, cap rates, fee levels). Present typical ranges as rough ("often", "roughly", "commonly around"), and prefer mechanics over market commentary. Conventions such as a 4% FF&E reserve are described as conventions, not rules.
5. **One idea per card, no near-duplicates, no trivia.** Before writing, skim the other `data/*.js` files so you don't repeat a card that exists in another module. A family of related walk-throughs is fine.
6. **Tag levels consistently** and set `classic: true` only on the most commonly asked questions.

Common conventions to get right: DSCR divides NOI by total debt service (interest and principal); debt yield divides NOI by the loan amount; cap rates are quoted on forward or trailing NOI (say which); equity multiple is total distributions ÷ equity invested; cash-on-cash is annual cash flow after debt service ÷ equity; unlevered free cash flow is EBIT × (1 − t) + D&A − capex − increase in NWC; equity value uses diluted shares; Gordon growth terminal value uses next year's cash flow; hotel management base fees are on total revenue; RevPAR = occupancy × ADR.

## Visuals

All numbers are plain numbers (no strings) unless noted. Optional on every kind: `caption` (text), `unit` (for example `"$M"`, `"$K"`, `"$"`, `"%"`, `"x"`, `"$/SF"`), `dp` (decimals, 0–3). Text may use `[[ ]]`.

- **table**: `{ kind: "table", headers: ["", "Col A", "Col B"], rows: [["Row", "…", "…"], ...] }`. Every row has as many cells as there are headers. A blank first header makes the first column row labels. Cells are text or numbers; mark given inputs with `[[ ]]`.
- **flow**: `{ kind: "flow", steps: [{ label: "Step", note: "optional detail" }, ...] }`, at least 2 steps. Use for processes and orderings.
- **bars**: `{ kind: "bars", unit: "$M", items: [{ label: "LTV", value: 19.5, highlight: true }, ...] }`, at least 2 items. Highlight the answer or the binding item.
- **stack**: one column `{ kind: "stack", unit: "%", items: [{ label, value, highlight? }, ...] }` (listed top to bottom), or two columns `{ kind: "stack", unit: "$M", columns: [{ title: "Uses", items: [...] }, { title: "Sources", items: [...] }] }`, which must total the same. Use for capital stacks and sources and uses.
- **waterfall**: `{ kind: "waterfall", unit: "$M", start: { label, value }, steps: [{ label, delta }, { label: "Subtotal", subtotal: true }, ...], end: { label, value } }`. `start + deltas` must equal `end`. Use for bridges (GPR to NOI, equity value to EV, returns attribution).
- **threeStatement**: `{ kind: "threeStatement", unit: "$", is: [{ label, value, total? }], cfs: [{ label, value, total? }], bs: { assets: [{ label, value }], le: [{ label, value }] } }`. Values are changes (for example `Depreciation: 10`, `Net income: −7.5`). An empty `is` array means no income statement effect. Assets must equal liabilities plus equity, and balance sheet `Cash` must equal the cash flow statement's `Net change in cash`.

Look at the existing cards for working examples of every kind.

## Process for a module

1. Read this guide, the module's section in `COVERAGE.md` (its subtopics are the floor, not the ceiling) and the cards already in `data/<module>.js`. Skim the other data files for overlap.
2. Plan the cards: map every subtopic to one or more cards, add any standard technical that's missing, and aim for roughly the module's target count.
3. Write the cards into `data/<module>.js`, appending to the array.
4. Recompute every number with a scratch script (keep scratch files outside the repo).
5. Run `node tools/validate.js` and fix every error or warning that involves your file. Errors in other files may belong to someone working in parallel; leave them.
6. Re-read every card as a skeptical interviewer: is it accurate, is the first sentence the answer, does `why` teach something, is the level right?

## Drills

Drills live in `drills/<track>.js` and register with:

```js
Drills.add({
  id: 'drill-re-mortgage',          // must match the ID listed in COVERAGE.md
  track: 're', module: 're-debt', topic: 'Mortgage constant', level: 2,
  ranges: { payment: [1e4, 1e7] },  // sane bounds on key results in values; the validator enforces them
  make(r) { ... return { q, a, why, formula, steps, visual, values }; },
  check(p) { ... return true; }    // re-derive the answer a different way
});
```

- `r` is the seeded RNG: `r.int(lo, hi)`, `r.step(lo, hi, step)` (a value on a grid), `r.pick(array)`, `r.chance(p)`, `r.shuffle(array)`. Never use `Math.random`; the same seed must give the same problem.
- Formatting (`Drills.fmt`): `money(x, dp?)` ($850K, $4.45M, $19.5M), `inM(x)` (always $M), `millions(x)` (x already in millions: $9,230M), `dollars(x, dp?)`, `pct(x, dp?)` (0.065 → 6.5%), `mult(x, dp?)` (1.25x), `bps(x)`, `num(x, dp?)`, `signed(x, dp?)`. Helpers: `Drills.round`, `Drills.near`, `Drills.irr(cashflows)`, `Drills.npv`, `Drills.constant(rate, years)`.
- Inputs are realistic and rounded like real deals. Compute from the rounded inputs you display, so the reader can reproduce every step.
- `q` ≤ 260 characters with every given input in `[[ ]]`. `a` gives the answer first. `steps` shows the full working, one line per step, inputs in `[[ ]]`, results rounded the way a professional would. `why` teaches the idea. `values` holds the key numeric results for `check` and `ranges`.
- `check` must confirm the answer a second way (rebuild value from NOI and cap rate, solve an IRR numerically, test the covenant at the chosen loan), not repeat the same arithmetic.
- Run `node tools/validate.js`: each drill runs on 500 seeds and must produce no errors, no NaN or Infinity, results inside `ranges`, and a passing `check`.
