/* Hotel drills. */
(function () {
  'use strict';
  const { fmt, near, round } = Drills;
  const { pct, dollars, num } = fmt;

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
          q: `A [[${keys}]]-key hotel sold [[${num(sold)}]] room nights in a [[${days}]]-day month for [[${dollars(rev)}]] of rooms revenue. What are occupancy, ADR and RevPAR?`,
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
})();
