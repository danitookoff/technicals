/* Real estate drills. Inputs render blue via [[ ]]; every figure is computed from the inputs as shown. */
(function () {
  'use strict';
  const { fmt, near, round } = Drills;
  const { money, inM, pct, mult, dollars } = fmt;

  // ---------------------------------------------------------------- Cap rate, value and NOI
  Drills.add({
    id: 'drill-re-cap-rate',
    track: 're',
    module: 're-val',
    topic: 'Cap rate, value and NOI',
    level: 1,
    ranges: { cap: [0.03, 0.1], value: [5e6, 2e8], noi: [5e5, 1e7] },
    make(r) {
      const noi0 = r.step(1000, 6000, 10) * 1000;
      const cap0 = r.step(0.045, 0.085, 0.0025);
      const mode = r.pick(['value', 'cap', 'noi']);
      const why = "A cap rate is the first-year yield an all-cash buyer accepts, so value is the income being bought divided by that yield. It's one relationship: any two of NOI, value and cap rate give you the third. A smaller cap rate means a bigger value for the same income, which is why falling cap rates lift prices.";
      const formula = 'Value = NOI ÷ cap rate\nCap rate = NOI ÷ value\nNOI = value × cap rate';

      if (mode === 'value') {
        const value = noi0 / cap0;
        return {
          q: `A property earns [[${money(noi0, 2)}]] of NOI and trades at a [[${pct(cap0, 2)}]] cap rate. What is it worth?`,
          a: `About ${money(value)}.`,
          why,
          formula,
          steps: [
            `Value = NOI ÷ cap rate = [[${money(noi0, 2)}]] ÷ [[${pct(cap0, 2)}]] = ${money(value)}`,
            `Same thing as a multiple: 1 ÷ [[${pct(cap0, 2)}]] = ${mult(1 / cap0, 1)} NOI`
          ],
          values: { noi: noi0, cap: cap0, value }
        };
      }

      // Round the price to $0.25M so it reads like a real deal.
      const value = Math.round(noi0 / cap0 / 250000) * 250000;
      if (mode === 'cap') {
        const cap = noi0 / value;
        return {
          q: `A buyer pays [[${money(value, 2)}]] for a property with [[${money(noi0, 2)}]] of NOI. What's the cap rate?`,
          a: `${pct(cap, 2)}.`,
          why,
          formula,
          steps: [
            `Cap rate = NOI ÷ price = [[${money(noi0, 2)}]] ÷ [[${money(value, 2)}]] = ${pct(cap, 2)}`,
            `Put another way, the buyer pays ${mult(value / noi0, 1)} NOI`
          ],
          values: { noi: noi0, cap, value }
        };
      }

      const noi = value * cap0;
      return {
        q: `A property is valued at [[${money(value, 2)}]] on a [[${pct(cap0, 2)}]] cap rate. What NOI does that imply?`,
        a: `About ${money(noi)}.`,
        why,
        formula,
        steps: [`NOI = value × cap rate = [[${money(value, 2)}]] × [[${pct(cap0, 2)}]] = ${money(noi)}`],
        values: { noi, cap: cap0, value }
      };
    },
    // Second way: divide instead of multiply.
    check(p) {
      const v = p.values;
      return near(v.noi / v.cap, v.value, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Loan sizing
  Drills.add({
    id: 'drill-re-loan-sizing',
    track: 're',
    module: 're-debt',
    topic: 'Loan sizing',
    level: 2,
    ranges: { loan: [5e6, 1e8], constant: [0.045, 0.1] },
    make(r) {
      const noi = r.step(900, 6000, 10) * 1000;
      const impliedCap = r.step(0.05, 0.075, 0.0025);
      const value = Math.round(noi / impliedCap / 5e5) * 5e5;
      const ltv = r.step(0.55, 0.75, 0.05);
      const dscr = r.step(1.2, 1.4, 0.05);
      const dy = r.step(0.07, 0.1, 0.005);
      const rate = r.step(0.05, 0.075, 0.0025);
      const io = r.chance(0.5);
      const years = r.pick([25, 30]);
      const k = io ? rate : Drills.constant(rate, years);

      const tests = [
        { label: 'LTV', name: 'LTV', value: value * ltv },
        { label: 'DSCR', name: 'DSCR', value: noi / dscr / k },
        { label: 'Debt yield', name: 'debt yield', value: noi / dy }
      ];
      const bind = tests.reduce((m, t) => (t.value < m.value ? t : m));
      const loan = bind.value;

      const terms = io ? '[[interest-only]]' : `[[${years}]]-year amortization`;
      const steps = [`LTV: [[${pct(ltv, 0)}]] × [[${money(value, 1)}]] = ${money(tests[0].value)}`];
      if (!io) steps.push(`Mortgage constant: [[${pct(rate, 2)}]] over [[${years}]] years with monthly payments = ${pct(k, 2)} a year`);
      steps.push(`DSCR: [[${money(noi, 2)}]] ÷ [[${mult(dscr, 2)}]] = ${money(noi / dscr)} of debt service, ÷ ${io ? `[[${pct(rate, 2)}]]` : pct(k, 2)} = ${money(tests[1].value)}`);
      steps.push(`Debt yield: [[${money(noi, 2)}]] ÷ [[${pct(dy, 1)}]] = ${money(tests[2].value)}`);
      steps.push(`Take the lowest: ${money(loan)}, so ${bind.name} binds`);

      return {
        q: `NOI [[${money(noi, 2)}]], value [[${money(value, 1)}]], rate [[${pct(rate, 2)}]], ${terms}. Lender limits: [[${pct(ltv, 0)}]] LTV, [[${mult(dscr, 2)}]] DSCR, [[${pct(dy, 1)}]] debt yield. Max loan?`,
        a: `${money(loan)}. ${bind.label} binds: it allows the least of the three tests.`,
        why: "Each test caps the loan from a different angle. LTV protects against a fall in value, DSCR checks that NOI covers the payments at this rate and amortization, and debt yield measures the lender's income per dollar lent whatever rates or cap rates do. The lender lends only what every test allows, so the lowest result binds.",
        formula: 'LTV loan = value × LTV\nDSCR loan = (NOI ÷ DSCR) ÷ mortgage constant\nDebt yield loan = NOI ÷ debt yield',
        steps,
        visual: {
          kind: 'bars', unit: '$M', dp: 2,
          items: tests.map((t) => ({ label: t.label, value: round(t.value / 1e6, 2), highlight: t === bind }))
        },
        values: { loan, constant: k, value, noi, ltv, dscr, dy, rate, io: io ? 1 : 0, years }
      };
    },
    // Second way: rebuild the constant by discounting every payment, then re-test the loan against each limit.
    check(p) {
      const v = p.values;
      if (!v.io) {
        const i = v.rate / 12, n = v.years * 12, pmt = v.constant / 12;
        let pv = 0;
        for (let t = 1; t <= n; t++) pv += pmt / Math.pow(1 + i, t);
        if (!near(pv, 1, 1e-9)) return false;
      }
      const eps = 1e-9;
      const passes = v.loan / v.value <= v.ltv + eps &&
        v.noi / (v.loan * v.constant) >= v.dscr - eps &&
        v.noi / v.loan >= v.dy - eps;
      const binds = near(v.loan, v.value * v.ltv) || near(v.loan * v.constant, v.noi / v.dscr) || near(v.loan, v.noi / v.dy);
      return passes && binds;
    }
  });

  // ---------------------------------------------------------------- GPR to NOI
  Drills.add({
    id: 'drill-re-noi-build',
    track: 're',
    module: 're-noi',
    topic: 'GPR to NOI',
    level: 1,
    ranges: { noi: [5e5, 2e7], margin: [0.45, 0.8] },
    make(r) {
      const units = r.step(120, 360, 10);
      const rent = r.step(1200, 2800, 25);
      const vac = r.step(0.04, 0.08, 0.005);
      const credit = r.step(0.005, 0.015, 0.0025);
      const conc = r.step(0, 0.02, 0.005);
      const other = r.step(60, 180, 5);
      const opexUnit = Math.round(rent * 12 * r.step(0.28, 0.4, 0.01) / 250) * 250;
      const mgmt = r.step(0.025, 0.04, 0.005);

      const gpr = units * rent * 12;
      const vacL = gpr * vac, credL = gpr * credit, concL = gpr * conc;
      const oi = units * other * 12;
      const egi = gpr - vacL - credL - concL + oi;
      const fee = egi * mgmt;
      const opex = units * opexUnit;
      const noi = egi - fee - opex;

      const steps = [
        `GPR: [[${units}]] units × [[${dollars(rent)}]] × 12 = ${money(gpr)}`,
        `Vacancy: [[${pct(vac, 1)}]] × GPR = ${money(-vacL)}`,
        `Credit loss: [[${pct(credit, 2)}]] × GPR = ${money(-credL)}`
      ];
      if (conc > 0) steps.push(`Concessions: [[${pct(conc, 1)}]] × GPR = ${money(-concL)}`);
      steps.push(`Other income: [[${units}]] × [[${dollars(other)}]] × 12 = +${money(oi)}`);
      steps.push(`EGI = ${money(egi)}`);
      steps.push(`Management fee: [[${pct(mgmt, 1)}]] × EGI = ${money(-fee)}`);
      steps.push(`Operating expenses: [[${units}]] × [[${dollars(opexUnit)}]] = ${money(-opex)}`);
      steps.push(`NOI = ${money(noi)}, a ${pct(noi / egi, 0)} margin on EGI`);

      const k = (x) => round(x / 1000, 0);
      const wSteps = [
        { label: 'Vacancy', delta: -k(vacL) },
        { label: 'Credit loss', delta: -k(credL) }
      ];
      if (conc > 0) wSteps.push({ label: 'Concessions', delta: -k(concL) });
      wSteps.push({ label: 'Other income', delta: k(oi) });
      wSteps.push({ label: 'EGI', subtotal: true });
      wSteps.push({ label: 'Management fee', delta: -k(fee) });
      wSteps.push({ label: 'Operating expenses', delta: -k(opex) });
      const endK = wSteps.reduce((s, x) => s + (x.delta || 0), k(gpr));

      const concText = conc > 0 ? `concessions [[${pct(conc, 1)}]]` : 'no concessions';
      return {
        q: `[[${units}]] units at [[${dollars(rent)}]] a month. Vacancy [[${pct(vac, 1)}]], credit loss [[${pct(credit, 2)}]], ${concText}. Other income [[${dollars(other)}]] per unit a month. Opex [[${dollars(opexUnit)}]] per unit a year plus a [[${pct(mgmt, 1)}]] management fee. NOI?`,
        a: `About ${money(noi)}: EGI of ${money(egi)} less ${money(fee + opex)} of expenses, a ${pct(noi / egi, 0)} margin.`,
        why: "GPR assumes every unit is leased at market all year, so each deduction explains why collections fall short: empty units (vacancy), unpaid rent (credit loss) and discounts (concessions). Other income comes back in to reach EGI. The management fee is charged on what's actually collected, so it's a percentage of EGI, not GPR. Debt service and capital spending stay below NOI.",
        formula: 'EGI = GPR − vacancy − credit loss − concessions + other income\nNOI = EGI − operating expenses − management fee',
        steps,
        visual: { kind: 'waterfall', unit: '$K', dp: 0, start: { label: 'GPR', value: k(gpr) }, steps: wSteps, end: { label: 'NOI', value: endK } },
        values: { noi, margin: noi / egi, egi, gpr, oi, opex, mgmt, vac, credit, conc }
      };
    },
    // Second way: collapse the losses into one factor and apply the fee as (1 − fee).
    check(p) {
      const v = p.values;
      const egi = v.gpr * (1 - v.vac - v.credit - v.conc) + v.oi;
      return near(egi, v.egi) && near(egi * (1 - v.mgmt) - v.opex, v.noi);
    }
  });

  // ---------------------------------------------------------------- Two-tier waterfall
  Drills.add({
    id: 'drill-re-waterfall',
    track: 're',
    module: 're-deals',
    topic: 'Two-tier waterfall',
    level: 3,
    ranges: { gpTotal: [1e5, 3e7], lpMultiple: [1, 3] },
    make(r) {
      const equity = r.step(5, 40, 1) * 1e6;
      const gp = r.pick([0.05, 0.1, 0.1, 0.2]);
      const lp = 1 - gp;
      const pref = r.step(0.06, 0.1, 0.01);
      const promote = r.pick([0.15, 0.2, 0.2, 0.25, 0.3]);
      const years = r.int(3, 7);
      const compounding = r.chance(0.6);
      const proceeds = Math.round(equity * r.step(1.15, 2.4, 0.05) / 1e5) * 1e5;

      const hurdle = compounding ? equity * Math.pow(1 + pref, years) : equity * (1 + pref * years);
      const tier1 = Math.min(proceeds, hurdle);
      const excess = Math.max(0, proceeds - hurdle);
      const promo = promote * excess;
      const rest = excess - promo;
      const gpTotal = gp * tier1 + promo + gp * rest;
      const lpTotal = proceeds - gpTotal;
      const lpMultiple = lpTotal / (lp * equity);
      const lpIrr = Math.pow(lpMultiple, 1 / years) - 1;

      const m = (x) => inM(x, 2);
      const split = `[[${pct(lp, 0)}]]/[[${pct(gp, 0)}]]`;
      const prefText = compounding ? 'compounding' : 'simple';
      const steps = [compounding
        ? `Hurdle: [[${m(equity)}]] × (1 + [[${pct(pref, 0)}]])^[[${years}]] = ${m(hurdle)}`
        : `Hurdle: [[${m(equity)}]] × (1 + [[${pct(pref, 0)}]] × [[${years}]]) = ${m(hurdle)}`];
      let a;
      if (excess > 0) {
        steps.push(`Excess over the hurdle: [[${m(proceeds)}]] − ${m(hurdle)} = ${m(excess)}`);
        steps.push(`Promote: [[${pct(promote, 0)}]] × ${m(excess)} = ${m(promo)} to the GP`);
        steps.push(`The other ${pct(1 - promote, 0)}, ${m(rest)}, splits ${split}`);
        steps.push(`GP: ${pct(gp, 0)} × ${m(hurdle)} + ${m(promo)} + ${pct(gp, 0)} × ${m(rest)} = ${m(gpTotal)}`);
        steps.push(`LP: ${m(lpTotal)}, a ${mult(lpMultiple, 2)} multiple and ${pct(lpIrr, 1)} IRR`);
        a = `${m(gpTotal)}: ${m(gp * tier1)} as its ${pct(gp, 0)} share of capital and pref, ${m(promo)} of promote and ${m(gp * rest)} of the remaining split.`;
      } else {
        steps.push(`Proceeds of [[${m(proceeds)}]] fall short of the hurdle, so everything splits ${split}`);
        steps.push(`GP: ${pct(gp, 0)} × [[${m(proceeds)}]] = ${m(gpTotal)}`);
        a = `${m(gpTotal)}, just its ${pct(gp, 0)} pro rata share. The deal doesn't clear the ${m(hurdle)} hurdle, so there's no promote.`;
      }

      return {
        q: `LP [[${pct(lp, 0)}]] / GP [[${pct(gp, 0)}]] invest [[${m(equity)}]]. After [[${years}]] years one sale returns [[${m(proceeds)}]]. [[${pct(pref, 0)}]] ${prefText} pref, then a [[${pct(promote, 0)}]] promote. What does the GP receive?`,
        a,
        why: "Cash first returns everyone's capital plus the pref, pro rata, so the LP gets a baseline return before the sponsor earns anything extra. Above the hurdle the GP takes the promote off the top, then shares the rest by ownership like any investor. That's why a GP with a small co-invest can earn several times its capital share when a deal performs well.",
        formula: compounding
          ? 'Hurdle = equity × (1 + pref)^years\nPromote = promote % × (proceeds − hurdle)\nGP total = GP % × hurdle + promote + GP % × rest'
          : 'Hurdle = equity × (1 + pref × years)\nPromote = promote % × (proceeds − hurdle)\nGP total = GP % × hurdle + promote + GP % × rest',
        steps,
        visual: { kind: 'table', headers: ['Tier', 'Total', 'LP', 'GP'], rows: excess > 0 ? [
          ['Capital + pref', m(tier1), m(lp * tier1), m(gp * tier1)],
          [`${pct(promote, 0)} promote`, m(promo), '', m(promo)],
          [`${pct(1 - promote, 0)} split`, m(rest), m(lp * rest), m(gp * rest)],
          ['Total', m(proceeds), m(lpTotal), m(gpTotal)]
        ] : [
          ['Pro rata (below hurdle)', m(proceeds), m(lpTotal), m(gpTotal)]
        ] },
        values: { gpTotal, lpTotal, lpMultiple, proceeds, hurdle, excess, gp, promote, lp }
      };
    },
    // Second way: GP = its pro rata share of everything + promote × the LP's share of the excess.
    check(p) {
      const v = p.values;
      const closed = v.gp * v.proceeds + v.promote * (1 - v.gp) * v.excess;
      const lpCleared = v.excess === 0 || v.lpTotal >= v.lp * v.hurdle - 1e-6;
      return near(closed, v.gpTotal) && near(v.gpTotal + v.lpTotal, v.proceeds) && lpCleared;
    }
  });
})();
