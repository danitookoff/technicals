# Technicals

A personal, TikTok-style feed of investment banking, commercial real estate and hotel technicals. One card fills the screen; swipe up for the next. Tap to reveal the answer, grade yourself, and a Leitner spaced-repetition system brings back what you missed. Math drills generate new numbers every time they appear.

Plain HTML, CSS and JavaScript. No accounts, no backend, no build step, no external requests.

## Open it

- **Laptop:** double-click `index.html`. Everything works from disk except installing and offline caching, which need the hosted copy.
- **Phone:** open https://danitookoff.github.io/technicals/ and add it to your home screen.
- **Local server (optional):** `python3 -m http.server 8000` in this folder, then open http://localhost:8000. The service worker caches aggressively, so after editing files either run `node tools/bump.js` or unregister the worker in DevTools (Application › Service workers).

### Add it to your home screen

- **iPhone (Safari):** open the URL, tap the Share button, scroll down, tap **Add to Home Screen**, then **Add**. Open it from the new icon; it runs full screen and works offline after the first load.
- **Android (Chrome):** open the URL, tap the ⋮ menu, tap **Add to Home screen** (or **Install app**), then **Install**.

## How it works

**Grading.** Tap anywhere (or press Space) to reveal the answer, then grade:

| Grade | What happens |
|---|---|
| Missed it | Box 0. The card comes back 4–8 cards later, and again next session until you get it. |
| Got it | Up one box. |
| Too easy | Straight to box 4, so basics clear fast. Already at box 4 or higher: up one box. |

Boxes come back after 0, 1, 3, 7, 16, 35 and 90 days. Box 4 or higher counts as mastered. Swiping past a card without grading only marks it as seen. Scroll back to a card you graded to change the grade; it replaces the earlier one and isn't counted twice.

**The queue.** Due reviews come first, with about one new card for every two reviews. A drill appears about every 6 cards (Settings: off, 4, 6 or 10). When nothing is due and nothing is new, the feed serves drills and your least recently seen cards, so it never ends.

