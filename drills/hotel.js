/* Hotel drills. Inputs render blue via [[ ]]; every figure is computed from the inputs as shown. */
(function () {
  'use strict';
  const { fmt, near, round } = Drills;
  const { pct, dollars, num, money, inM, mult, signed } = fmt;

  // Round a dollar amount to the precision money() shows, so a given input displays exactly.
  const tidy = (x) => {
    const a = Math.abs(x);
    const to = a >= 1e8 ? 1e6 : a >= 1e7 ? 1e5 : a >= 1e6 ? 1e4 : a >= 1e5 ? 1e3 : 100;
    return Math.round(x / to) * to;
  };

  // Occupancies on a 0.5% grid from lo to hi that sell a whole number of room nights. With rooms available
  // a multiple of 10, every multiple of 10% qualifies, so keep one inside [lo, hi].
  const wholeOccs = (avail, lo, hi) => {
    const out = [];
    for (let j = Math.round(lo * 200); j <= Math.round(hi * 200); j++) if ((avail * j) % 200 === 0) out.push(j / 200);
    return out;
  };

  // Fee and reserve rates on a 0.5% grid: 0.03 → "3%", 0.025 → "2.5%".
  const rt = (x) => pct(x, Math.abs(x * 100 - Math.round(x * 100)) < 1e-9 ? 0 : 1);
  // Signed $M change with one decimal: +$2.0M, −$4.0M.
  const chg = (x) => (x < 0 ? '−' : '+') + inM(Math.abs(x), 1);
  // Whole cents, for checking that rounded parts add up to a rounded total.
  const cents = (x) => Math.round(round(x, 2) * 100);
  // "An 80-key hotel", "A 250-key hotel": the article follows how the number is spoken.
  const an = (n) => {
    const whole = String(n).replace(/[$,]/g, '').split('.')[0].replace(/\D+$/, '');
    return /^8/.test(whole) || /^1[18](\d{3})*$/.test(whole) ? 'An' : 'A';
  };
  // Mid-sentence: aa('18.2%') → "an 18.2%"; aa('74.1%', true) → "a [[74.1%]]".
  const aa = (text, given) => `${an(text).toLowerCase()} ${given ? `[[${text}]]` : text}`;

  // ---------------------------------------------------------------- Occupancy, ADR and RevPAR
  Drills.add({
    id: 'drill-hotel-revpar',
    track: 'hotel',
    module: 'hotel-metrics',
    topic: 'Occupancy, ADR and RevPAR',
    level: 1,
    ranges: { occ: [0.5, 0.95], adr: [80, 500], revpar: [40, 460] },
    make(r) {
      const mode = r.pick(['all', 'revpar', 'adr', 'occ']);
      const formula = 'Occupancy = rooms sold ÷ rooms available\nADR = rooms revenue ÷ rooms sold\nRevPAR = rooms revenue ÷ rooms available = occupancy × ADR';
      const why = "RevPAR spreads rooms revenue over every room you could have sold, so it captures volume and price in one number. Because RevPAR = occupancy × ADR, any two of the three give you the third. Always ask which one moved: rate gains reach profit more fully than occupancy gains.";

      if (mode === 'all') {
        const keys = r.step(80, 600, 10);
        const days = r.pick([30, 31]);
        const avail = keys * days;
        const sold = Math.round(avail * r.step(0.55, 0.92, 0.005) / 10) * 10;
        const rev = Math.round(sold * (r.step(95, 450, 5) + r.int(0, 99) / 100) / 1000) * 1000;
        const occ = sold / avail, adr = rev / sold, revpar = rev / avail;
        return {
          q: `${an(keys)} [[${keys}]]-key hotel sold [[${num(sold)}]] room nights in a [[${days}]]-day month for [[${dollars(rev)}]] of rooms revenue. What are occupancy, ADR and RevPAR?`,
          a: `Occupancy ${pct(occ, 1)}, ADR ${dollars(adr, 2)}, RevPAR ${dollars(revpar, 2)}.`,
          why,
          formula,
          steps: [
            `Rooms available: [[${keys}]] × [[${days}]] = ${num(avail)}`,
            `Occupancy: [[${num(sold)}]] ÷ ${num(avail)} = ${pct(occ, 1)}`,
            `ADR: [[${dollars(rev)}]] ÷ [[${num(sold)}]] = ${dollars(adr, 2)}`,
            `RevPAR: [[${dollars(rev)}]] ÷ ${num(avail)} = ${dollars(revpar, 2)}`,
            `Check: ${pct(occ, 1)} × ${dollars(adr, 2)} ≈ ${dollars(revpar, 2)}`
          ],
          values: { occ, adr, revpar, rev, avail }
        };
      }

      const occ0 = r.step(0.55, 0.92, 0.005);
      const adr0 = r.step(95, 450, 1);
      if (mode === 'revpar') {
        const revpar = occ0 * adr0;
        return {
          q: `Occupancy is [[${pct(occ0, 1)}]] and ADR is [[${dollars(adr0)}]]. What's RevPAR?`,
          a: `${dollars(revpar, 2)}.`,
          why,
          formula,
          steps: [`RevPAR = occupancy × ADR = [[${pct(occ0, 1)}]] × [[${dollars(adr0)}]] = ${dollars(revpar, 2)}`],
          values: { occ: occ0, adr: adr0, revpar }
        };
      }

      const revpar0 = round(occ0 * adr0, 2);
      if (mode === 'adr') {
        const adr = revpar0 / occ0;
        return {
          q: `RevPAR is [[${dollars(revpar0, 2)}]] at [[${pct(occ0, 1)}]] occupancy. What's ADR?`,
          a: `${dollars(adr, 2)}.`,
          why,
          formula,
          steps: [`ADR = RevPAR ÷ occupancy = [[${dollars(revpar0, 2)}]] ÷ [[${pct(occ0, 1)}]] = ${dollars(adr, 2)}`],
          values: { occ: occ0, adr, revpar: revpar0 }
        };
      }

      const occ = revpar0 / adr0;
      return {
        q: `RevPAR is [[${dollars(revpar0, 2)}]] and ADR is [[${dollars(adr0)}]]. What's occupancy?`,
        a: `${pct(occ, 1)}.`,
        why,
        formula,
        steps: [`Occupancy = RevPAR ÷ ADR = [[${dollars(revpar0, 2)}]] ÷ [[${dollars(adr0)}]] = ${pct(occ, 1)}`],
        values: { occ, adr: adr0, revpar: revpar0 }
      };
    },
    // Second way: rebuild RevPAR from its parts (and from revenue ÷ rooms available when given).
    check(p) {
      const v = p.values;
      const parts = near(v.occ * v.adr, v.revpar, 1e-9);
      return v.rev ? parts && near(v.rev / v.avail, v.revpar, 1e-9) : parts;
    }
  });

  // ---------------------------------------------------------------- MPI, ARI and RGI
  Drills.add({
    id: 'drill-hotel-penetration',
    track: 'hotel',
    module: 'hotel-metrics',
    topic: 'MPI, ARI and RGI',
    level: 2,
    ranges: { mpi: [60, 170], ari: [80, 125], rgi: [50, 200] },
    make(r) {
      const occ = r.step(0.6, 0.9, 0.005);
      const adr = r.step(120, 400, 1);
      const cOcc = Math.min(0.92, Math.max(0.5, round(occ + r.step(-0.1, 0.1, 0.005), 3)));
      const cAdr = Math.round(adr * r.step(0.85, 1.15, 0.01));
      const mpi = occ / cOcc * 100;
      const ari = adr / cAdr * 100;
      const rp = occ * adr, crp = cOcc * cAdr;
      const rgi = rp / crp * 100;

      const share = round(rgi, 1) >= 100 ? 'more than its fair share of RevPAR' : 'less than its fair share of RevPAR';
      let driver;
      if (mpi >= 100 && ari >= 100) driver = 'It leads the comp set on both occupancy and rate.';
      else if (mpi >= 100) driver = 'It fills rooms by pricing below the comp set.';
      else if (ari >= 100) driver = 'It holds rate above the comp set at the cost of occupancy.';
      else driver = 'It trails the comp set on both occupancy and rate.';

      const o = (x) => pct(x, 1);
      return {
        q: `Your hotel runs [[${o(occ)}]] occupancy at a [[${dollars(adr)}]] ADR. The comp set runs [[${o(cOcc)}]] at [[${dollars(cAdr)}]]. What are MPI, ARI and RGI?`,
        a: `MPI ${num(mpi, 1)}, ARI ${num(ari, 1)}, RGI ${num(rgi, 1)}. The hotel takes ${share}. ${driver}`,
        why: 'Each index compares the hotel with its comp set, where 100 is fair share. MPI shows whether you win on volume, ARI on price, and RGI on the combination. Reading them together tells you the strategy: a high MPI with a low ARI means the hotel is buying occupancy with discounts, which costs more to service than rate.',
        formula: 'MPI = occupancy ÷ comp set occupancy × 100\nARI = ADR ÷ comp set ADR × 100\nRGI = RevPAR ÷ comp set RevPAR × 100 = MPI × ARI ÷ 100',
        steps: [
          `MPI: [[${o(occ)}]] ÷ [[${o(cOcc)}]] × 100 = ${num(mpi, 1)}`,
          `ARI: [[${dollars(adr)}]] ÷ [[${dollars(cAdr)}]] × 100 = ${num(ari, 1)}`,
          `RevPAR: hotel ${dollars(rp, 2)}, comp set ${dollars(crp, 2)}`,
          `RGI: ${dollars(rp, 2)} ÷ ${dollars(crp, 2)} × 100 = ${num(rgi, 1)}`,
          `Check: ${num(mpi, 1)} × ${num(ari, 1)} ÷ 100 ≈ ${num(mpi * ari / 100, 1)}`
        ],
        visual: { kind: 'table', headers: ['', 'Hotel', 'Comp set', 'Index'], rows: [
          ['Occupancy', `[[${o(occ)}]]`, `[[${o(cOcc)}]]`, `MPI ${num(mpi, 1)}`],
          ['ADR', `[[${dollars(adr)}]]`, `[[${dollars(cAdr)}]]`, `ARI ${num(ari, 1)}`],
          ['RevPAR', dollars(rp, 2), dollars(crp, 2), `RGI ${num(rgi, 1)}`]
        ] },
        values: { mpi, ari, rgi }
      };
    },
    // Second way: RGI must equal MPI × ARI ÷ 100.
    check(p) {
      const v = p.values;
      return near(v.rgi, v.mpi * v.ari / 100, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Rooms revenue
  Drills.add({
    id: 'drill-hotel-rooms-revenue',
    track: 'hotel',
    module: 'hotel-metrics',
    topic: 'Rooms revenue',
    level: 1,
    ranges: { rev: [1e5, 1e8], occ: [0.55, 0.95], adr: [80, 500] },
    make(r) {
      const keys = r.step(80, 500, 10);
      const per = r.pick([{ days: 30, name: 'month' }, { days: 31, name: 'month' }, { days: 92, name: 'quarter' }, { days: 365, name: 'year' }, { days: 365, name: 'year' }]);
      const days = per.days;
      const avail = keys * days;
      const occ0 = r.pick(wholeOccs(avail, 0.6, 0.9));
      const sold0 = Math.round(avail * occ0);
      const adr0 = r.step(95, 425, 1);
      const mode = r.pick(['rev', 'rev', 'adr', 'occ']);
      const period = `a [[${days}]]-day ${per.name}`;
      const why = 'Rooms revenue is volume times price. Keys × days counts every room night you could sell, occupancy says how many you sold, and ADR says what each one earned. Occupancy × ADR is RevPAR, so rooms revenue is also RevPAR × rooms available. Budgets and pro formas are built exactly this way, which is why any three inputs give you the fourth: a revenue target and an occupancy forecast tell you the rate you need.';
      const formula = 'Rooms available = keys × days\nRoom nights sold = rooms available × occupancy\nRooms revenue = room nights sold × ADR = rooms available × RevPAR';
      const avGiven = `[[${keys}]] keys × [[${days}]] days = ${num(avail)}`;
      const flow = (occText, sold, adrText, rev) => ({ kind: 'flow', steps: [
        { label: 'Rooms available', note: avGiven },
        { label: 'Room nights sold', note: `× ${occText} occupancy = ${num(sold)}` },
        { label: 'Rooms revenue', note: `× ${adrText} ADR = ${money(rev)}` }
      ] });

      if (mode === 'rev') {
        const rev = sold0 * adr0;
        const revpar = occ0 * adr0;
        return {
          q: `${an(keys)} [[${keys}]]-key hotel runs [[${pct(occ0, 1)}]] occupancy at a [[${dollars(adr0)}]] ADR over ${period}. What's rooms revenue?`,
          a: `About ${money(rev)}: ${num(sold0)} room nights sold at ${dollars(adr0)} each.`,
          why,
          formula,
          steps: [
            `Rooms available: ${avGiven}`,
            `Room nights sold: ${num(avail)} × [[${pct(occ0, 1)}]] = ${num(sold0)}`,
            `Rooms revenue: ${num(sold0)} × [[${dollars(adr0)}]] = ${dollars(rev)}`,
            `Check: RevPAR = [[${pct(occ0, 1)}]] × [[${dollars(adr0)}]] = ${dollars(revpar, 2)}, and ${dollars(revpar, 2)} × ${num(avail)} ≈ ${money(rev)}`
          ],
          visual: flow(`[[${pct(occ0, 1)}]]`, sold0, `[[${dollars(adr0)}]]`, rev),
          values: { rev, occ: occ0, adr: adr0, avail, sold: sold0, tol: 1e-9 }
        };
      }

      if (mode === 'adr') {
        // A budget figure, rounded the way a budget would show it.
        const rev = tidy(sold0 * (adr0 + r.int(0, 99) / 100));
        const adr = rev / sold0;
        return {
          q: `${an(keys)} [[${keys}]]-key hotel's budget calls for [[${money(rev)}]] of rooms revenue over ${period} at [[${pct(occ0, 1)}]] occupancy. What ADR does it need?`,
          a: `About ${dollars(adr, 2)}: ${money(rev)} spread over ${num(sold0)} room nights sold.`,
          why,
          formula,
          steps: [
            `Rooms available: ${avGiven}`,
            `Room nights sold: ${num(avail)} × [[${pct(occ0, 1)}]] = ${num(sold0)}`,
            `ADR: [[${money(rev)}]] ÷ ${num(sold0)} = ${dollars(adr, 2)}`,
            `Check: RevPAR = [[${money(rev)}]] ÷ ${num(avail)} = ${dollars(rev / avail, 2)}, and ÷ [[${pct(occ0, 1)}]] = ${dollars(rev / avail / occ0, 2)}`
          ],
          visual: flow(`[[${pct(occ0, 1)}]]`, sold0, dollars(adr, 2), rev),
          values: { rev, occ: occ0, adr, avail, sold: sold0, tol: 1e-9 }
        };
      }

      // Occupancy from revenue: room nights sold come out as a whole number, so round them first.
      const rev = tidy(sold0 * adr0);
      const sold = Math.round(rev / adr0);
      const occ = sold / avail;
      const viaRevpar = round(rev / avail, 2) / adr0;
      const check = pct(viaRevpar, 1) === pct(occ, 1)
        ? `Check: RevPAR = [[${money(rev)}]] ÷ ${num(avail)} = ${dollars(rev / avail, 2)}, and ÷ [[${dollars(adr0)}]] = ${pct(occ, 1)}`
        : `Check: ${num(sold)} × [[${dollars(adr0)}]] = ${money(sold * adr0)}, back to the revenue given`;
      return {
        q: `${an(keys)} [[${keys}]]-key hotel booked [[${money(rev)}]] of rooms revenue over ${period} at a [[${dollars(adr0)}]] ADR. What occupancy did it run?`,
        a: `About ${pct(occ, 1)}: roughly ${num(sold)} of ${num(avail)} available room nights sold.`,
        why,
        formula,
        steps: [
          `Room nights sold: [[${money(rev)}]] ÷ [[${dollars(adr0)}]] ≈ ${num(sold)}`,
          `Rooms available: ${avGiven}`,
          `Occupancy: ${num(sold)} ÷ ${num(avail)} = ${pct(occ, 1)}`,
          check
        ],
        visual: flow(pct(occ, 1), sold, `[[${dollars(adr0)}]]`, rev),
        // Room nights are rounded to a whole number, so revenue rebuilds to within half a night's rate.
        values: { rev, occ, adr: adr0, avail, sold, tol: adr0 / 2 / rev + 1e-9 }
      };
    },
    // Second way: rebuild revenue from RevPAR (occupancy × ADR) × rooms available.
    check(p) {
      const v = p.values;
      return near(v.occ * v.adr * v.avail, v.rev, v.tol) && near(v.sold / v.avail, v.occ, 1e-9);
    }
  });

  // ---------------------------------------------------------------- TRevPAR and GOPPAR
  // Illustrative mixes: rooms share of total revenue and GOP margin by hotel type.
  const MIXES = [
    { noun: 'select-service hotel', keys: [90, 220], adr: [110, 210], rooms: [0.9, 0.96], gop: [0.36, 0.46] },
    { noun: 'full-service hotel', keys: [250, 700], adr: [170, 320], rooms: [0.55, 0.7], gop: [0.26, 0.36] },
    { noun: 'full-service hotel', keys: [250, 700], adr: [170, 320], rooms: [0.55, 0.7], gop: [0.26, 0.36] },
    { noun: 'resort', keys: [200, 500], adr: [280, 550], rooms: [0.45, 0.6], gop: [0.24, 0.34] }
  ];
  Drills.add({
    id: 'drill-hotel-trevpar',
    track: 'hotel',
    module: 'hotel-metrics',
    topic: 'TRevPAR and GOPPAR',
    level: 1,
    ranges: { trevpar: [50, 1200], goppar: [15, 450], margin: [0.2, 0.5] },
    make(r) {
      const t = r.pick(MIXES);
      const keys = r.step(t.keys[0], t.keys[1], 10);
      const days = r.chance(0.6) ? 365 : r.pick([30, 31]);
      const avail = keys * days;
      const revpar = round(r.step(0.62, 0.84, 0.005) * r.step(t.adr[0], t.adr[1], 1), 2);
      const roomsRev = revpar * avail;
      const total = tidy(roomsRev / r.step(t.rooms[0], t.rooms[1], 0.01));
      const gop = tidy(total * r.step(t.gop[0], t.gop[1], 0.005));
      const trevpar = total / avail, goppar = gop / avail, margin = gop / total, share = roomsRev / total;
      const period = days === 365 ? 'a [[365]]-day year' : `a [[${days}]]-day month`;
      const $ = (x) => dollars(x, 2);
      return {
        q: `${an(keys)} [[${keys}]]-key ${t.noun} earned [[${money(total)}]] of total revenue and [[${money(gop)}]] of GOP over ${period}. RevPAR was [[${$(revpar)}]]. What are TRevPAR and GOPPAR?`,
        a: `TRevPAR ${$(trevpar)} and GOPPAR ${$(goppar)}, ${aa(pct(margin, 1))} GOP margin. Departments outside rooms add ${$(trevpar - revpar)} per available room on top of RevPAR.`,
        why: "RevPAR only sees the rooms. TRevPAR spreads all revenue (rooms, food and beverage, parking, spa, fees) over the same rooms available, so it credits hotels whose other departments earn real money. GOPPAR does the same for profit, which makes it the fairer yardstick between hotels with different mixes: F&B adds a lot of revenue at thin margins, so a full-service hotel can lead on TRevPAR and still trail on GOPPAR. Owners watch GOPPAR closely because it's closest to the cash they keep.",
        formula: 'TRevPAR = total revenue ÷ rooms available\nGOPPAR = GOP ÷ rooms available\nGOP margin = GOPPAR ÷ TRevPAR = GOP ÷ total revenue',
        steps: [
          `Rooms available: [[${keys}]] keys × [[${days}]] days = ${num(avail)}`,
          `TRevPAR: [[${money(total)}]] ÷ ${num(avail)} = ${$(trevpar)}`,
          `GOPPAR: [[${money(gop)}]] ÷ ${num(avail)} = ${$(goppar)}`,
          `GOP margin: [[${money(gop)}]] ÷ [[${money(total)}]] = ${pct(margin, 1)}, the same as GOPPAR ÷ TRevPAR`,
          `Rooms revenue: [[${$(revpar)}]] × ${num(avail)} = ${money(roomsRev)}, ${pct(share, 0)} of the total, so TRevPAR is ${mult(trevpar / revpar, 2)} RevPAR`
        ],
        visual: { kind: 'bars', unit: '$', dp: 2, caption: 'Per available room night', items: [
          { label: 'RevPAR', value: revpar },
          { label: 'TRevPAR', value: round(trevpar, 2), highlight: true },
          { label: 'GOPPAR', value: round(goppar, 2), highlight: true }
        ] },
        values: { trevpar, goppar, margin, revpar, total, gop, avail, share }
      };
    },
    // Second way: multiply back to the totals, and rebuild the margin from the per-room figures.
    check(p) {
      const v = p.values;
      return near(v.trevpar * v.avail, v.total, 1e-9) && near(v.goppar * v.avail, v.gop, 1e-9) &&
        near(v.goppar / v.trevpar, v.margin, 1e-9) && near(v.revpar * v.avail / v.total, v.share, 1e-9) && v.trevpar > v.revpar;
    }
  });

  // ---------------------------------------------------------------- GOP margin
  Drills.add({
    id: 'drill-hotel-gop-margin',
    track: 'hotel',
    module: 'hotel-usali',
    topic: 'GOP margin',
    level: 2,
    ranges: { margin: [0.18, 0.55], gop: [3e5, 6e7] },
    make(r) {
      const full = r.chance(0.7);
      // Full-service figures to $0.1M, select-service to $0.01M, so every input shows exactly.
      const unit = full ? 1e5 : 1e4;
      const dp = full ? 1 : 2;
      const q = (x) => Math.round(x / unit) * unit;
      const m = (x) => inM(x, dp);
      const keys = full ? r.step(220, 600, 10) : r.step(100, 200, 10);
      const rr = q(keys * 365 * r.step(0.66, 0.84, 0.005) * (full ? r.step(170, 320, 1) : r.step(115, 190, 1)));
      const fr = q(rr * (full ? r.step(0.3, 0.6, 0.01) : r.step(0.03, 0.08, 0.005)));
      const xr = q(rr * (full ? r.step(0.05, 0.12, 0.005) : r.step(0.02, 0.05, 0.005)));
      const rp = q(rr * r.step(0.7, 0.78, 0.005));
      const fp = q(fr * (full ? r.step(0.2, 0.34, 0.01) : r.step(0.1, 0.3, 0.01)));
      const xp = q(xr * r.step(0.3, 0.6, 0.01));
      const total = rr + fr + xr;
      const undist = q(total * (full ? r.step(0.22, 0.29, 0.005) : r.step(0.24, 0.31, 0.005)));
      const dept = rp + fp + xp;
      const gop = dept - undist;
      const margin = gop / total;
      const byExpense = r.chance(0.4);
      const type = full ? 'full-service' : 'select-service';

      const lines = byExpense
        ? `Rooms: revenue [[${m(rr)}]], departmental expenses [[${m(rr - rp)}]]. F&B: [[${m(fr)}]] and [[${m(fr - fp)}]]. Other: [[${m(xr)}]] and [[${m(xr - xp)}]].`
        : `Rooms: revenue [[${m(rr)}]], departmental profit [[${m(rp)}]]. F&B: [[${m(fr)}]] and [[${m(fp)}]]. Other: [[${m(xr)}]] and [[${m(xp)}]].`;
      const steps = [`Total revenue: [[${m(rr)}]] + [[${m(fr)}]] + [[${m(xr)}]] = ${m(total)}`];
      if (byExpense) {
        steps.push(`Rooms profit: [[${m(rr)}]] − [[${m(rr - rp)}]] = ${m(rp)}, ${aa(pct(rp / rr, 1))} margin`);
        steps.push(`F&B profit: [[${m(fr)}]] − [[${m(fr - fp)}]] = ${m(fp)}, ${aa(pct(fp / fr, 1))} margin`);
        steps.push(`Other profit: [[${m(xr)}]] − [[${m(xr - xp)}]] = ${m(xp)}, ${aa(pct(xp / xr, 1))} margin`);
        steps.push(`Departmental profit: ${m(rp)} + ${m(fp)} + ${m(xp)} = ${m(dept)}`);
      } else {
        steps.push(`Departmental profit: [[${m(rp)}]] + [[${m(fp)}]] + [[${m(xp)}]] = ${m(dept)}, ${pct(dept / total, 1)} of revenue`);
        steps.push(`Department margins: rooms ${pct(rp / rr, 1)}, F&B ${pct(fp / fr, 1)}, other ${pct(xp / xr, 1)}`);
      }
      steps.push(`GOP: ${m(dept)} − [[${m(undist)}]] of undistributed expenses = ${m(gop)}`);
      steps.push(`GOP margin: ${m(gop)} ÷ ${m(total)} = ${pct(margin, 1)}`);

      const d = (x) => round(x / 1e6, dp);
      return {
        q: `A ${type} hotel's departments. ${lines} Undistributed expenses [[${m(undist)}]]. What are GOP and the GOP margin?`,
        a: `GOP ${m(gop)}, ${aa(pct(margin, 1))} margin on ${m(total)} of total revenue: ${m(dept)} of departmental profit less ${m(undist)} of undistributed expenses. Rooms carry it, at ${aa(pct(rp / rr, 0))} departmental margin against ${pct(fp / fr, 0)} in F&B.`,
        why: "USALI stacks the P&L so each layer answers one question. Departmental profit shows how well each revenue stream converts after its own labor and costs. Undistributed expenses (administration, sales and marketing, IT, maintenance and utilities) serve the whole hotel, so they aren't charged to any one department. GOP is what's left: the profit the operator controls, a common base for incentive fees and the starting point for NOI. Mix drives the margin. Rooms convert far better than F&B, so an F&B-heavy hotel runs a lower GOP margin even when it's well run: compare margins between hotels with similar mixes.",
        formula: 'Departmental profit = department revenue − departmental expenses\nGOP = total departmental profit − undistributed expenses\nGOP margin = GOP ÷ total revenue',
        steps,
        visual: { kind: 'waterfall', unit: '$M', dp, start: { label: 'Total revenue', value: d(total) }, steps: [
          { label: 'Rooms expenses', delta: -d(rr - rp) },
          { label: 'F&B expenses', delta: -d(fr - fp) },
          { label: 'Other expenses', delta: -d(xr - xp) },
          { label: 'Departmental profit', subtotal: true },
          { label: 'Undistributed expenses', delta: -d(undist) }
        ], end: { label: 'GOP', value: d(gop) } },
        values: { gop, margin, total, dept, undist, rr, rp, fr, fp, xr, xp }
      };
    },
    // Second way: total revenue less every expense line, departmental and undistributed.
    check(p) {
      const v = p.values;
      const expenses = (v.rr - v.rp) + (v.fr - v.fp) + (v.xr - v.xp) + v.undist;
      return near(v.rr + v.fr + v.xr - expenses, v.gop, 1e-9) && near(v.gop / (v.rr + v.fr + v.xr), v.margin, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Flow-through
  Drills.add({
    id: 'drill-hotel-flow-through',
    track: 'hotel',
    module: 'hotel-usali',
    topic: 'Flow-through',
    level: 2,
    ranges: { ft: [0.1, 0.95], m0: [0.2, 0.45] },
    make(r) {
      // Work in whole $0.1M units so every figure shows exactly with one decimal.
      const r0 = r.int(180, 800);
      const g0 = Math.round(r0 * r.step(0.26, 0.4, 0.005));
      const m0 = g0 / r0;
      const up = r.chance(0.7);
      const dr = Math.max(10, Math.round(r0 * (up ? r.step(0.04, 0.1, 0.005) : r.step(0.04, 0.12, 0.005))));
      // Growth usually converts above the margin; a decline usually costs more than the margin.
      const above = r.chance(up ? 0.75 : 0.85);
      const target = above ? r.step(round(m0 + 0.08, 2), up ? 0.85 : 0.9, 0.01) : r.step(0.15, round(m0 - 0.08, 2), 0.01);
      let dg = Math.max(1, Math.round(target * dr));
      // Keep flow-through at least 6 points from the margin so the verdict is clear-cut.
      while (above ? dg / dr < m0 + 0.06 : dg / dr > m0 - 0.06) dg += above ? 1 : -1;

      const U = 1e5;
      const R0 = r0 * U, G0 = g0 * U;
      const dR = (up ? dr : -dr) * U, dG = (up ? dg : -dg) * U;
      const R1 = R0 + dR, G1 = G0 + dG;
      const ft = dG / dR, m1 = G1 / R1;
      const m = (x) => inM(x, 1);
      const pts = round(round(m1 * 100, 1) - round(m0 * 100, 1), 1);
      const rises = m1 > m0;

      let a, why, formula;
      const steps = [
        `Change in revenue: [[${m(R1)}]] − [[${m(R0)}]] = ${chg(dR)}`,
        `Change in GOP: [[${m(G1)}]] − [[${m(G0)}]] = ${chg(dG)}`,
        `Flow-through: ${m(Math.abs(dG))} ÷ ${m(Math.abs(dR))} = ${pct(ft, 1)}`
      ];
      if (up) {
        steps.push(`Starting margin: [[${m(G0)}]] ÷ [[${m(R0)}]] = ${pct(m0, 1)}; new margin: [[${m(G1)}]] ÷ [[${m(R1)}]] = ${pct(m1, 1)}`);
        steps.push(above
          ? `Flow-through beats the starting margin, so the margin expands by ${num(pts, 1)} points`
          : `Flow-through trails the starting margin, so the margin shrinks by ${num(-pts, 1)} points`);
        a = above
          ? `${pct(ft, 1)}: GOP rose ${m(dG)} on ${m(dR)} of extra revenue. That beats the ${pct(m0, 1)} starting margin, so the margin expands to ${pct(m1, 1)}.`
          : `${pct(ft, 1)}: GOP rose only ${m(dG)} on ${m(dR)} of extra revenue. That trails the ${pct(m0, 1)} starting margin, so the margin shrinks to ${pct(m1, 1)}: costs grew faster than revenue, which the operator should explain.`;
        why = "Flow-through shows how much of each extra revenue dollar reaches GOP. Many costs, such as management salaries, insurance and much of maintenance, don't rise with revenue, so new revenue should convert at a higher rate than the existing margin. When flow-through beats the starting margin, the margin expands; when it falls short, costs grew faster than revenue, and an asset manager asks why in the monthly P&L review. The source of growth matters too: rate gains bring little extra cost, while occupancy and F&B growth bring labor and supplies with them.";
        formula = 'Flow-through = change in GOP ÷ change in total revenue\nThe GOP margin rises when flow-through beats the starting margin';
      } else {
        steps.push(`Flex: costs fell ${m(-dR + dG)}, ${pct(1 - ft, 1)} of the ${m(-dR)} of revenue lost`);
        steps.push(`Starting margin: [[${m(G0)}]] ÷ [[${m(R0)}]] = ${pct(m0, 1)}; new margin: [[${m(G1)}]] ÷ [[${m(R1)}]] = ${pct(m1, 1)}`);
        steps.push(above
          ? `GOP fell faster than the starting margin, so the margin compresses by ${num(-pts, 1)} points`
          : `GOP fell more slowly than the starting margin, so the margin rises by ${num(pts, 1)} points`);
        a = above
          ? `${pct(ft, 1)} decremental flow-through (flex ${pct(1 - ft, 1)}): GOP fell ${m(-dG)} on ${m(-dR)} of lost revenue. That's above the ${pct(m0, 1)} starting margin, so the margin compresses to ${pct(m1, 1)}, as usual when fixed costs don't fall.`
          : `${pct(ft, 1)} decremental flow-through (flex ${pct(1 - ft, 1)}): GOP fell ${m(-dG)} on ${m(-dR)} of lost revenue. That's below the ${pct(m0, 1)} starting margin, so the margin rises to ${pct(m1, 1)}: unusually strong cost control.`;
        why = "On the way down, the same ratio shows how much GOP each lost revenue dollar takes with it. Flex is the other side: the share of lost revenue the operator saved in costs. Fixed costs don't fall with revenue, so GOP usually drops faster than the margin and the margin compresses. The test of the operator is by how much: cutting variable labor, closing floors and trimming outlet hours raise flex and protect the margin. Judge it against the starting margin and against where the revenue was lost.";
        formula = 'Flow-through = GOP lost ÷ revenue lost\nFlex = 1 − flow-through = costs cut ÷ revenue lost\nThe GOP margin falls when flow-through is above the starting margin';
      }

      return {
        q: up
          ? `Total revenue grew from [[${m(R0)}]] to [[${m(R1)}]] and GOP from [[${m(G0)}]] to [[${m(G1)}]]. What's the flow-through, and how does it compare with the starting margin?`
          : `Total revenue fell from [[${m(R0)}]] to [[${m(R1)}]] and GOP from [[${m(G0)}]] to [[${m(G1)}]]. What's the flow-through (and flex), and how does it compare with the starting margin?`,
        a,
        why,
        formula,
        steps,
        visual: { kind: 'table', headers: ['', 'Last year', 'This year', 'Change'], rows: [
          ['Total revenue', `[[${m(R0)}]]`, `[[${m(R1)}]]`, chg(dR)],
          ['GOP', `[[${m(G0)}]]`, `[[${m(G1)}]]`, chg(dG)],
          ['GOP margin', pct(m0, 1), pct(m1, 1), `${signed(pts, 1)} pts`],
          ['Flow-through', '', '', pct(ft, 1)]
        ] },
        values: { ft, m0, m1, dR, dG, R1, rises: rises ? 1 : 0, expected: (up ? above : !above) ? 1 : 0 }
      };
    },
    // Second way: the margin moves by (flow-through − starting margin) × revenue change ÷ new revenue,
    // so its sign must match the verdict.
    check(p) {
      const v = p.values;
      const move = v.dR * (v.ft - v.m0) / v.R1;
      return near(v.m1 - v.m0, move, 1e-9) && v.rises === v.expected && (move > 0) === (v.rises === 1);
    }
  });

  // ---------------------------------------------------------------- Cost per occupied room
  // Illustrative ranges: rooms expense as a share of ADR (so a 71–81% rooms margin) and labor's share of it.
  const CPOR_TYPES = [
    { noun: 'select-service hotel', keys: [90, 200], adr: [115, 195], cost: [0.19, 0.27], labor: [0.52, 0.64] },
    { noun: 'full-service hotel', keys: [250, 650], adr: [170, 320], cost: [0.21, 0.29], labor: [0.56, 0.68] },
    { noun: 'luxury hotel', keys: [120, 320], adr: [380, 750], cost: [0.2, 0.28], labor: [0.6, 0.72] }
  ];
  Drills.add({
    id: 'drill-hotel-cpor',
    track: 'hotel',
    module: 'hotel-usali',
    topic: 'Cost per occupied room',
    level: 2,
    ranges: { cpor: [15, 250], margin: [0.6, 0.85] },
    make(r) {
      const t = r.pick(CPOR_TYPES);
      const keys = r.step(t.keys[0], t.keys[1], 10);
      const days = r.chance(0.5) ? 365 : r.pick([30, 31]);
      const avail = keys * days;
      const occ = r.pick(wholeOccs(avail, 0.62, 0.86));
      const sold = Math.round(avail * occ);
      const adr = r.step(t.adr[0], t.adr[1], 1);
      const cost0 = sold * adr * r.step(t.cost[0], t.cost[1], 0.005);
      // One rounding unit for both lines, coarse enough that each shows exactly (with room to nudge below).
      const u = cost0 >= 9e6 ? 1e5 : cost0 >= 9e5 ? 1e4 : 1e3;
      const labor = Math.round(cost0 * r.step(t.labor[0], t.labor[1], 0.01) / u) * u;
      const base = Math.round(cost0 / u) * u - labor;
      // Nudge the other costs by up to two units so labor and other per room add up to CPOR to the cent.
      // If no nudge works, ask for the total instead of the split.
      const fits = (o) => cents(labor / sold) + cents(o / sold) === cents((labor + o) / sold);
      const nudged = [0, 1, -1, 2, -2].map((k) => base + k * u).find(fits);
      const split = r.chance(0.6) && nudged != null;
      const other = nudged != null ? nudged : base;
      const total = labor + other;
      const cpor = total / sold, laborPor = labor / sold, otherPor = other / sold;
      const margin = 1 - cpor / adr;
      const $ = (x) => dollars(x, 2);
      const period = days === 365 ? 'a [[365]]-day year' : `a [[${days}]]-day month`;
      const spend = split
        ? `The rooms department spent [[${money(labor)}]] on labor and [[${money(other)}]] on everything else (linen, supplies, commissions).`
        : `The rooms department spent [[${money(total)}]] in total.`;

      const steps = [`Occupied rooms: [[${keys}]] keys × [[${days}]] days × [[${pct(occ, 1)}]] = ${num(sold)}`];
      if (split) {
        steps.push(`Labor: [[${money(labor)}]] ÷ ${num(sold)} = ${$(laborPor)} per occupied room`);
        steps.push(`Other: [[${money(other)}]] ÷ ${num(sold)} = ${$(otherPor)} per occupied room`);
        steps.push(`CPOR: ${$(laborPor)} + ${$(otherPor)} = ${$(cpor)}, the same as ${money(total)} ÷ ${num(sold)}`);
      } else {
        steps.push(`CPOR: [[${money(total)}]] ÷ ${num(sold)} = ${$(cpor)}`);
      }
      steps.push(`Rooms department margin: ([[${dollars(adr)}]] − ${$(cpor)}) ÷ [[${dollars(adr)}]] = ${pct(margin, 1)}`);

      return {
        q: `${an(keys)} [[${keys}]]-key ${t.noun} ran [[${pct(occ, 1)}]] occupancy at a [[${dollars(adr)}]] ADR over ${period}. ${spend} What's the cost per occupied room?`,
        a: `${$(cpor)} per occupied room${split ? `: ${$(laborPor)} of labor and ${$(otherPor)} of other costs` : ''}. Against a ${dollars(adr)} ADR, the rooms department keeps about ${pct(margin, 0)} of rooms revenue.`,
        why: "CPOR divides rooms department costs by occupied rooms because occupied rooms drive them: each one needs cleaning, linen, amenities and often a booking commission, while an empty room costs little. Dividing by available rooms would make a busy hotel look inefficient. Per occupied room, you can separate productivity from volume: if CPOR rises while occupancy is flat, housekeeping got slower or wages rose. Labor is usually the biggest piece, which is why operators also track labor hours per occupied room. Comparing CPOR with ADR shows how much of each room's rate the department keeps.",
        formula: 'Occupied rooms = keys × days × occupancy\nCPOR = rooms department expenses ÷ occupied rooms\nRooms department margin = (ADR − CPOR) ÷ ADR',
        steps,
        visual: split
          ? { kind: 'stack', unit: '$', dp: 2, caption: 'Cost per occupied room', items: [
            { label: 'Labor', value: round(laborPor, 2) },
            { label: 'Other', value: round(otherPor, 2) }
          ] }
          : { kind: 'bars', unit: '$', dp: 2, caption: 'The gap is rooms profit per occupied room', items: [
            { label: 'ADR', value: adr },
            { label: 'CPOR', value: round(cpor, 2), highlight: true }
          ] },
        values: { cpor, laborPor, otherPor, sold, total, adr, margin }
      };
    },
    // Second way: CPOR × occupied rooms rebuilds the expense, the parts add up, and rooms profit ÷ rooms revenue gives the margin.
    check(p) {
      const v = p.values;
      return near(v.cpor * v.sold, v.total, 1e-9) && near(v.laborPor + v.otherPor, v.cpor, 1e-9) &&
        near((v.adr * v.sold - v.total) / (v.adr * v.sold), v.margin, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Base and incentive management fees
  Drills.add({
    id: 'drill-hotel-mgmt-fees',
    track: 'hotel',
    module: 'hotel-agreements',
    topic: 'Base and incentive fees',
    level: 2,
    ranges: { base: [2e5, 4e6], inc: [0, 3e6], fees: [2e5, 6e6] },
    make(r) {
      const baseRate = r.pick([0.02, 0.025, 0.03, 0.03, 0.035, 0.04]);
      // Whole millions of revenue (even millions for a half-point rate) keep the fees to round $10K.
      const half = Math.round(baseRate * 1000) % 10 !== 0;
      const rev = (half ? 2 * r.int(8, 40) : r.int(15, 80)) * 1e6;
      const gop = Math.round(rev * r.step(0.28, 0.4, 0.005) / 1e5) * 1e5;
      const fixed = Math.round(rev * r.step(0.03, 0.06, 0.005) / 1e5) * 1e5;
      const ffeRate = r.pick([0.03, 0.04, 0.04, 0.04, 0.05]);
      const base = rev * baseRate, ffe = rev * ffeRate;
      const cf = gop - base - fixed - ffe;
      const prioRate = r.pick([0.07, 0.08, 0.09, 0.1, 0.11]);
      // Size the owner's investment so the priority sometimes exceeds the cash flow (no incentive fee).
      const invest = Math.max(1, Math.round(cf / prioRate * r.step(0.7, 1.12, 0.01) / 5e6)) * 5e6;
      const prio = invest * prioRate;
      const incRate = r.pick([0.1, 0.2, 0.2, 0.3]);
      const excess = cf - prio;
      const inc = Math.max(0, excess) * incRate;
      const fees = base + inc, owner = cf - inc;
      const m = (x) => money(x, 2);
      const aPrio = an(Math.round(prioRate * 100)).toLowerCase();

      const steps = [
        `Base fee: [[${rt(baseRate)}]] × [[${money(rev)}]] = ${m(base)}`,
        `FF&E reserve: [[${rt(ffeRate)}]] × [[${money(rev)}]] = ${m(ffe)}`,
        `Cash flow after reserve: [[${money(gop)}]] − ${m(base)} − [[${money(fixed)}]] − ${m(ffe)} = ${m(cf)}`,
        `Owner's priority: [[${rt(prioRate)}]] × [[${money(invest, 0)}]] = ${m(prio)}`
      ];
      let a;
      if (inc > 0) {
        steps.push(`Excess over the priority: ${m(cf)} − ${m(prio)} = ${m(excess)}`);
        steps.push(`Incentive fee: [[${rt(incRate)}]] × ${m(excess)} = ${m(inc)}`);
        steps.push(`Total fees: ${m(base)} + ${m(inc)} = ${m(fees)}, ${pct(fees / rev, 1)} of revenue. The owner keeps ${m(owner)}`);
        a = `Base fee ${m(base)} and incentive fee ${m(inc)}, ${m(fees)} in total. The incentive fee is ${rt(incRate)} of the ${m(excess)} by which cash flow after the base fee, fixed charges and reserve (${m(cf)}) beats the owner's ${m(prio)} priority.`;
      } else {
        steps.push(`Cash flow of ${m(cf)} falls ${m(-excess)} short of the ${m(prio)} priority, so there's no incentive fee`);
        steps.push(`Total fees: the base fee alone, ${m(base)}, ${pct(fees / rev, 1)} of revenue`);
        a = `Base fee ${m(base)} and no incentive fee. Cash flow after the base fee, fixed charges and reserve is ${m(cf)}, short of the owner's ${m(prio)} priority, so the operator earns only its base fee.`;
      }

      const d = (x) => round(x / 1e3, 0);
      const wf = [
        { label: 'Base fee', delta: -d(base) },
        { label: 'Fixed charges', delta: -d(fixed) },
        { label: 'FF&E reserve', delta: -d(ffe) },
        { label: 'Cash flow after reserve', subtotal: true }
      ];
      if (inc > 0) wf.push({ label: 'Incentive fee', delta: -d(inc) });
      return {
        q: `Revenue [[${money(rev)}]], GOP [[${money(gop)}]]. Base fee: [[${rt(baseRate)}]] of revenue. Incentive fee: [[${rt(incRate)}]] of cash flow after the base fee, [[${money(fixed)}]] of fixed charges and a [[${rt(ffeRate)}]] FF&E reserve, above ${aPrio} [[${rt(prioRate)}]] priority on the owner's [[${money(invest, 0)}]] invested. What are the fees?`,
        a,
        why: "The base fee pays the operator to run the hotel. It comes off the top of revenue, so the operator earns it even in a year the owner loses money. The incentive fee aligns the operator with the owner: here it's paid only from cash flow above the owner's priority return, so the owner earns its return first and shares only the upside. Definitions vary by agreement: some pay the incentive as a share of GOP or adjusted profit with no priority, and the rates, the reserve and what counts as fixed charges are all negotiated. Read the HMA before you model it.",
        formula: "Base fee = base % × total revenue\nCash flow after reserve = GOP − base fee − fixed charges − FF&E reserve\nIncentive fee = incentive % × (cash flow after reserve − owner's priority), if positive\nOwner's priority = priority % × owner's investment",
        steps,
        visual: { kind: 'waterfall', unit: '$K', dp: 0, caption: `Owner's priority: ${m(prio)}. The incentive fee comes only from cash flow above it.`,
          start: { label: 'GOP', value: d(gop) }, steps: wf, end: { label: "Owner's cash flow", value: d(owner) } },
        values: { base, inc, fees, cf, prio, owner, rev, gop, fixed, invest, baseRate, ffeRate, prioRate, incRate }
      };
    },
    // Second way: the incentive fee in one line from the inputs, and subordination: whenever an incentive
    // fee is paid, the owner still keeps at least its priority.
    check(p) {
      const v = p.values;
      const closed = v.incRate * Math.max(0, v.gop - v.rev * (v.baseRate + v.ffeRate) - v.fixed - v.prioRate * v.invest);
      const subordinated = v.inc === 0 || v.owner >= v.prio - 1e-6;
      return near(closed, v.inc, 1e-9) && near(v.fees, v.rev * v.baseRate + closed, 1e-9) && subordinated;
    }
  });

  // ---------------------------------------------------------------- Franchise fees
  Drills.add({
    id: 'drill-hotel-franchise-fees',
    track: 'hotel',
    module: 'hotel-agreements',
    topic: 'Franchise fees',
    level: 2,
    ranges: { fees: [5e4, 5e6], pctRooms: [0.06, 0.17], pctTotal: [0.035, 0.17] },
    make(r) {
      const select = r.chance(0.65);
      const keys = select ? r.step(80, 180, 5) : r.step(180, 320, 10);
      const raw = keys * 365 * r.step(0.64, 0.84, 0.005) * (select ? r.step(110, 190, 1) : r.step(150, 240, 1));
      // Rooms revenue to $0.2M (or $1M above $10M) keeps every fee on a round figure that shows exactly.
      const to = raw < 9.9e6 ? 2e5 : 1e6;
      const rooms = Math.round(raw / to) * to;
      const total = tidy(rooms / (select ? r.step(0.88, 0.96, 0.01) : r.step(0.62, 0.78, 0.01)));
      // Illustrative rates; brands and agreements set their own.
      const fees = [
        ['Royalty', r.step(0.04, 0.065, 0.005)],
        ['Marketing', r.step(0.01, 0.03, 0.005)],
        ['Reservations', r.step(0.005, 0.02, 0.005)],
        ['Loyalty', r.step(0.01, 0.04, 0.005)]
      ].map(([name, rate]) => ({ name, rate, amount: rooms * rate }));
      const sumRate = fees.reduce((s, f) => s + f.rate, 0);
      const feeTotal = fees.reduce((s, f) => s + f.amount, 0);
      const pctRooms = feeTotal / rooms, pctTotal = feeTotal / total;
      const [roy, mkt, res, loy] = fees.map((f) => `[[${rt(f.rate)}]]`);

      return {
        q: `${an(keys)} [[${keys}]]-key franchised hotel earns [[${money(rooms)}]] of rooms revenue and [[${money(total)}]] in total. Royalty ${roy}, marketing ${mkt}, reservations ${res} and loyalty ${loy}, all on rooms revenue. What are the total fees, in dollars and as a share of rooms and total revenue?`,
        a: `${money(feeTotal)} a year: ${pct(pctRooms, 1)} of rooms revenue but ${pct(pctTotal, 1)} of total revenue, because the fees are charged on rooms revenue only.`,
        why: "A franchise agreement licenses the brand, not the management. The royalty pays for the name; program fees fund the brand's marketing, reservation system and loyalty program. Most are charged on rooms revenue, so the same fee schedule weighs more on a rooms-only hotel than on one with a big F&B business. Rates, bases and definitions vary by brand and agreement: loyalty fees are often charged only on members' stays, some brands also take a royalty on F&B, and reservation fees can be per booking. Model them from the actual agreement, and weigh the total against the business the brand delivers.",
        formula: 'Each fee = its rate × rooms revenue\nTotal fees ÷ rooms revenue = the sum of the rates\nShare of total revenue = total fees ÷ total revenue',
        steps: fees.map((f) => `${f.name}: [[${rt(f.rate)}]] × [[${money(rooms)}]] = ${money(f.amount)}`).concat([
          `Total: ${money(feeTotal)}, or ${pct(sumRate, 1)} of rooms revenue (the rates simply add)`,
          `Share of total revenue: ${money(feeTotal)} ÷ [[${money(total)}]] = ${pct(pctTotal, 1)}`
        ]),
        visual: { kind: 'table', headers: ['Fee', 'Rate', 'Amount'], caption: `On [[${money(rooms)}]] of rooms revenue`,
          rows: fees.map((f) => [f.name, `[[${rt(f.rate)}]]`, money(f.amount)]).concat([['Total', pct(sumRate, 1), money(feeTotal)]]) },
        values: { fees: feeTotal, pctRooms, pctTotal, rooms, total, sumRate }
      };
    },
    // Second way: total fees = rooms revenue × the summed rates, and the share of total revenue
    // = share of rooms revenue × the rooms share of revenue.
    check(p) {
      const v = p.values;
      return near(v.rooms * v.sumRate, v.fees, 1e-9) && near(v.pctRooms * v.rooms / v.total, v.pctTotal, 1e-9) && v.pctTotal < v.pctRooms;
    }
  });

  // ---------------------------------------------------------------- FF&E reserve and NOI after reserve
  Drills.add({
    id: 'drill-hotel-ffe',
    track: 'hotel',
    module: 'hotel-val',
    topic: 'FF&E reserve',
    level: 1,
    ranges: { reserve: [1e5, 5e6], noi: [5e5, 4e7], share: [0.07, 0.3] },
    make(r) {
      const keys = r.step(100, 500, 10);
      const raw = keys * r.step(45, 150, 1) * 1000;
      // Revenue to $0.1M (to $1M above $10M) keeps the reserve on a round figure.
      const rev = raw >= 1e7 ? Math.round(raw / 1e6) * 1e6 : Math.round(raw / 1e5) * 1e5;
      const rate = r.pick([0.03, 0.04, 0.04, 0.04, 0.05]);
      const reserve = rev * rate;
      const perKey = reserve / keys;
      const fromGop = r.chance(0.5);
      const m = (x) => money(x, 2);
      // Fees and reserves are whole percentages of revenue, so they're whole $10K only when revenue is a
      // whole $1M. Otherwise draw in $K, so the chart adds up as shown.
      const inK = rev % 1e6 !== 0;
      const d = (x) => (inK ? round(x / 1e3, 0) : round(x / 1e6, 2));
      const why = "Furniture, fixtures and equipment (beds, carpet, TVs, lobby furniture) wear out on a cycle of several years, so owners set aside part of revenue every year rather than treat replacements as surprises. Buyers and lenders deduct the reserve before they capitalize or lend against NOI, funded or not, because skipping it overstates sustainable cash flow. Around 4% of total revenue is a common convention, not a rule: management agreements, franchise agreements and lenders set their own levels, and new hotels often start lower and step up. Because it's charged on revenue, the reserve takes a far bigger bite out of EBITDA than its percentage suggests.";
      const formula = 'FF&E reserve = reserve % × total revenue\nEBITDA = GOP − management fees − fixed charges\nNOI after reserve = EBITDA − FF&E reserve';

      let ebitda, q, a, steps, wf, start;
      if (fromGop) {
        const gop = Math.round(rev * r.step(0.3, 0.42, 0.005) / 1e5) * 1e5;
        const baseRate = r.pick([0.02, 0.03, 0.03, 0.04]);
        const base = rev * baseRate;
        const fixed = Math.round(rev * r.step(0.03, 0.06, 0.005) / 1e4) * 1e4;
        ebitda = gop - base - fixed;
        const noi = ebitda - reserve;
        q = `${an(keys)} [[${keys}]]-key hotel: total revenue [[${money(rev)}]], GOP [[${money(gop)}]], base management fee [[${rt(baseRate)}]] of revenue, property taxes and insurance [[${money(fixed)}]], FF&E reserve [[${rt(rate)}]] of revenue. What are EBITDA and NOI after reserve?`;
        a = `EBITDA ${m(ebitda)} and NOI after reserve ${m(noi)}. The ${m(reserve)} reserve is ${rt(rate)} of revenue but ${pct(reserve / ebitda, 0)} of EBITDA.`;
        steps = [
          `Base management fee: [[${rt(baseRate)}]] × [[${money(rev)}]] = ${m(base)}`,
          `EBITDA: [[${money(gop)}]] − ${m(base)} − [[${money(fixed)}]] = ${m(ebitda)}`,
          `FF&E reserve: [[${rt(rate)}]] × [[${money(rev)}]] = ${m(reserve)}, about ${dollars(perKey)} per key a year`,
          `NOI after reserve: ${m(ebitda)} − ${m(reserve)} = ${m(noi)}`,
          `The reserve takes ${pct(reserve / ebitda, 1)} of EBITDA`
        ];
        start = { label: 'GOP', value: d(gop) };
        wf = [
          { label: 'Base management fee', delta: -d(base) },
          { label: 'Property taxes and insurance', delta: -d(fixed) },
          { label: 'EBITDA', subtotal: true },
          { label: 'FF&E reserve', delta: -d(reserve) }
        ];
      } else {
        ebitda = tidy(rev * r.step(0.22, 0.36, 0.005));
        const noi = ebitda - reserve;
        q = `${an(keys)} [[${keys}]]-key hotel projects [[${money(rev)}]] of total revenue and [[${money(ebitda)}]] of EBITDA after management fees and fixed charges. With a [[${rt(rate)}]] FF&E reserve, what are the reserve and the NOI after it?`;
        a = `Reserve ${m(reserve)}, so NOI after reserve is ${m(noi)}. A reserve of ${rt(rate)} of revenue takes ${pct(reserve / ebitda, 0)} of EBITDA.`;
        steps = [
          `FF&E reserve: [[${rt(rate)}]] × [[${money(rev)}]] = ${m(reserve)}, about ${dollars(perKey)} per key a year`,
          `NOI after reserve: [[${money(ebitda)}]] − ${m(reserve)} = ${m(noi)}`,
          `The reserve takes ${pct(reserve / ebitda, 1)} of EBITDA: ${rt(rate)} of revenue on ${aa(pct(ebitda / rev, 1))} EBITDA margin`
        ];
        start = { label: 'EBITDA', value: d(ebitda) };
        wf = [{ label: 'FF&E reserve', delta: -d(reserve) }];
      }
      const noi = ebitda - reserve;
      return {
        q, a, why, formula, steps,
        visual: { kind: 'waterfall', unit: inK ? '$K' : '$M', dp: inK ? 0 : 2, start, steps: wf, end: { label: 'NOI after reserve', value: d(noi) } },
        values: { reserve, noi, ebitda, rev, rate, share: reserve / ebitda, perKey, keys }
      };
    },
    // Second way: work in margins. NOI margin = EBITDA margin − reserve rate, and the reserve per key
    // times keys rebuilds the reserve.
    check(p) {
      const v = p.values;
      return near(v.rev * (v.ebitda / v.rev - v.rate), v.noi, 1e-9) && near(v.perKey * v.keys, v.rev * v.rate, 1e-9) &&
        near(v.share, 1 - v.noi / v.ebitda, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Value per key
  // Illustrative NOI per key ($K) and cap rates by type, for realistic combinations only.
  const VAL_TYPES = [
    { noun: 'select-service hotel', keys: [90, 200], noi: [10, 22], cap: [0.075, 0.095] },
    { noun: 'full-service hotel', keys: [220, 600], noi: [16, 40], cap: [0.065, 0.09] },
    { noun: 'luxury resort', keys: [120, 350], noi: [40, 90], cap: [0.055, 0.08] }
  ];
  Drills.add({
    id: 'drill-hotel-value-per-key',
    track: 'hotel',
    module: 'hotel-val',
    topic: 'Value per key',
    level: 2,
    ranges: { perKey: [5e4, 2e6], cap: [0.04, 0.13], value: [5e6, 1e9] },
    make(r) {
      const t = r.pick(VAL_TYPES);
      const keys = r.step(t.keys[0], t.keys[1], 10);
      const noi = tidy(keys * r.step(t.noi[0], t.noi[1], 0.5) * 1000);
      const cap0 = r.step(t.cap[0], t.cap[1], 0.0025);
      const why = "Hotels are usually valued on NOI after a management fee and an FF&E reserve, capitalized at a cap rate, and the result is quoted per key so hotels of different sizes can be compared. Price per key is a sense check, not a valuation: two hotels at the same price per key can earn very different NOI per key, so always convert back to a cap rate. Value moves a lot with the cap rate, so show a range. When a PIP is required, the buyer's real basis is price plus PIP, so judge the yield on the all-in cost.";
      const formula = 'Value = NOI after reserve ÷ cap rate\nValue per key = value ÷ keys = NOI per key ÷ cap rate\nImplied cap rate = NOI ÷ (price per key × keys)';
      const c = (x) => pct(x, 2);
      // Enough precision that dividing the shown figures reproduces the next step.
      const mv = (x) => money(x, x >= 1e8 ? 1 : undefined);

      if (r.chance(0.6)) {
        const value = noi / cap0, perKey = value / keys;
        const row = (x, given) => [given ? `[[${c(x)}]]` : c(x), money(noi / x), money(noi / x / keys)];
        return {
          q: `${an(keys)} [[${keys}]]-key ${t.noun} earns [[${money(noi)}]] of NOI after the FF&E reserve. At ${aa(c(cap0), true)} cap rate, what's it worth in total and per key?`,
          a: `About ${mv(value)}, or ${money(perKey)} per key.`,
          why,
          formula,
          steps: [
            `Value: [[${money(noi)}]] ÷ [[${c(cap0)}]] = ${mv(value)}`,
            `Per key: ${mv(value)} ÷ [[${keys}]] = ${money(perKey)}`,
            `Per key the other way: NOI per key ${money(noi / keys)} ÷ [[${c(cap0)}]] = ${money(perKey)}`
          ],
          visual: { kind: 'table', headers: ['Cap rate', 'Value', 'Per key'], caption: 'Value at the given cap rate and 50 bps either side',
            rows: [row(cap0 - 0.005), row(cap0, true), row(cap0 + 0.005)] },
          values: { value, perKey, cap: cap0, noi, keys, pip: 0, allInCap: 0 }
        };
      }

      // Back-solve: a price per key, rounded like a quoted deal, implies a cap rate.
      const rawPpk = noi / cap0 / keys * r.step(0.92, 1.08, 0.01);
      const to = rawPpk >= 995000 ? 1e4 : 5e3;
      const ppk = Math.round(rawPpk / to) * to;
      const price = ppk * keys;
      const cap = noi / price;
      const pip = r.chance(0.4) ? r.step(10, 50, 5) * 1000 : 0;
      const allIn = (ppk + pip) * keys, allInCap = pip ? noi / allIn : 0;
      const pipK = `$${num(pip / 1000)}K`;
      const steps = [
        `Price: [[${money(ppk)}]] × [[${keys}]] keys = ${money(price, 2)}`,
        `Cap rate: [[${money(noi)}]] ÷ ${money(price, 2)} = ${c(cap)}`,
        `Per key the other way: NOI per key ${money(noi / keys)} ÷ [[${money(ppk)}]] = ${c(cap)}`
      ];
      if (pip) steps.push(`All-in cost: ([[${money(ppk)}]] + [[${pipK}]]) × [[${keys}]] = ${money(allIn, 2)}, so the yield on cost is [[${money(noi)}]] ÷ ${money(allIn, 2)} = ${c(allInCap)}`);
      return {
        q: `${an(keys)} [[${keys}]]-key ${t.noun} with [[${money(noi)}]] of NOI after reserve sells for [[${money(ppk)}]] per key. What cap rate is the buyer paying?${pip ? ` With a [[${pipK}]]-per-key PIP on top, what's the yield on the all-in cost?` : ''}`,
        a: `${c(cap)}: ${money(price, 2)} for ${money(noi)} of NOI.${pip ? ` Adding the PIP takes the all-in cost to ${money(allIn, 2)} and the yield down to ${c(allInCap)}.` : ''}`,
        why,
        formula,
        steps,
        ...(pip ? { visual: { kind: 'bars', unit: '%', dp: 2, caption: 'NOI yield on the price alone and on price plus PIP', items: [
          { label: 'On price', value: round(cap * 100, 2) },
          { label: 'On price plus PIP', value: round(allInCap * 100, 2), highlight: true }
        ] } } : {}),
        values: { value: price, perKey: ppk, cap, noi, keys, pip, allInCap }
      };
    },
    // Second way: rebuild NOI from the per-key value and the cap rate, and test the all-in yield.
    check(p) {
      const v = p.values;
      const allIn = !v.pip || (near(v.noi / ((v.perKey + v.pip) * v.keys), v.allInCap, 1e-9) && v.allInCap < v.cap);
      return near(v.perKey * v.cap * v.keys, v.noi, 1e-9) && near(v.value / v.keys, v.perKey, 1e-9) && allIn;
    }
  });

  // ---------------------------------------------------------------- PIP cost per key and return
  Drills.add({
    id: 'drill-hotel-pip',
    track: 'hotel',
    module: 'hotel-capex',
    topic: 'PIP cost and return',
    level: 2,
    ranges: { perKey: [8e3, 7e4], ret: [0.04, 0.25], payback: [4, 25] },
    make(r) {
      const select = r.chance(0.5);
      const keys = select ? r.step(90, 200, 10) : r.step(200, 500, 10);
      const rawPip = keys * (select ? r.step(12, 30, 1) : r.step(25, 60, 1)) * 1000;
      // Total PIP to $50K (to $0.1M above $10M) so it shows exactly.
      const pip = rawPip >= 9.95e6 ? Math.round(rawPip / 1e5) * 1e5 : Math.round(rawPip / 5e4) * 5e4;
      const revpar = round(r.step(0.62, 0.82, 0.005) * (select ? r.step(110, 180, 1) : r.step(160, 300, 1)), 2);
      const ft = r.step(0.5, 0.75, 0.05);
      // Pick a RevPAR lift (whole percent) that gives a plausible return; bigger PIPs need bigger lifts.
      const retFor = (lift) => revpar * lift * keys * 365 * ft / pip;
      const grid = [];
      for (let l = 3; l <= 15; l++) grid.push(l / 100);
      const ok = grid.filter((l) => retFor(l) >= 0.05 && retFor(l) <= 0.22);
      const lift = ok.length ? r.pick(ok) : grid.reduce((b, l) => (Math.abs(retFor(l) - 0.1) < Math.abs(retFor(b) - 0.1) ? l : b));

      const perKey = pip / keys;
      // Each step works from the figure shown before it (RevPAR gain to the cent, revenue and NOI to
      // the nearest $1K), so the return and payback reproduce from the working.
      const gain = round(revpar * lift, 2);
      const dRev = Math.round(gain * keys * 365 / 1000) * 1000;
      const dNoi = Math.round(dRev * ft / 1000) * 1000;
      const ret = dNoi / pip, payback = pip / dNoi;
      const $ = (x) => dollars(x, 2);
      const k = (x) => `$${num(x / 1000)}K`;
      const yrs = num(payback, 1);
      return {
        q: `${an(keys)} [[${keys}]]-key hotel needs ${aa(money(pip), true)} PIP. RevPAR is [[${$(revpar)}]] and should rise [[${pct(lift, 0)}]] after the work, with [[${pct(ft, 0)}]] of the extra rooms revenue reaching NOI. Cost per key, return on the PIP and payback?`,
        a: `${dollars(perKey)} per key. The ${pct(lift, 0)} RevPAR lift adds about ${k(dNoi)} of NOI a year, ${aa(pct(ret, 1))} return on the PIP with ${an(yrs).toLowerCase()} ${yrs}-year simple payback.`,
        why: "A PIP (property improvement plan) is the renovation a brand requires, typically at a sale, a franchise renewal or a conversion. Quoting it per key lets you compare it with other hotels and add it to the price per key for the all-in basis. The return counts only what the PIP changes: extra RevPAR against the hotel without it, flowed through to NOI at a realistic rate, since extra occupancy brings costs. A return above the cap rate creates more value than it costs. Many PIPs are defensive, so the alternative may be losing the flag. Displacement counts too: rooms out of service lose revenue during the work.",

        formula: 'Cost per key = PIP cost ÷ keys\nExtra NOI = RevPAR gain × keys × 365 × flow-through\nReturn = extra NOI ÷ PIP cost; simple payback = PIP cost ÷ extra NOI',
        steps: [
          `Cost per key: [[${money(pip)}]] ÷ [[${keys}]] = ${dollars(perKey)}`,
          `RevPAR gain: [[${$(revpar)}]] × [[${pct(lift, 0)}]] = ${$(gain)}, taking RevPAR to ${$(revpar + gain)}`,
          `Extra rooms revenue: ${$(gain)} × [[${keys}]] keys × 365 nights = ${k(dRev)} a year`,
          `Extra NOI: [[${pct(ft, 0)}]] × ${k(dRev)} = ${k(dNoi)}`,
          `Return on the PIP: ${k(dNoi)} ÷ [[${money(pip)}]] = ${pct(ret, 1)}`,
          `Simple payback: [[${money(pip)}]] ÷ ${k(dNoi)} = ${yrs} years`
        ],
        visual: { kind: 'flow', steps: [
          { label: 'PIP', note: `[[${money(pip)}]], ${dollars(perKey)} per key` },
          { label: 'RevPAR', note: `+[[${pct(lift, 0)}]]: [[${$(revpar)}]] to ${$(revpar + gain)}` },
          { label: 'Rooms revenue', note: `+${k(dRev)} a year` },
          { label: 'NOI', note: `+${k(dNoi)} at [[${pct(ft, 0)}]] flow-through` },
          { label: 'Return', note: `${pct(ret, 1)} a year, paid back in ${yrs} years` }
        ] },
        // tol bounds the rounding in the working: half a cent of RevPAR gain, then half of $1K twice.
        values: { perKey, ret, payback, dNoi, pip, keys, revpar, lift, ft, tol: (0.005 * keys * 365 * ft + 500 * ft + 500) / dNoi + 1e-9 }
      };
    },
    // Second way: per key, unrounded. Extra NOI per key ÷ PIP cost per key must give the same return, and payback × return = 1.
    check(p) {
      const v = p.values;
      const exact = v.revpar * v.lift * 365 * v.ft / v.perKey;
      return Math.abs(exact / v.ret - 1) <= v.tol && near(v.ret * v.payback, 1, 1e-9) && near(v.dNoi, v.ret * v.pip, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Hotel loan sizing
  Drills.add({
    id: 'drill-hotel-loan-sizing',
    track: 'hotel',
    module: 'hotel-debt',
    topic: 'Hotel loan sizing',
    level: 2,
    ranges: { loan: [4e6, 3e8], perKey: [2e4, 6e5], noi: [8e5, 3e7] },
    make(r) {
      const keys = r.step(120, 450, 10);
      // Whole-million revenue keeps the reserve and NOI to round $10K.
      const rev = Math.max(5, Math.round(keys * r.step(45, 130, 1) / 1000)) * 1e6;
      const ebitda = Math.round(rev * r.step(0.24, 0.36, 0.005) / 1e5) * 1e5;
      const ffeRate = r.pick([0.03, 0.04, 0.04, 0.04, 0.05]);
      const reserve = rev * ffeRate;
      const noi = ebitda - reserve;
      // Illustrative limits, balanced so each test binds often enough to practice both.
      const dy = r.step(0.1, 0.14, 0.005);
      const dyLoan = noi / dy;
      const useLtv = r.chance(0.5);
      // Loans to $0.1M even above $100M.
      const ml = (x) => money(x, x >= 1e7 ? 1 : undefined);

      let value = 0, ltv = 0, dscr = 0, rate = 0, k = 0, io = false, years = 0, otherLoan, otherName, terms;
      const steps = [
        `FF&E reserve: [[${rt(ffeRate)}]] × [[${money(rev, 1)}]] = ${money(reserve, 2)}`,
        `NOI after reserve: [[${money(ebitda, 1)}]] − ${money(reserve, 2)} = ${money(noi, 2)}`,
        `Debt yield loan: ${money(noi, 2)} ÷ [[${pct(dy, 1)}]] = ${ml(dyLoan)}`
      ];
      if (useLtv) {
        value = Math.round(noi / r.step(0.06, 0.09, 0.0025) / 1e6) * 1e6;
        ltv = r.step(0.55, 0.7, 0.05);
        otherLoan = value * ltv;
        otherName = 'LTV';
        terms = `value [[${money(value, 0)}]]`;
        steps.push(`LTV loan: [[${pct(ltv, 0)}]] × [[${money(value, 0)}]] = ${ml(otherLoan)}`);
      } else {
        rate = r.step(0.06, 0.085, 0.0025);
        io = r.chance(0.3);
        years = r.pick([25, 30]);
        dscr = r.step(1.3, 1.7, 0.05);
        k = io ? rate : Drills.constant(rate, years);
        otherLoan = noi / dscr / k;
        otherName = 'DSCR';
        if (!io) steps.push(`Mortgage constant: [[${pct(rate, 2)}]] over [[${years}]] years with monthly payments = ${pct(k, 2)} a year`);
        steps.push(`DSCR loan: ${money(noi, 2)} ÷ [[${mult(dscr, 2)}]] = ${money(noi / dscr, 2)} of debt service, ÷ ${io ? `[[${pct(rate, 2)}]]` : pct(k, 2)} = ${ml(otherLoan)}`);
      }
      const dyBinds = dyLoan <= otherLoan;
      const loan = Math.min(dyLoan, otherLoan);
      const perKey = loan / keys;
      steps.push(`Take the lower: ${ml(loan)}, about ${money(perKey)} per key, so ${dyBinds ? 'debt yield' : otherName} binds`);
      steps.push(`Test at ${ml(loan)}: debt yield ${pct(noi / loan, 1)}, ${useLtv ? `LTV ${pct(loan / value, 1)}` : `DSCR ${mult(noi / (loan * k), 2)}`}`);

      const aDy = an(pct(dy, 1)).toLowerCase();
      const lender = useLtv
        ? `${aDy} [[${pct(dy, 1)}]] minimum debt yield and at most [[${pct(ltv, 0)}]] LTV`
        : `${aDy} [[${pct(dy, 1)}]] minimum debt yield and a [[${mult(dscr, 2)}]] DSCR at [[${pct(rate, 2)}]], ${io ? '[[interest-only]]' : `[[${years}]]-year amortization`}`;
      return {
        q: `${an(keys)} [[${keys}]]-key hotel: total revenue [[${money(rev, 1)}]], EBITDA [[${money(ebitda, 1)}]] before a [[${rt(ffeRate)}]] FF&E reserve${useLtv ? `, ${terms}` : ''}. The lender wants ${lender}. Max loan, and which test binds?`,
        a: dyBinds
          ? `${ml(loan)}, about ${money(perKey)} per key. Debt yield binds: the ${otherName} test alone would allow ${ml(otherLoan)}.`
          : `${ml(loan)}, about ${money(perKey)} per key. ${otherName} binds: debt yield alone would allow ${ml(dyLoan)}.`,
        why: "Hotel income can fall quickly, so lenders lean on debt yield: NOI after an FF&E reserve divided by the loan. It's the lender's income return if it had to take the hotel back, and unlike DSCR and LTV it doesn't move with interest rates or cap rates. Lenders deduct a reserve even when the owner doesn't fund one, at a level each lender sets (often around 4% of revenue). The minimums themselves vary by lender and over time. The loan is the most every test allows, so the test that gives the smallest loan binds.",
        formula: 'NOI after reserve = EBITDA − reserve % × total revenue\nDebt yield loan = NOI ÷ minimum debt yield\nLTV loan = value × max LTV; DSCR loan = NOI ÷ DSCR ÷ mortgage constant\nMax loan = the smallest of the tests',
        steps,
        visual: { kind: 'bars', unit: '$M', dp: 1, caption: 'Loan each test allows', items: [
          { label: 'Debt yield', value: round(dyLoan / 1e6, 1), highlight: dyBinds },
          { label: otherName, value: round(otherLoan / 1e6, 1), highlight: !dyBinds }
        ] },
        values: { loan, perKey, noi, dy, rev, ebitda, ffeRate, useLtv: useLtv ? 1 : 0, value, ltv, dscr, rate, k, io: io ? 1 : 0, years }
      };
    },
    // Second way: rebuild NOI, rebuild the mortgage constant by discounting every payment, then test the
    // loan against both limits: it must pass both and sit exactly at one.
    check(p) {
      const v = p.values;
      if (!near(v.ebitda - v.rev * v.ffeRate, v.noi, 1e-9)) return false;
      if (!v.useLtv && !v.io) {
        const i = v.rate / 12, n = v.years * 12, pmt = v.k / 12;
        let pv = 0;
        for (let t = 1; t <= n; t++) pv += pmt / Math.pow(1 + i, t);
        if (!near(pv, 1, 1e-9)) return false;
      }
      const eps = 1e-9;
      const passes = v.noi / v.loan >= v.dy - eps &&
        (v.useLtv ? v.loan / v.value <= v.ltv + eps : v.noi / (v.loan * v.k) >= v.dscr - eps);
      const binds = near(v.loan, v.noi / v.dy) || (v.useLtv ? near(v.loan, v.value * v.ltv) : near(v.loan * v.k, v.noi / v.dscr));
      return passes && binds;
    }
  });
})();