**New cards.** With all tracks on, new cards rotate real estate, hotels, real estate, IB (half real estate, since that's the newest material). Within a track, two neighboring modules are open at a time and the lowest level goes first, so you see level 1 of a module, then level 1 of the next, then level 2s, then level 3s. A module's primer (a short lesson) shows up right before its first question.

**Drills** are tracked per drill type, not per instance. Missing one brings that type back sooner with fresh numbers. Inputs are blue and calculated figures are black, as in a financial model; the full working is in Explain.

**Explain** opens a bottom sheet (a side panel on a laptop) with why it works, a worked example, the trap or follow-up, a visual, and **Flag** for anything wrong or unclear. Flags and notes collect under Menu › Flagged, with a Copy button so you can paste them to Claude to fix.

**Focus** (Menu › Set focus) narrows the feed to one or more modules, one level, and/or interview classics. Use it the night before an interview.

**Stats** shows cards graded today, your streak (a day counts at 20 graded cards), mastery per module, your weakest modules with a **Drill this** button, and the **Closed deals** shelf. A module closes when 90% of its question cards are mastered (it needs at least 10); closing it mints a deal tombstone. To see the closing moment without earning it, open `index.html#preview-close`.

### Keyboard

| Key | Action |
|---|---|
| J or ↓ / K or ↑ | Next / previous card |
| Space | Reveal |
| 1 / 2 / 3 | Missed it / Got it / Too easy |
| E | Explain |
| S | Save |
| F | Flag |
| / | Search |
| Esc | Close a sheet |

## Your progress

Progress is stored in the browser on each device, in `localStorage` under the key `technicals.progress.v1`. Updates to the app never touch it, and it isn't sent anywhere.

- **Back up or move it:** Menu › Settings › **Export** downloads a JSON file (on a phone it opens the share sheet, where Save to Files or AirDrop work). On the other device, **Import** it and choose **Merge** (keeps the most recent grade for each card from either device, and combines saved cards, flags and closed deals) or **Replace**.
- **Reset** clears progress on that device only (settings stay). Export first if you want a copy.
- Clearing Safari or Chrome website data for the site deletes progress, so export occasionally.

## Deploy and update

The app is hosted on GitHub Pages at https://danitookoff.github.io/technicals/, built from the `main` branch of https://github.com/danitookoff/technicals.

Every change follows the same loop:

```sh
node tools/validate.js          # must end with "OK"
node tools/bump.js              # raises the version and refreshes the offline file list
git add -A && git commit -m "Describe the change"
git push                        # GitHub Pages redeploys in about a minute
```

Installed copies show a small **Update ready** prompt; tap **Reload** to switch. `node tools/validate.js --update-coverage` also refreshes the counts in COVERAGE.md.

## Files

```
index.html            loads everything with <script defer> tags, in order
styles.css            design tokens and all styles
deck.js               Deck.add, module registry (names, tracks, study order), [[input]] markup
data/<module>.js      one file per module; each calls Deck.add([...])
drills/engine.js      Drills.add, seeded RNG, number formatting, IRR solver
drills/ib.js, re.js, hotel.js
visuals.js            table, flow, bars, stack, waterfall, threeStatement
app.js                feed, grading, spaced repetition, menus, stats, import/export
sw.js                 offline cache and update prompt
manifest.webmanifest  install metadata
icons/                app icons (regenerate with node tools/icons.js)
tools/validate.js     checks cards, visuals, drills, files and COVERAGE.md
tools/bump.js         version bump before each deploy
tools/icons.js        draws the icons
COVERAGE.md           the content map and progress; resume from here
CLAUDE.md             notes for future Claude sessions
WRITING.md            house style for cards and drills
```

The card schema, ID rules and content rules are in CLAUDE.md.

## Design

Grounded in a financial model rather than app chrome: ink on paper, hairline rules, tabular figures, and **blue reserved for given inputs** (`[[...]]` in the source), with calculated figures in ink. The feed stays calm; the boldness goes into the Lucite deal tombstone minted when a module closes. Light and dark themes follow the system setting, and motion only responds to what you do (and turns off with reduced motion).

| Token | Light | Dark | Use |
|---|---|---|---|
| Paper | `#F7F7F4` | `#17191C` | Background |
| Ink | `#16181C` | `#ECECE7` | Text and calculated figures |
| Graphite | `#595E66` | `#9EA4AB` | Captions and secondary text |
| Rule | `#DAD9D3` | `#30343A` | Hairlines, quiet fills |
| Input blue | `#1F4ED1` | `#8DB2FF` | Given inputs only |
| Lucite | `#CFE6E0` | `#9FD0C5` | The deal tombstone |

Type: system UI fonts (SF on Apple devices), tabular lining figures everywhere, questions 22–26px scaled by length, answers 18px, body 16px, captions 13–14px. The tombstone uses a system serif (Iowan Old Style on Apple devices). Spacing runs on a 4px grid: 4, 8, 12, 16, 24, 32, 48.

## Decisions where the spec left room

- **Theme** follows the system by default; Settings › Theme can force Light or Dark on any device.
- **Primers** have a single **Got it** button. Reading one parks it in box 6, so it returns as a refresher in about three months. Primers don't count toward mastery or closing a module.
- **Too easy** on a card already at box 4 or higher moves it up one box instead of back to 4.
- **Closing a module** needs at least 10 question cards, so the small sample modules can't mint a tombstone that would later cover 50 cards. A tombstone stays on the shelf even if cards are added afterwards.
- **Drills** don't count toward module mastery; Stats shows each drill type's box.
- **1, 2 or 3 on an unrevealed card** reveals it first; press again to grade. **Space** always means Reveal in the feed; **Enter** activates a focused button.
- **Explain** on an unrevealed card reveals it too, so the answer isn't hidden behind the sheet.
- **Auto-advance:** after grading, the feed moves to the next card (Settings can turn this off).
- **Focus** takes one level at a time (Any, 1, 2 or 3). The classics toggle doesn't hide drills.
- **Weakest modules** are the ones with the highest share of graded cards still in box 0 or 1 (at least 3 graded cards).
- **Two open tabs** stay in sync through the browser's storage event, so they don't overwrite each other.
- **Layout:** visuals live in `visuals.js` rather than `app.js`, loaded just before it.
- **Validator:** near-duplicate questions are warnings, not errors (the `ib-walk` family is exempt); drill questions may run to 260 characters because they carry more inputs; formatting is self-tested because number display bugs aren't visible to the math checks.
- **Opening from disk:** Chrome logs a harmless error that it can't read `manifest.webmanifest` over `file://`. Installing only matters on the hosted copy.
