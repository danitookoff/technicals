/* Real estate drills. Inputs render blue via [[ ]]; every figure is computed from the inputs as shown. */
(function () {
  'use strict';
  const { fmt, near, round } = Drills;
  const { money, inM, pct, mult, dollars, num, bps } = fmt;

  // Local helpers.
  const psf = (x, dp) => `${dollars(x, dp == null ? 2 : dp)}/SF`;
  const toM = (x) => round(x / 1e6, 2);  // visual values in $M
  const toK = (x) => round(x / 1e3, 0);  // visual values in $K
  // "an 8.25% cap", "an 11% pref", "a 6.5% cap": the article follows how the number is spoken.
  const an = (s) => (/^(8|11(?!\d)|18(?!\d))/.test(String(s).replace(/\[\[|\]\]/g, '').replace(/^[$−-]/, '')) ? 'an' : 'a');
  const An = (s) => (an(s) === 'an' ? 'An' : 'A');
  // Like money(), but adds decimals (up to $0.001M) when the default would round the figure; under $1M, whole dollars.
  // For inputs on odd grids and for intermediates that feed later steps, so the working reproduces.
  function exact(x) {
    const v = Math.abs(x) / 1e6;
    if (v < 1) return dollars(x);
    for (let dp = v < 10 ? 2 : v < 100 ? 1 : 0; dp < 3; dp++) if (Math.abs(round(v, dp) - v) < 5e-7) return money(x, dp);
    return money(x, 3);
  }
  // Snap float dust to zero before formatting: the engine's round() turns values between 1e-9 and 1e-6 into NaN.
  const tidy = (x) => (Math.abs(x) < 1e-6 ? 0 : x);
  // A monthly rate without trailing zeros: 0.5%, 0.5208%.
  const mrate = (i) => `${num(i * 100, 4).replace(/\.?0+$/, '')}%`;
  // Balance left on a loan with monthly payments after `months` payments.
  function balance(loan, rate, years, months) {
    const i = rate / 12, n = years * 12;
    const pmt = loan * i / (1 - Math.pow(1 + i, -n));
    return loan * Math.pow(1 + i, months) - pmt * (Math.pow(1 + i, months) - 1) / i;
  }

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
          q: `A property earns [[${money(noi0, 2)}]] of NOI and trades at ${an(pct(cap0, 2))} [[${pct(cap0, 2)}]] cap rate. What is it worth?`,
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
        q: `A property is valued at [[${money(value, 2)}]] on ${an(pct(cap0, 2))} [[${pct(cap0, 2)}]] cap rate. What NOI does that imply?`,
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

  // ---------------------------------------------------------------- Exit value and sale proceeds
  Drills.add({
    id: 'drill-re-exit-value',
    track: 're',
    module: 're-val',
    topic: 'Exit value and sale proceeds',
    level: 2,
    ranges: { gross: [5e6, 3e8], net: [5e6, 3e8], equity: [1e6, 3e8], fwd: [5e5, 1.2e7] },
    make(r) {
      const n = r.pick([3, 5, 5, 7, 10]);
      const g = r.step(0.02, 0.04, 0.005);
      const cap = r.step(0.05, 0.08, 0.0025);
      const sc = r.step(0.01, 0.03, 0.005);
      const base = r.step(800, 6000, 10) * 1000;
      const mode = r.pick(['grow', 'last', 'given']);
      const growYears = mode === 'grow' ? n : mode === 'last' ? 1 : 0;
      // Projected NOI is rounded to $1K, the way a model would show it.
      const fwd = growYears ? Math.round(base * Math.pow(1 + g, growYears) / 1000) * 1000 : base;
      const gross = fwd / cap;
      const costs = gross * sc;
      const net = gross - costs;
      const hasLoan = r.chance(0.5);
      const loan = hasLoan ? Math.round(gross * r.step(0.45, 0.65, 0.05) / 1e5) * 1e5 : 0;
      const equity = net - loan;

      const baseS = `[[${money(base, 2)}]]`;
      const gS = `[[${pct(g, 1)}]]`;
      const fwdS = growYears ? money(fwd, 3) : `[[${money(fwd, 2)}]]`;
      const capS = `[[${pct(cap, 2)}]]`;
      const scS = `[[${pct(sc, 1)}]]`;
      const loanS = `[[${money(loan, 1)}]]`;
      const ask = hasLoan ? `${An(money(loan, 1))} ${loanS} loan is repaid at closing. What do the equity holders receive?` : 'What are the net sale proceeds?';
      const exitS = `${an(pct(cap, 2))} ${capS} exit cap on forward NOI, with ${scS} selling costs`;
      let q;
      const steps = [];
      if (mode === 'grow') {
        q = `Year-1 NOI is ${baseS} and grows ${gS} a year. You sell at the end of year [[${n}]] at ${exitS}. ${ask}`;
        steps.push(`The buyer pays for year ${n + 1}'s NOI: ${baseS} × (1 + ${gS})^[[${n}]] = ${fwdS}`);
      } else if (mode === 'last') {
        q = `Year-[[${n}]] NOI, your last year of ownership, is ${baseS} and grows ${gS} a year. You sell at the end of year ${n} at ${exitS}. ${ask}`;
        steps.push(`The buyer pays for year ${n + 1}'s NOI, one more year of growth: ${baseS} × (1 + ${gS}) = ${fwdS}`);
      } else {
        q = `You sell at the end of year [[${n}]]. The buyer's first-year NOI is projected at ${fwdS}, the exit cap is ${capS} and selling costs are ${scS}. ${ask}`;
      }
      steps.push(`Gross sale price: ${fwdS} ÷ ${capS} = ${money(gross)}`);
      steps.push(`Selling costs: ${scS} × ${money(gross)} = ${money(costs)}`);
      steps.push(`Net sale proceeds: ${money(gross)} − ${money(costs)} = ${money(net)}`);
      if (hasLoan) steps.push(`Equity proceeds: ${money(net)} − ${loanS} = ${money(equity)}`);
      const cap2 = cap + 0.0025;
      const gross2 = fwd / cap2;
      const eq2 = gross2 * (1 - sc) - loan;
      steps.push(`Sensitivity: at ${an(pct(cap2, 2))} ${pct(cap2, 2)} exit cap the price falls ${pct(1 - gross2 / gross, 1)} to ${money(gross2)}` +
        (hasLoan ? `, but equity proceeds fall ${pct(1 - eq2 / equity, 1)} to ${money(eq2)}` : ''));

      const wf = [{ label: 'Selling costs', delta: -toM(costs) }];
      if (hasLoan) wf.push({ label: 'Net sale proceeds', subtotal: true }, { label: 'Loan payoff', delta: -toM(loan) });
      const endM = round(wf.reduce((s, x) => s + (x.delta || 0), toM(gross)), 2);
      const fwdPlain = growYears ? money(fwd, 3) : money(fwd, 2);

      return {
        q,
        a: hasLoan
          ? `About ${money(equity)}: ${an(money(gross))} ${money(gross)} gross price (${fwdPlain} ÷ ${pct(cap, 2)}), less ${money(costs)} of selling costs and the ${money(loan, 1)} loan payoff.`
          : `About ${money(net)}: ${an(money(gross))} ${money(gross)} gross price (${fwdPlain} of year-${n + 1} NOI ÷ ${pct(cap, 2)}) less ${money(costs)} of selling costs.`,
        why: "The next owner pays for the income it will collect, so the exit price capitalizes the year after your sale, not the last year you owned. Selling costs (broker fee, transfer taxes, legal) come straight off the price. The lender is repaid in full before the equity sees a dollar, so the equity absorbs every change in price: a small move in the exit cap moves equity proceeds by a much bigger percentage than the price.",
        formula: 'Gross sale price = forward NOI ÷ exit cap\nNet sale proceeds = gross price × (1 − selling costs)\nEquity proceeds = net sale proceeds − loan payoff',
        steps,
        visual: { kind: 'waterfall', unit: '$M', dp: 2, start: { label: 'Gross sale price', value: toM(gross) }, steps: wf,
          end: { label: hasLoan ? 'Equity proceeds' : 'Net sale proceeds', value: endM } },
        values: { base, fwd, g, growYears, cap, sc, gross, costs, net, loan, equity }
      };
    },
    // Second way: grow NOI a year at a time, back the exit cap out of net proceeds, and rebuild net proceeds from equity plus the loan.
    check(p) {
      const v = p.values;
      let noi = v.base;
      for (let t = 0; t < v.growYears; t++) noi *= 1 + v.g;
      return Math.abs(noi - v.fwd) <= 500.001 &&
        near(v.fwd * (1 - v.sc) / v.net, v.cap, 1e-9) &&
        near(v.equity + v.loan, v.net, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Price per SF and per unit
  Drills.add({
    id: 'drill-re-price-per',
    track: 're',
    module: 're-val',
    topic: 'Price per SF and per unit',
    level: 1,
    ranges: { value: [2e6, 3e8], perSF: [60, 1000] },
    make(r) {
      const mode = r.pick(['mf-price', 'mf-comps', 'comps']);
      const why = "Price per unit or per SF strips out size, so you can compare a deal with recent sales and with the cost of building new. It's a cross-check on an income valuation, not a substitute: two buildings at the same price per SF can earn very different NOI. Paying well below replacement cost is a margin of safety, because new competing supply doesn't pencil until rents rise enough to justify building.";

      if (mode === 'mf-price') {
        const units = r.step(80, 360, 4);
        const size = r.step(700, 1150, 25);
        const repl = r.step(220, 400, 10);
        const price = Math.round(units * size * repl * r.step(0.65, 1.15, 0.05) / 1e5) * 1e5;
        const perUnit = price / units;
        const area = units * size;
        const perSF = price / area;
        const gap = perSF / repl - 1;
        const vs = Math.abs(gap) < 0.005 ? 'right at replacement cost' : `${pct(Math.abs(gap), 0)} ${gap < 0 ? 'below' : 'above'} the ${psf(repl, 0)} it would cost to build`;
        return {
          q: `${an(units) === 'an' ? 'An' : 'A'} [[${units}]]-unit apartment building, with units averaging [[${num(size)}]] SF, sells for [[${money(price, 1)}]]. What's the price per unit and per SF? Replacement cost is about [[${psf(repl, 0)}]].`,
          a: `${money(perUnit)} per unit and ${psf(perSF, 0)}, ${vs}.`,
          why,
          formula: 'Price per unit = price ÷ units\nPrice per SF = price ÷ rentable SF\nPrice per SF = price per unit ÷ average unit size',
          steps: [
            `Per unit: [[${money(price, 1)}]] ÷ [[${units}]] = ${money(perUnit)}`,
            `Rentable area: [[${units}]] × [[${num(size)}]] SF = ${num(area)} SF`,
            `Per SF: [[${money(price, 1)}]] ÷ ${num(area)} SF = ${psf(perSF, 0)}`,
            `Cross-check: ${money(perUnit)} per unit ÷ [[${num(size)}]] SF = ${psf(perSF, 0)}`,
            `Versus replacement cost: ${psf(perSF, 0)} ÷ [[${psf(repl, 0)}]] = ${pct(perSF / repl, 0)} of the cost to build`
          ],
          visual: { kind: 'bars', unit: '$/SF', dp: 0, items: [
            { label: 'Price paid', value: round(perSF, 0), highlight: true },
            { label: 'Replacement cost', value: repl }
          ] },
          values: { mode: 1, value: price, perSF, perUnit, units, size, area, repl }
        };
      }

      if (mode === 'mf-comps') {
        const units = r.step(80, 360, 4);
        const size = r.step(700, 1150, 25);
        const comp = r.step(150, 450, 5) * 1000;
        const adj = r.pick([0, 0, -0.1, -0.05, 0.05, 0.1]);
        const perUnit = comp * (1 + adj);
        const value = units * perUnit;
        const perSF = perUnit / size;
        const adjS = `[[${adj < 0 ? '−' : '+'}${pct(Math.abs(adj), 0)}]]`;
        const adjText = adj ? ` Yours is ${adj < 0 ? 'older and needs work' : 'newer, with better amenities'}, so adjust by ${adjS}.` : '';
        const steps = [];
        if (adj) steps.push(`Adjusted comp: [[${money(comp)}]] × (1 ${adj < 0 ? '−' : '+'} [[${pct(Math.abs(adj), 0)}]]) = ${dollars(perUnit)} per unit`);
        steps.push(`Value: [[${units}]] units × ${adj ? dollars(perUnit) : `[[${money(comp)}]]`} = ${money(value)}`);
        steps.push(`Per SF: ${adj ? dollars(perUnit) : `[[${money(comp)}]]`} per unit ÷ [[${num(size)}]] SF = ${psf(perSF, 0)}`);
        steps.push(`Cross-check: ${money(value)} ÷ ${num(units * size)} SF of rentable area = ${psf(perSF, 0)}`);
        return {
          q: `Comparable apartment buildings sold for an average of [[${money(comp)}]] per unit.${adjText} What's your [[${units}]]-unit building worth, and what is that per SF if units average [[${num(size)}]] SF?`,
          a: `About ${money(value)}, or ${psf(perSF, 0)}.`,
          why,
          formula: 'Value = units × comparable price per unit\nPrice per SF = price per unit ÷ average unit size',
          steps,
          values: { mode: 2, value, perSF, perUnit, units, size, comp, adj }
        };
      }

      const types = [
        { name: 'industrial', lo: 90, hi: 220, sfLo: 80000, sfHi: 400000 },
        { name: 'office', lo: 180, hi: 450, sfLo: 60000, sfHi: 300000 },
        { name: 'retail', lo: 120, hi: 320, sfLo: 40000, sfHi: 200000 }
      ];
      const t = r.pick(types);
      const mid = r.int(t.lo, t.hi);
      const comps = [0, 1, 2].map(() => Math.round(mid * (1 + r.step(-0.08, 0.08, 0.01))));
      // Nudge the last comp so the average is a whole dollar.
      comps[2] += (3 - (comps[0] + comps[1] + comps[2]) % 3) % 3;
      const avg = (comps[0] + comps[1] + comps[2]) / 3;
      const area = r.step(t.sfLo, t.sfHi, 5000);
      const value = area * avg;
      const ask = Math.round(value * r.step(0.92, 1.1, 0.01) / 1e5) * 1e5;
      const askPSF = ask / area;
      const prem = ask / value - 1;
      const cS = comps.map((c) => `[[${psf(c, 0)}]]`);
      const rel = Math.abs(prem) < 0.005 ? 'in line with the comps' : `${pct(Math.abs(prem), 1)} ${prem > 0 ? 'above' : 'below'} the comps`;
      const read = Math.abs(prem) < 0.005 ? 'The ask is in line with the comps, so price turns on NOI and lease quality'
        : prem > 0 ? `Paying the ask means paying ${money(ask - value)} over the comps, so you'd want a reason: better leases, location or condition`
          : `The ask is ${money(value - ask)} under the comps: check why (shorter leases, deferred maintenance) before calling it cheap`;
      return {
        q: `Three ${t.name} comps sold for ${cS[0]}, ${cS[1]} and ${cS[2]}. A seller asks [[${money(ask, 1)}]] for ${an(num(area))} [[${num(area)}]] SF ${t.name} building. What's the ask per SF, and what's the building worth at the comps' average?`,
        a: `About ${money(value)} at the ${psf(avg, 0)} comp average. The ${money(ask, 1)} ask is ${psf(askPSF, 0)}, ${rel}.`,
        why,
        formula: 'Price per SF = price ÷ building SF\nValue = building SF × comparable price per SF',
        steps: [
          `Comp average: (${cS.join(' + ')}) ÷ 3 = ${psf(avg, 0)}`,
          `Value: [[${num(area)}]] SF × ${psf(avg, 0)} = ${money(value)}`,
          `Ask per SF: [[${money(ask, 1)}]] ÷ [[${num(area)}]] SF = ${psf(askPSF, 0)}`,
          read
        ],
        visual: { kind: 'bars', unit: '$/SF', dp: 0, items: [
          { label: 'Comp 1', value: comps[0] },
          { label: 'Comp 2', value: comps[1] },
          { label: 'Comp 3', value: comps[2] },
          { label: 'Comp average', value: avg, highlight: true },
          { label: 'Asking price', value: round(askPSF, 0) }
        ] },
        values: { mode: 3, value, perSF: avg, ask, askPSF, area, comps }
      };
    },
    // Second way: per unit ÷ per SF must equal the average unit size; for comps, price each comp at the subject's size and average the values.
    check(p) {
      const v = p.values;
      if (v.mode === 1) return near(v.perUnit / v.perSF, v.size, 1e-9) && near(v.perSF * v.area, v.value, 1e-9);
      if (v.mode === 2) return near(v.value / (v.units * v.size), v.perSF, 1e-9) && near(v.perUnit / v.comp - 1, v.adj, 1e-9);
      const implied = v.comps.map((c) => c * v.area);
      return near(implied.reduce((s, x) => s + x, 0) / implied.length, v.value, 1e-9) && near(v.askPSF * v.area, v.ask, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Value-add renovation
  Drills.add({
    id: 'drill-re-value-add',
    track: 're',
    module: 're-val',
    topic: 'Value-add renovation',
    level: 2,
    ranges: { roc: [0.06, 0.3], valueCreated: [1e5, 6e7], premium: [40, 700] },
    make(r) {
      const reno = r.step(40, 300, 4);
      const cost = r.step(8000, 25000, 500);
      const vac = r.chance(0.5) ? r.step(0.03, 0.07, 0.01) : 0;
      const cap = r.step(0.045, 0.065, 0.0025);
      const mode = r.pick(['value', 'value', 'premium']);
      const capex = reno * cost;
      const keep = 1 - vac;
      let premium, roc;
      if (mode === 'value') {
        premium = Math.max(50, Math.round(cost * r.step(0.1, 0.2, 0.01) / 12 / keep / 5) * 5);
        roc = premium * 12 * keep * reno / capex;
      } else {
        roc = r.step(0.1, 0.18, 0.01);
        premium = roc * capex / (reno * 12 * keep);
      }
      const uplift = reno * premium * 12 * keep;
      const valueCreated = uplift / cap;
      const net = valueCreated - capex;
      const perDollar = valueCreated / capex;

      const renoS = `[[${reno}]]`, costS = `[[${dollars(cost)}]]`, capS = `[[${pct(cap, 2)}]]`;
      const vacS = `[[${pct(vac, 0)}]]`;
      const keepText = vac ? ` × (1 − ${vacS})` : '';
      const steps = [`Renovation cost: ${renoS} × ${costS} = ${exact(capex)}`];
      const rocS = mode === 'value' ? pct(roc, 1) : `[[${pct(roc, 0)}]]`;
      let q, a;
      if (mode === 'value') {
        q = `You renovate ${renoS} units at ${costS} each and expect ${an(dollars(premium))} [[${dollars(premium)}]] monthly rent premium${vac ? `, less ${vacS} vacancy` : ''}. At a ${capS} cap rate, what value does the program create, and what's the return on cost?`;
        steps.push(`Added NOI: ${renoS} × [[${dollars(premium)}]] × 12${keepText} = ${exact(uplift)}`);
        steps.push(`Return on cost: ${exact(uplift)} ÷ ${exact(capex)} = ${pct(roc, 1)}`);
        a = `About ${money(valueCreated)} of value, ${money(net)} net of the ${money(capex)} cost. The ${money(uplift)} of added NOI is ${an(pct(roc, 1))} ${pct(roc, 1)} return on cost.`;
      } else {
        q = `You plan to renovate ${renoS} units at ${costS} each${vac ? `, allowing ${vacS} vacancy on the new rents` : ''}. What monthly rent premium earns ${an(pct(roc, 0))} [[${pct(roc, 0)}]] return on cost, and what value does it create at a ${capS} cap?`;
        steps.push(`NOI needed: [[${pct(roc, 0)}]] × ${exact(capex)} = ${exact(uplift)}`);
        steps.push(`Premium: ${exact(uplift)} ÷ (${renoS} × 12${keepText}) = ${dollars(premium)} a month`);
        a = `About ${dollars(premium)} a month per unit. That adds ${money(uplift)} of NOI, worth ${money(valueCreated)} at a ${pct(cap, 2)} cap: ${money(net)} more than the ${money(capex)} it costs.`;
      }
      steps.push(`Value created: ${exact(uplift)} ÷ ${capS} = ${money(valueCreated)}`);
      steps.push(`Net of the cost: ${money(valueCreated)} − ${exact(capex)} = ${money(net)}`);
      steps.push(`Shortcut: ${rocS} return on cost ÷ ${capS} = ${dollars(perDollar, 2)} of value per $1 spent`);

      return {
        q,
        a,
        why: `A buyer pays 1 ÷ cap rate for every dollar of NOI, so a renovation creates value when its return on cost beats the cap rate. Each $1 spent becomes return on cost ÷ cap rate in value: here ${pct(roc, 1)} ÷ ${pct(cap, 2)} ≈ ${dollars(perDollar, 2)}. The risk is execution. If the premium doesn't hold, units sit empty longer during the work or costs run over, the return on cost slides toward the cap rate and the value creation disappears.`,
        formula: 'Added NOI = units × monthly premium × 12 × (1 − vacancy)\nReturn on cost = added NOI ÷ renovation cost\nValue created = added NOI ÷ cap rate\nValue per $1 spent = return on cost ÷ cap rate',
        steps,
        visual: { kind: 'bars', unit: '$M', dp: 2, items: [
          { label: 'Renovation cost', value: toM(capex) },
          { label: 'Value created', value: toM(valueCreated), highlight: true },
          { label: 'Net value added', value: toM(net) }
        ] },
        values: { roc, valueCreated, premium, uplift, capex, net, cap, reno, vac }
      };
    },
    // Second way: value per $1 spent must equal return on cost ÷ cap rate, and the premium must rebuild the added NOI.
    check(p) {
      const v = p.values;
      return near(v.valueCreated / v.capex, v.roc / v.cap, 1e-9) &&
        near(v.reno * v.premium * 12 * (1 - v.vac), v.roc * v.capex, 1e-9) &&
        near(v.valueCreated - v.capex, v.net, 1e-9);
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

  // ---------------------------------------------------------------- Mortgage payment and constant
  Drills.add({
    id: 'drill-re-mortgage',
    track: 're',
    module: 're-debt',
    topic: 'Mortgage constant',
    level: 2,
    ranges: { payment: [1e4, 6e5], constant: [0.055, 0.1], ads: [1e5, 7e6] },
    make(r) {
      const loan = r.step(12, 240, 1) * 250000;
      const rate = r.step(0.05, 0.075, 0.0025);
      const years = r.pick([25, 30, 30]);
      const balloonMode = r.chance(0.5);
      const term = balloonMode ? r.pick([5, 7, 10, 10]) : 0;
      const i = rate / 12, n = years * 12;
      const payment = loan * i / (1 - Math.pow(1 + i, -n));
      const ads = 12 * payment;
      const k = ads / loan;
      const prin1 = loan - balance(loan, rate, years, 12);
      const int1 = ads - prin1;
      const bal = balloonMode ? balance(loan, rate, years, term * 12) : 0;
      const repaid = loan - bal;

      const loanS = `[[${exact(loan)}]]`, rateS = `[[${pct(rate, 2)}]]`, yrsS = `[[${years}]]`;
      const iS = mrate(i);
      const steps = [
        `Monthly rate: ${rateS} ÷ 12 = ${iS}; payments: ${yrsS} × 12 = ${n}`,
        `Payment: ${loanS} × ${iS} ÷ (1 − (1 + ${iS})^−${n}) = ${dollars(payment)}`,
        `Annual debt service: 12 × ${dollars(payment)} = ${money(ads)}`,
        `Mortgage constant: ${money(ads)} ÷ ${loanS} = ${pct(k, 2)}, ${bps(k - rate)} above the ${rateS} rate`,
        `Year 1 splits into ${money(int1)} of interest and ${money(prin1)} of principal`
      ];
      if (balloonMode) {
        steps.push(`Balloon: the present value of the remaining ${n - term * 12} payments of ${dollars(payment)} at ${iS} a month = ${money(bal)}`);
        steps.push(`Principal repaid over [[${term}]] years: ${loanS} − ${money(bal)} = ${money(repaid)}, ${pct(repaid / loan, 0)} of the loan`);
      }
      const kS = `${an(pct(k, 2))} ${pct(k, 2)}`;
      return {
        q: balloonMode
          ? `${An(exact(loan))} ${loanS} loan at ${rateS} has a [[${term}]]-year term and ${yrsS}-year amortization, paid monthly. What are the monthly payment and mortgage constant, and what balloon is due at maturity?`
          : `${An(exact(loan))} ${loanS} loan at ${rateS} amortizes over ${yrsS} years with monthly payments. What are the monthly payment, annual debt service and mortgage constant?`,
        a: balloonMode
          ? `${dollars(payment)} a month, ${kS} constant. After ${term} years, ${money(bal)} is still owed as a balloon: only ${pct(repaid / loan, 0)} of the loan has amortized.`
          : `${dollars(payment)} a month, or ${money(ads)} a year: ${kS} mortgage constant, ${bps(k - rate)} above the ${pct(rate, 2)} rate.`,
        why: "Each payment covers the month's interest on the balance and repays a little principal, so on an amortizing loan the mortgage constant always sits above the interest rate, and the gap widens as amortization shortens. Early payments are mostly interest, which is why the balance falls slowly and a loan with a short term and long amortization still owes most of its principal at maturity. Lenders test DSCR against the constant, not the rate.",
        formula: 'Monthly payment = loan × i ÷ (1 − (1 + i)^−n), with i = rate ÷ 12, n = months\nAnnual debt service = 12 × monthly payment\nMortgage constant = annual debt service ÷ loan\nBalance = present value of the remaining payments',
        steps,
        visual: balloonMode
          ? { kind: 'stack', unit: '$M', dp: 2, items: [
            { label: `Repaid over ${term} years`, value: toM(repaid) },
            { label: 'Balloon at maturity', value: toM(bal), highlight: true }
          ], caption: `The ${exact(loan)} loan after ${term} of its ${years} years of amortization` }
          : { kind: 'stack', unit: '$K', dp: 0, items: [
            { label: 'Year-1 interest', value: toK(int1) },
            { label: 'Year-1 principal', value: toK(prin1), highlight: true }
          ], caption: `Year-1 debt service of ${money(ads)}: mostly interest` },
        values: { loan, rate, years, payment, ads, constant: k, int1, balloon: bal, termMonths: term * 12 }
      };
    },
    // Second way: run the schedule month by month. It must pay off exactly at maturity and hit the same interest and balloon.
    check(p) {
      const v = p.values;
      const i = v.rate / 12, n = v.years * 12;
      let b = v.loan, int1 = 0, at = 0;
      for (let m = 1; m <= n; m++) {
        const interest = b * i;
        if (m <= 12) int1 += interest;
        b += interest - v.payment;
        if (m === v.termMonths) at = b;
      }
      return Math.abs(b) < 1e-6 * v.loan && near(v.constant, Drills.constant(v.rate, v.years), 1e-9) &&
        near(int1, v.int1, 1e-9) && (!v.termMonths || near(at, v.balloon, 1e-9));
    }
  });

  // ---------------------------------------------------------------- DSCR, debt yield, LTV and LTC
  Drills.add({
    id: 'drill-re-credit-metrics',
    track: 're',
    module: 're-debt',
    topic: 'DSCR, debt yield, LTV and LTC',
    level: 1,
    ranges: { dscr: [1.1, 2.6], dy: [0.05, 0.17], ltv: [0.3, 0.8], ltc: [0.3, 0.8], cushion: [0, 0.6] },
    make(r) {
      const price = r.step(40, 320, 1) * 250000;
      const cap = r.step(0.05, 0.07, 0.0025);
      const noi = Math.round(price * cap / 1e4) * 1e4;
      const rate = r.step(0.05, 0.075, 0.0025);
      const io = r.chance(0.35);
      const years = r.pick([25, 30, 30]);
      const k = io ? rate : Drills.constant(rate, years);
      const covenant = r.pick([1.15, 1.2, 1.25]);
      const dscrTarget = r.step(covenant + 0.1, covenant + 0.45, 0.01);
      const loan = Math.round(Math.min(price * r.step(0.55, 0.75, 0.05), noi / (dscrTarget * k)) / 1e5) * 1e5;
      const extra = Math.round(price * r.step(0.02, 0.1, 0.01) / 1e5) * 1e5;
      const cost = price + extra;
      const ads = loan * k;
      const dscr = noi / ads, dy = noi / loan, ltv = loan / price, ltc = loan / cost;
      const mode = r.pick(['metrics', 'metrics', 'cushion']);

      const noiS = `[[${money(noi, 2)}]]`, loanS = `[[${money(loan, 1)}]]`, rateS = `[[${pct(rate, 2)}]]`;
      const terms = io ? `${rateS}, interest-only` : `${rateS} with [[${years}]]-year amortization`;
      const dsStep = io
        ? `Debt service: ${loanS} × ${rateS} = ${money(ads)}`
        : `Debt service: ${loanS} × ${pct(k, 2)} constant (${rateS}, [[${years}]] years, monthly) = ${money(ads)}`;
      const why = "Each ratio answers a different lender question. DSCR: can today's income pay the loan at these terms? Debt yield: what would the lender earn on its money if it took the building back, whatever rates or cap rates do? LTV: how far can the value fall before the loan is underwater? LTC: how much of the cost did the sponsor fund, which matters when the business plan still needs capital. DSCR equals debt yield ÷ mortgage constant, so loan terms move DSCR but never the debt yield.";

      if (mode === 'metrics') {
        const priceS = `[[${exact(price)}]]`, extraS = `[[${money(extra, 1)}]]`;
        return {
          q: `You buy for ${priceS} and budget ${extraS} for closing costs and renovations. NOI is ${noiS}. The ${loanS} loan is at ${terms}. What are the DSCR, debt yield, LTV (on the price) and LTC?`,
          a: `DSCR ${mult(dscr, 2)}, debt yield ${pct(dy, 1)}, LTV ${pct(ltv, 1)} and LTC ${pct(ltc, 1)}.`,
          why,
          formula: 'DSCR = NOI ÷ annual debt service\nDebt yield = NOI ÷ loan\nLTV = loan ÷ value; LTC = loan ÷ total cost',
          steps: [
            dsStep,
            `DSCR: ${noiS} ÷ ${money(ads)} = ${mult(dscr, 2)}`,
            `Debt yield: ${noiS} ÷ ${loanS} = ${pct(dy, 1)}`,
            `LTV: ${loanS} ÷ ${priceS} = ${pct(ltv, 1)}`,
            `LTC: ${loanS} ÷ (${priceS} + ${extraS}) = ${loanS} ÷ ${exact(cost)} = ${pct(ltc, 1)}`,
            `Tie-out: debt yield ÷ constant = ${pct(dy, 1)} ÷ ${pct(k, 2)} = ${mult(dscr, 2)}`
          ],
          visual: { kind: 'table', headers: ['Metric', 'Formula', 'Result'], rows: [
            ['DSCR', 'NOI ÷ debt service', mult(dscr, 2)],
            ['Debt yield', 'NOI ÷ loan', pct(dy, 1)],
            ['LTV', 'Loan ÷ price', pct(ltv, 1)],
            ['LTC', 'Loan ÷ total cost', pct(ltc, 1)]
          ] },
          values: { mode: 1, dscr, dy, ltv, ltc, cushion: 0, k, noi, loan, ads, price, cost, covenant }
        };
      }

      const covS = `[[${mult(covenant, 2)}]]`;
      const noiCov = covenant * ads;
      const cushion = 1 - noiCov / noi;
      return {
        q: `NOI is ${noiS} on ${an(money(loan, 1))} ${loanS} loan at ${terms}. The loan has ${an(mult(covenant, 2))} ${covS} DSCR covenant. What's the DSCR today, and how far can NOI fall before it breaches the covenant?`,
        a: `${mult(dscr, 2)} today. NOI can fall about ${pct(cushion, 1)} (${money(noi - noiCov)}) before DSCR hits ${mult(covenant, 2)}.`,
        why,
        formula: 'DSCR = NOI ÷ annual debt service\nNOI at the covenant = covenant DSCR × debt service\nCushion = 1 − NOI at the covenant ÷ NOI today',
        steps: [
          dsStep,
          `DSCR: ${noiS} ÷ ${money(ads)} = ${mult(dscr, 2)}`,
          `NOI at the covenant: ${covS} × ${money(ads)} = ${money(noiCov)}`,
          `Cushion: 1 − ${money(noiCov)} ÷ ${noiS} = ${pct(cushion, 1)}, or ${money(noi - noiCov)} of NOI`,
          `Shortcut: 1 − ${covS} ÷ ${mult(dscr, 2)} = ${pct(cushion, 1)}. Cash flow only turns negative after ${an(pct(1 - 1 / dscr, 1))} ${pct(1 - 1 / dscr, 1)} drop, at 1.00x`
        ],
        visual: { kind: 'bars', unit: '$M', dp: 2, items: [
          { label: 'NOI today', value: toM(noi) },
          { label: `NOI at ${mult(covenant, 2)}`, value: toM(noiCov), highlight: true },
          { label: 'Debt service (1.00x)', value: toM(ads) }
        ] },
        values: { mode: 2, dscr, dy, ltv, ltc, cushion, k, noi, loan, ads, price, cost, covenant }
      };
    },
    // Second way: DSCR must equal debt yield ÷ constant, both LTV and LTC must rebuild the loan, and the stressed NOI must land exactly on the covenant.
    check(p) {
      const v = p.values;
      const ok = near(v.dscr, v.dy / v.k, 1e-9) && near(v.ltv * v.price, v.loan, 1e-9) && near(v.ltc * v.cost, v.loan, 1e-9);
      return ok && (v.mode === 1 || near(v.noi * (1 - v.cushion) / (v.loan * v.k), v.covenant, 1e-9));
    }
  });

  // ---------------------------------------------------------------- Break-even occupancy
  Drills.add({
    id: 'drill-re-breakeven',
    track: 're',
    module: 're-debt',
    topic: 'Break-even occupancy',
    level: 2,
    ranges: { be: [0.55, 0.95], ads: [1e5, 1e7] },
    make(r) {
      const units = r.step(100, 360, 4);
      const rent = r.step(1200, 2800, 25);
      const other = r.chance(0.5) ? r.step(50, 150, 5) : 0;
      const pgi = units * (rent + other) * 12;
      const opexUnit = Math.round(rent * 12 * r.step(0.3, 0.42, 0.01) / 250) * 250;
      const opex = units * opexUnit;
      const occ = r.step(0.92, 0.96, 0.005);
      const noi = pgi * occ - opex;
      const mode = r.pick(['be', 'be', 'max']);

      const unitsS = `[[${units}]]`;
      const incomeS = other ? `[[${dollars(rent)}]] of rent plus [[${dollars(other)}]] of other income` : `[[${dollars(rent)}]] of rent`;
      const pgiStep = `Potential gross income: ${unitsS} × ${other ? `([[${dollars(rent)}]] + [[${dollars(other)}]])` : `[[${dollars(rent)}]]`} × 12 = ${exact(pgi)}`;
      const opexStep = `Operating expenses: ${unitsS} × [[${dollars(opexUnit)}]] = ${exact(opex)}`;
      const why = "Break-even occupancy asks how empty the building can get before income stops covering the bills. Operating expenses and debt service are treated as fixed and compared with what the building would earn fully leased. That's conservative, since some costs (utilities, turnover, management fees) fall when occupancy does. Lenders like it because it states the cushion in occupancy terms, which you can hold up against the market's worst vacancy in past downturns.";
      const formula = 'Break-even occupancy = (operating expenses + debt service) ÷ potential gross income\nMax debt service = target break-even × potential gross income − operating expenses';

      if (mode === 'be') {
        const ads = Math.round(noi / r.step(1.2, 1.5, 0.05) / 1e4) * 1e4;
        const be = (opex + ads) / pgi;
        const room = occ - be;
        const adsS = `[[${money(ads, 2)}]]`;
        return {
          q: `A ${unitsS}-unit building would earn ${incomeS} per unit a month fully leased. Opex is [[${dollars(opexUnit)}]] per unit a year; debt service is ${adsS} a year. What's the break-even occupancy? It's [[${pct(occ, 1)}]] occupied today.`,
          a: `${pct(be, 1)}. Occupancy could fall ${num(room * 100, 1)} points from ${pct(occ, 1)} before cash flow after debt service turns negative.`,
          why,
          formula,
          steps: [
            pgiStep,
            opexStep,
            `Break-even: (${exact(opex)} + ${adsS}) ÷ ${exact(pgi)} = ${pct(be, 1)}`,
            `Cushion: [[${pct(occ, 1)}]] − ${pct(be, 1)} = ${num(room * 100, 1)} percentage points of occupancy`
          ],
          visual: { kind: 'bars', unit: '%', dp: 1, items: [
            { label: 'Occupancy today', value: round(occ * 100, 1) },
            { label: 'Break-even', value: round(be * 100, 1), highlight: true }
          ] },
          values: { mode: 1, be, ads, opex, units, rent, other, occ, target: be }
        };
      }

      const target = r.pick([0.8, 0.85, 0.85, 0.9]);
      const k = r.step(0.06, 0.08, 0.0025);
      const ads = target * pgi - opex;
      const loan = ads / k;
      const inc = target * pgi;
      return {
        q: `A ${unitsS}-unit building would earn ${incomeS} per unit a month fully leased. Opex is [[${dollars(opexUnit)}]] per unit a year. The lender caps break-even occupancy at [[${pct(target, 0)}]]. What's the max debt service, and the loan at ${an(pct(k, 2))} [[${pct(k, 2)}]] constant?`,
        a: `${money(ads)} a year, which supports about ${money(loan)} at ${an(pct(k, 2))} ${pct(k, 2)} constant. At ${pct(target, 0)} occupancy, income would just cover expenses and debt service.`,
        why,
        formula,
        steps: [
          pgiStep,
          opexStep,
          `Income at [[${pct(target, 0)}]] occupancy: [[${pct(target, 0)}]] × ${exact(pgi)} = ${exact(inc)}`,
          `Max debt service: ${exact(inc)} − ${exact(opex)} = ${exact(ads)}`,
          `Loan: ${exact(ads)} ÷ [[${pct(k, 2)}]] = ${money(loan)}`
        ],
        visual: { kind: 'stack', unit: '$M', dp: 2, items: [
          { label: 'Operating expenses', value: toM(opex) },
          { label: 'Max debt service', value: toM(ads), highlight: true },
          { label: `Vacancy room (${pct(1 - target, 0)})`, value: round(toM(pgi) - toM(opex) - toM(ads), 2) }
        ], caption: `Potential gross income of ${money(pgi)}` },
        values: { mode: 2, be: target, ads, opex, units, rent, other, occ, target, loan, k }
      };
    },
    // Second way: rebuild cash flow unit by unit at the break-even (or target) occupancy; it must come out to zero.
    check(p) {
      const v = p.values;
      const cf = v.units * (v.rent + v.other) * 12 * v.target - v.opex - v.ads;
      const zero = Math.abs(cf) < 1e-6 * v.ads;
      return v.mode === 1 ? zero && v.occ > v.be : zero && near(v.loan * v.k, v.ads, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Cash-out refinance
  Drills.add({
    id: 'drill-re-cash-out-refi',
    track: 're',
    module: 're-debt',
    topic: 'Cash-out refinance',
    level: 2,
    ranges: { cashOut: [1e5, 6e7], newLoan: [5e6, 2e8] },
    make(r) {
      const noi = r.step(1000, 6000, 10) * 1000;
      const cap = r.step(0.05, 0.07, 0.0025);
      const value = noi / cap;
      const ltv = r.step(0.6, 0.75, 0.05);
      const useDY = r.chance(0.7);
      const dy = r.step(0.08, 0.1, 0.0025);
      const ltvLoan = value * ltv;
      const dyLoan = noi / dy;
      const newLoan = useDY ? Math.min(ltvLoan, dyLoan) : ltvLoan;
      const bind = !useDY ? 'LTV' : Math.abs(ltvLoan - dyLoan) < 5e-4 * ltvLoan ? 'both' : ltvLoan < dyLoan ? 'LTV' : 'debt yield';
      const old = Math.round(newLoan * r.step(0.5, 0.8, 0.05) / 1e5) * 1e5;
      const costPct = r.step(0.01, 0.02, 0.0025);
      const costs = newLoan * costPct;
      const penalty = !useDY && r.chance(0.5) ? r.pick([0.01, 0.02]) : 0;
      const prepay = old * penalty;
      const cashOut = newLoan - old - costs - prepay;

      const noiS = `[[${money(noi, 2)}]]`, capS = `[[${pct(cap, 2)}]]`, ltvS = `[[${pct(ltv, 0)}]]`;
      const dyS = `[[${pct(dy)}]]`, oldS = `[[${money(old, 1)}]]`, costS = `[[${pct(costPct)}]]`;
      const terms = useDY ? `up to ${ltvS} LTV with at least ${an(pct(dy))} ${dyS} debt yield` : `${ltvS} LTV`;
      const prepText = penalty ? ` The old loan carries ${an(pct(penalty, 0))} [[${pct(penalty, 0)}]] prepayment penalty.` : '';
      const steps = [
        `Value: ${noiS} ÷ ${capS} = ${money(value)}`,
        `LTV test: ${ltvS} × ${money(value)} = ${money(ltvLoan)}`
      ];
      if (useDY) {
        steps.push(`Debt yield test: ${noiS} ÷ ${dyS} = ${money(dyLoan)}`);
        steps.push(bind === 'both' ? `New loan: ${money(newLoan)}; the two tests give the same amount, so both bind` : `New loan: the lower, ${money(newLoan)}, so ${bind} binds`);
      }
      steps.push(`Closing costs: ${costS} × ${money(newLoan)} = ${money(costs)}`);
      if (penalty) steps.push(`Prepayment penalty: [[${pct(penalty, 0)}]] × ${oldS} = ${money(prepay)}`);
      steps.push(`Cash out: ${money(newLoan)} − ${oldS} − ${money(costs)}${penalty ? ` − ${money(prepay)}` : ''} = ${money(cashOut)}`);
      steps.push(`Leverage after the refinance: ${pct(newLoan / value, 1)} of value and ${an(pct(noi / newLoan, 1))} ${pct(noi / newLoan, 1)} debt yield; the old balance was ${pct(old / value, 1)} of today's value`);

      const newM = toM(newLoan), oldM = toM(old), costM = toM(costs), prepM = toM(prepay);
      const uses = [{ label: 'Repay old loan', value: oldM }, { label: 'Closing costs', value: costM }];
      if (penalty) uses.push({ label: 'Prepayment penalty', value: prepM });
      uses.push({ label: 'Cash to owner', value: round(newM - oldM - costM - prepM, 2), highlight: true });

      return {
        q: `After a renovation, NOI is ${noiS} and the property appraises at ${an(pct(cap, 2))} ${capS} cap. A new lender offers ${terms}. You owe ${oldS} on the old loan and costs are ${costS} of the new loan.${prepText} How much cash comes out?`,
        a: `About ${money(cashOut)}. The new loan is ${money(newLoan)}${useDY ? ` (${bind === 'both' ? 'both tests bind' : `${bind} binds`})` : ''}; repaying the ${money(old, 1)} balance and ${money(costs + prepay)} of costs leaves the rest for the owner.`,
        why: "A refinance pulls out value you've created without selling. The new loan is sized on today's NOI and value, so the gap between it and the old balance comes back to the equity, and because it's borrowed money it usually isn't taxed. The trade-off is more debt: higher debt service, a thinner DSCR and more refinancing risk later. When cap rates are low, the debt yield test often caps proceeds well below the LTV figure.",
        formula: 'New loan = lower of value × LTV and NOI ÷ debt yield\nCash out = new loan − old balance − closing costs − any prepayment penalty',
        steps,
        visual: { kind: 'stack', unit: '$M', dp: 2, columns: [
          { title: 'Sources', items: [{ label: 'New loan', value: newM }] },
          { title: 'Uses', items: uses }
        ] },
        values: { cashOut, newLoan, old, costs, prepay, value, noi, ltv, dy, useDY: useDY ? 1 : 0, costPct }
      };
    },
    // Second way: re-test the new loan against each limit (one must bind), and check that sources equal uses.
    check(p) {
      const v = p.values;
      const eps = 1e-9;
      const passes = v.newLoan / v.value <= v.ltv + eps && (!v.useDY || v.noi / v.newLoan >= v.dy - eps);
      const binds = near(v.newLoan, v.value * v.ltv) || (v.useDY && near(v.newLoan, v.noi / v.dy));
      return passes && binds && near(v.cashOut + v.old + v.costs + v.prepay, v.newLoan, 1e-9) && v.cashOut > 0;
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
      steps.push(`NOI = ${money(noi)}, ${an(pct(noi / egi, 0))} ${pct(noi / egi, 0)} margin on EGI`);

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
        a: `About ${money(noi)}: EGI of ${money(egi)} less ${money(fee + opex)} of expenses, ${an(pct(noi / egi, 0))} ${pct(noi / egi, 0)} margin.`,
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

  // ---------------------------------------------------------------- Cash-on-cash
  Drills.add({
    id: 'drill-re-coc',
    track: 're',
    module: 're-returns',
    topic: 'Cash-on-cash',
    level: 1,
    ranges: { coc: [0.005, 0.16], equity: [1e6, 5e7] },
    make(r) {
      const price = r.step(16, 120, 1) * 500000;
      const cap = r.step(0.05, 0.07, 0.0025);
      const noi = Math.round(price * cap / 1e4) * 1e4;
      const closing = Math.round(price * r.step(0.01, 0.03, 0.005) / 1e4) * 1e4;
      const rate = r.step(0.045, 0.065, 0.0025);
      const io = r.chance(0.5);
      const k = io ? rate : Drills.constant(rate, 30);
      // Keep DSCR at 1.25x or better, the way a lender would.
      const ltv = Math.min(r.step(0.5, 0.7, 0.05), Math.floor(noi / (1.25 * k) / price / 0.05) * 0.05);
      const loan = Math.round(price * ltv / 1e5) * 1e5;
      const ads = loan * k;
      const reserves = r.chance(0.5) ? Math.round(noi * r.step(0.03, 0.06, 0.01) / 5000) * 5000 : 0;
      const equity = price + closing - loan;
      const allCash = (noi - reserves) / (price + closing);
      const mode = r.pick(['coc', 'coc', 'noi']);

      const priceS = `[[${exact(price)}]]`, closeS = `[[${money(closing)}]]`, loanS = `[[${money(loan, 1)}]]`, rateS = `[[${pct(rate, 2)}]]`;
      const resS = `[[$${num(reserves / 1000)}K]]`;
      const terms = io ? `${rateS}, interest-only` : `${rateS} with [[30]]-year amortization`;
      const buy = `You buy for ${priceS} plus ${closeS} of closing costs, with ${an(money(loan, 1))} ${loanS} loan at ${terms}.`;
      const steps = [
        `Equity: ${priceS} + ${closeS} − ${loanS} = ${exact(equity)}`,
        io ? `Debt service: ${loanS} × ${rateS} = ${exact(ads)}` : `Debt service: ${loanS} × ${pct(k, 2)} constant (${rateS}, [[30]] years, monthly) = ${exact(ads)}`
      ];
      const why = "Cash-on-cash is the equity's cash yield: what the deal pays you each year per dollar you put in, after the lender is paid. It ignores appreciation, principal paydown and the sale, so it's a yield, not a total return. Amortization lowers it even though paying down principal builds equity, and leverage raises it only when the property's yield beats the loan constant.";
      const formula = 'Equity = price + closing costs − loan\nCash flow = NOI − debt service − reserves\nCash-on-cash = cash flow ÷ equity';

      let noiUsed = noi, q, a;
      if (mode === 'coc') {
        const cf = noi - ads - reserves;
        const coc = cf / equity;
        q = `${buy} NOI is [[${money(noi, 2)}]]${reserves ? ` and you reserve ${resS} a year for capital items` : ''}. What's the year-1 cash-on-cash return?`;
        steps.push(`Cash flow: [[${money(noi, 2)}]] − ${exact(ads)}${reserves ? ` − ${resS}` : ''} = ${exact(cf)}`);
        steps.push(`Cash-on-cash: ${exact(cf)} ÷ ${exact(equity)} = ${pct(coc, 1)}`);
        a = `${pct(coc, 1)}: ${money(cf)} of cash flow after debt service${reserves ? ' and reserves' : ''} on ${money(equity)} of equity.`;
        steps.push(`All cash it would be ${pct(allCash, 1)}, so leverage ${coc >= allCash ? 'adds' : 'costs'} ${bps(tidy(Math.abs(coc - allCash)))} of cash yield`);
        return {
          q, a, why, formula, steps,
          visual: { kind: 'waterfall', unit: '$K', dp: 0, start: { label: 'NOI', value: toK(noi) },
            steps: [{ label: 'Debt service', delta: -toK(ads) }].concat(reserves ? [{ label: 'Reserves', delta: -toK(reserves) }] : []),
            end: { label: 'Cash flow', value: toK(noi) - toK(ads) - toK(reserves) }, caption: `Cash flow ÷ ${money(equity)} of equity = ${pct(coc, 1)}` },
          values: { coc, equity, cf, noi, ads, reserves, price, closing, loan }
        };
      }

      const target = r.step(0.06, 0.1, 0.005);
      const cf = target * equity;
      noiUsed = cf + ads + reserves;
      const capNeeded = noiUsed / price;
      q = `${buy}${reserves ? ` You reserve ${resS} a year for capital items.` : ''} What NOI gives ${an(pct(target, 1))} [[${pct(target, 1)}]] cash-on-cash return in year 1, and what cap rate on the price is that?`;
      steps.push(`Cash flow needed: [[${pct(target, 1)}]] × ${exact(equity)} = ${exact(cf)}`);
      steps.push(`NOI needed: ${exact(cf)} + ${exact(ads)}${reserves ? ` + ${resS}` : ''} = ${exact(noiUsed)}`);
      steps.push(`Cap rate on the price: ${exact(noiUsed)} ÷ ${priceS} = ${pct(capNeeded, 2)}`);
      return {
        q,
        a: `About ${money(noiUsed)} of NOI, ${an(pct(capNeeded, 2))} ${pct(capNeeded, 2)} cap rate on the price.`,
        why, formula, steps,
        visual: { kind: 'waterfall', unit: '$K', dp: 0, start: { label: 'NOI needed', value: toK(noiUsed) },
          steps: [{ label: 'Debt service', delta: -toK(ads) }].concat(reserves ? [{ label: 'Reserves', delta: -toK(reserves) }] : []),
          end: { label: 'Cash flow', value: toK(noiUsed) - toK(ads) - toK(reserves) }, caption: `Cash flow ÷ ${money(equity)} of equity = ${pct(target, 1)}` },
        values: { coc: target, equity, cf, noi: noiUsed, ads, reserves, price, closing, loan }
      };
    },
    // Second way: rebuild NOI from the return (cash-on-cash × equity + debt service + reserves), and check sources equal uses.
    check(p) {
      const v = p.values;
      return near(v.coc * v.equity + v.ads + v.reserves, v.noi, 1e-9) && near(v.equity + v.loan, v.price + v.closing, 1e-9) && v.coc > 0;
    }
  });

  // ---------------------------------------------------------------- Equity multiple
  Drills.add({
    id: 'drill-re-equity-multiple',
    track: 're',
    module: 're-returns',
    topic: 'Equity multiple',
    level: 1,
    ranges: { em: [1.1, 3.5], total: [5e6, 1.5e8], irr: [0.02, 0.4] },
    make(r) {
      const equity = r.step(10, 80, 1) * 500000;
      const n = r.int(3, 7);
      const y0 = r.step(0.04, 0.08, 0.005);
      const g = r.step(0.02, 0.05, 0.01);
      const dists = [];
      for (let t = 1; t <= n; t++) dists.push(Math.round(equity * y0 * Math.pow(1 + g, t - 1) / 1e4) * 1e4);
      const refi = n >= 4 && r.chance(0.35) ? { year: r.int(2, n - 1), amount: Math.round(equity * r.step(0.2, 0.5, 0.05) / 1e5) * 1e5 } : null;
      const opSum = dists.reduce((s, x) => s + x, 0);
      const refiAmt = refi ? refi.amount : 0;
      const mode = r.pick(['multiple', 'multiple', 'target']);
      // Multiples in line with the hold: roughly an 8–17% annual return compounded over it.
      const targetEm = Math.max(1.3, round(Math.pow(1 + r.step(0.08, 0.15, 0.01), n), 1));
      const sale = mode === 'target'
        ? targetEm * equity - opSum - refiAmt
        : Math.max(Math.round(equity * 0.3 / 1e5) * 1e5, Math.round((equity * Math.pow(1 + r.step(0.08, 0.17, 0.01), n) - opSum - refiAmt) / 1e5) * 1e5);
      const total = opSum + refiAmt + sale;
      const em = total / equity;
      const cfs = [-equity].concat(dists.map((d, i) => d + (refi && refi.year === i + 1 ? refiAmt : 0) + (i === n - 1 ? sale : 0)));
      const irr = Drills.irr(cfs);

      const eqS = `[[${exact(equity)}]]`;
      const dS = dists.map((d) => `[[${money(d, 2)}]]`);
      const list = `${dS.slice(0, -1).join(', ')} and ${dS[n - 1]}`;
      const refiText = refi ? ` A refinance also returns [[${money(refiAmt, 1)}]] in year ${refi.year}.` : '';
      const steps = [`Operating distributions: ${dS.join(' + ')} = ${exact(opSum)}`];
      if (refi) steps.push(`Refinance distribution: [[${money(refiAmt, 1)}]] in year ${refi.year}`);
      let q, a;
      if (mode === 'multiple') {
        q = `You invest ${eqS} of equity. It distributes ${list} in years 1–${n}, plus [[${money(sale, 1)}]] of sale proceeds in year ${n}.${refiText} What's the equity multiple?`;
        steps.push(`Total back: ${exact(opSum)}${refi ? ` + [[${money(refiAmt, 1)}]]` : ''} + [[${money(sale, 1)}]] = ${exact(total)}`);
        steps.push(`Equity multiple: ${exact(total)} ÷ ${eqS} = ${mult(em, 2)}, ${an(money(total - equity))} ${money(total - equity)} profit`);
        a = `${mult(em, 2)}: ${money(total)} back on ${money(equity)} invested, ${an(money(total - equity))} ${money(total - equity)} profit.`;
      } else {
        q = `You invest ${eqS} of equity. It distributes ${list} in years 1–${n}.${refiText} What must the year-${n} sale return to the equity for a [[${mult(targetEm, 1)}]] equity multiple?`;
        steps.push(`Total needed: [[${mult(targetEm, 1)}]] × ${eqS} = ${exact(total)}`);
        steps.push(`Sale proceeds: ${exact(total)} − ${exact(opSum)}${refi ? ` − [[${money(refiAmt, 1)}]]` : ''} = ${exact(sale)}`);
        a = `${money(sale)}. A ${mult(targetEm, 1)} multiple means ${money(total)} back in total, and the ${refi ? 'distributions and refinance' : 'annual distributions'} cover ${money(opSum + refiAmt)} of it.`;
      }
      steps.push(`For context, the IRR on these flows is ${pct(irr, 1)}. The multiple ignores when the cash arrives; the IRR doesn't`);

      return {
        q,
        a,
        why: "The equity multiple counts dollars: everything you got back divided by what you put in, so 1.8x means $1.80 back for each $1, a profit of $0.80. It ignores time, so 1.8x over three years and over ten look the same, which is why it's always quoted next to the IRR. A refinance distribution counts like any other cash back, and anything below 1.0x lost money however the cash was timed.",
        formula: 'Equity multiple = total distributions ÷ equity invested\nProfit = total distributions − equity invested',
        steps,
        visual: { kind: 'bars', unit: '$M', dp: 2, items: cfs.slice(1).map((c, i) => ({
          label: i === n - 1 ? `Year ${n} (with sale)` : refi && refi.year === i + 1 ? `Year ${i + 1} (with refi)` : `Year ${i + 1}`,
          value: toM(c), highlight: i === n - 1
        })), caption: `Cash back to the equity each year, against ${money(equity)} invested` },
        values: { em, total, irr, equity, cfs }
      };
    },
    // Second way: NPV at a 0% rate is the profit, and the IRR must zero out the NPV.
    check(p) {
      const v = p.values;
      return near(Drills.npv(0, v.cfs), v.total - v.equity, 1e-9) && near(v.em, 1 + Drills.npv(0, v.cfs) / v.equity, 1e-9) &&
        Math.abs(Drills.npv(v.irr, v.cfs)) < 1e-6 * v.equity;
    }
  });

  // ---------------------------------------------------------------- Unlevered vs levered IRR
  Drills.add({
    id: 'drill-re-irr',
    track: 're',
    module: 're-returns',
    topic: 'Unlevered vs levered IRR',
    level: 2,
    ranges: { uIrr: [0.02, 0.15], lIrr: [-0.1, 0.35] },
    make(r) {
      const price = r.step(20, 120, 1) * 500000;
      const cap = r.step(0.05, 0.07, 0.0025);
      const noi1 = Math.round(price * cap / 1e4) * 1e4;
      const g = r.step(0.02, 0.04, 0.005);
      const n = r.pick([3, 5, 5, 7]);
      const exitCap = round(noi1 / price + r.step(0, 0.005, 0.0025), 4);
      const exitC = Math.round(exitCap / 0.0025) * 0.0025;
      const sc = r.pick([0.01, 0.015, 0.02, 0.02]);
      const rate = r.step(0.045, 0.075, 0.0025);
      const ltv = r.step(0.5, 0.7, 0.05);
      const loan = Math.min(price * ltv, Math.floor(noi1 / (1.2 * rate) / 1e5) * 1e5);
      const interest = loan * rate;
      const nois = [];
      for (let t = 1; t <= n + 1; t++) nois.push(t === 1 ? noi1 : Math.round(noi1 * Math.pow(1 + g, t - 1) / 1000) * 1000);
      const gross = nois[n] / exitC;
      const net = gross * (1 - sc);
      const u = [-price], l = [-(price - loan)];
      for (let t = 1; t <= n; t++) {
        u.push(nois[t - 1] + (t === n ? net : 0));
        l.push(nois[t - 1] - interest + (t === n ? net - loan : 0));
      }
      const uIrr = Drills.irr(u), lIrr = Drills.irr(l);
      // The gap as the reader sees it: difference of the rounded IRRs, in points.
      const lift = round(round(lIrr * 100, 1) - round(uIrr * 100, 1), 1);

      const priceS = `[[${exact(price)}]]`, noiS = `[[${money(noi1, 2)}]]`, rateS = `[[${pct(rate, 2)}]]`;
      const loanS = exact(loan);
      const m2 = (x) => money(x, 2);
      const verdict = lift === 0
        ? `Leverage barely moves it: the property earns about what the ${pct(rate, 2)} debt costs.`
        : lift > 0
          ? `Leverage adds ${num(lift, 1)} points because the property's ${pct(uIrr, 1)} return beats the ${pct(rate, 2)} cost of debt.`
          : `Leverage costs ${num(-lift, 1)} points: the ${pct(rate, 2)} debt costs more than the property's ${pct(uIrr, 1)} return.`;
      const loanText = loan < price * ltv - 1
        ? `Loan: ${loanS}, cut from [[${pct(ltv, 0)}]] LTV to keep a 1.20x interest coverage; interest ${rateS} × ${loanS} = ${exact(interest)} a year`
        : `Loan: [[${pct(ltv, 0)}]] × ${priceS} = ${loanS}; interest ${rateS} × ${loanS} = ${exact(interest)} a year`;
      const cell = (x) => money(x, 2);
      return {
        q: `You buy for ${priceS} with year-1 NOI of ${noiS}, growing [[${pct(g, 1)}]] a year. You sell after [[${n}]] years at ${an(pct(exitC, 2))} [[${pct(exitC, 2)}]] cap on forward NOI, less [[${pct(sc, 1)}]] costs. Debt: [[${pct(ltv, 0)}]] LTV, interest-only at ${rateS}. Unlevered and levered IRR?`,
        a: `Unlevered ${pct(uIrr, 1)}, levered ${pct(lIrr, 1)}. ${verdict}`,
        why: "Unlevered IRR measures the property: the full price, NOI each year and the net sale. Levered IRR measures the equity: a smaller check, cash flow after interest, and sale proceeds after the loan is repaid. Debt is a fixed claim, so any return above its cost goes to the equity and any shortfall comes out of it. The lender's own cash flows earn exactly the loan rate, so the unlevered IRR is roughly a blend of the levered IRR and the cost of debt.",
        formula: 'Unlevered cash flows: −price, NOI each year, net sale proceeds at exit\nLevered cash flows: −equity, NOI − debt service, net sale proceeds − loan at exit\nIRR = the discount rate that makes the NPV of the cash flows zero',
        steps: [
          `Exit: year-${n + 1} NOI of ${money(nois[n], 3)} ÷ [[${pct(exitC, 2)}]] = ${m2(gross)}, less [[${pct(sc, 1)}]] costs = ${m2(net)}`,
          `Unlevered: −${exact(price)} today, NOI in years 1–${n}, plus ${m2(net)} in year ${n}. IRR = ${pct(uIrr, 1)}`,
          loanText,
          `Levered: −${exact(price - loan)} of equity, NOI less ${exact(interest)} each year, plus ${m2(net)} − ${loanS} = ${m2(net - loan)} in year ${n}. IRR = ${pct(lIrr, 1)}`,
          verdict,
          `Check: discounting each stream at its own IRR gives an NPV of $0`
        ],
        visual: { kind: 'table', headers: ['Year', 'Unlevered', 'Levered'], rows: u.map((x, t) => [String(t), cell(x), cell(l[t])]).concat([['IRR', pct(uIrr, 1), pct(lIrr, 1)]]),
          caption: `Year ${n} includes the sale; NOI grows ${pct(g, 1)} a year from ${money(noi1, 2)}` },
        values: { uIrr, lIrr, rate, u, l, price }
      };
    },
    // Second way: NPV at each IRR must be zero, and the lender's cash flows (unlevered − levered) must earn exactly the loan rate.
    check(p) {
      const v = p.values;
      const debt = v.u.map((x, t) => x - v.l[t]);
      return Math.abs(Drills.npv(v.uIrr, v.u)) < 1e-6 * v.price && Math.abs(Drills.npv(v.lIrr, v.l)) < 1e-6 * v.price &&
        near(Drills.irr(debt), v.rate, 1e-7);
    }
  });

  // ---------------------------------------------------------------- Positive vs negative leverage
  Drills.add({
    id: 'drill-re-leverage',
    track: 're',
    module: 're-returns',
    topic: 'Positive vs negative leverage',
    level: 2,
    ranges: { cocHigh: [0.005, 0.2], cocLow: [0.005, 0.2], cap: [0.05, 0.075] },
    make(r) {
      const price = r.step(12, 60, 4) * 1e6;
      const cap = r.step(0.05, 0.075, 0.0025);
      const noi = price * cap;
      const io = r.chance(0.55);
      // Interest-only debt priced a little above or below the cap rate (never exactly at it); amortizing debt at or below it.
      const spread = r.pick([-0.015, -0.0125, -0.01, -0.0075, -0.005, -0.0025, 0.0025, 0.005, 0.0075, 0.01, 0.0125, 0.015]);
      const rate = io ? round(cap + spread, 4) : Math.max(0.04, round(cap + r.step(-0.02, 0, 0.0025), 4));
      const k = io ? rate : Drills.constant(rate, 30);
      // Only leverage levels a lender would allow: DSCR of at least 1.15x.
      const highs = [0.6, 0.65, 0.7, 0.75].filter((L) => cap / (L * k) >= 1.15);
      const high = highs.length ? r.pick(highs) : 0.5;
      const low = r.pick([0.3, 0.4, 0.5].filter((L) => L <= high - 0.15));
      const lev = (L) => {
        const loan = price * L, ds = loan * k, cf = noi - ds, eq = price - loan;
        return { L, loan, ds, cf, eq, coc: cf / eq };
      };
      const lo = lev(low), hi = lev(high);
      const kind = Math.abs(k - cap) < 1e-9 ? 'neutral' : k < cap ? 'positive' : 'negative';

      const priceS = `[[${money(price, 1)}]]`, noiS = `[[${exact(noi)}]]`, rateS = `[[${pct(rate, 2)}]]`;
      const loS = `[[${pct(low, 0)}]]`, hiS = `[[${pct(high, 0)}]]`;
      const row = (x, s) => `At ${s} LTV: ${money(x.loan, 1)} loan, ${money(x.ds)} of debt service, ${money(x.cf)} of cash flow on ${money(x.eq, 1)} of equity = ${pct(x.coc, 2)}`;
      const steps = [
        `All-cash yield (the cap rate): ${noiS} ÷ ${priceS} = ${pct(cap, 2)}`,
        io ? `Loan constant: ${rateS}, since the loan is interest-only` : `Loan constant: ${rateS} over [[30]] years, monthly = ${pct(k, 2)} a year`,
        row(lo, loS),
        row(hi, hiS),
        kind === 'neutral' ? 'The constant equals the cap rate, so debt earns exactly what it costs and the cash yield stays put'
          : `The ${pct(k, 2)} constant is ${kind === 'positive' ? 'below' : 'above'} the ${pct(cap, 2)} cap rate, so each borrowed dollar ${kind === 'positive' ? 'earns more than it costs' : 'costs more than it earns'}: leverage is ${kind}`
      ];
      if (!io && rate < cap && k > cap) steps.push(`The trap: the ${rateS} rate is below the cap rate, but amortization lifts the constant to ${pct(k, 2)}, so leverage still cuts the cash yield`);
      const title = kind === 'neutral' ? 'Neutral' : kind === 'positive' ? 'Positive' : 'Negative';
      return {
        q: `A ${priceS} property earns ${noiS} of NOI. Debt costs ${rateS}${io ? ', interest-only' : ' with [[30]]-year amortization'}. What's the year-1 cash-on-cash return all-cash, at ${loS} LTV and at ${hiS} LTV? Is the leverage positive or negative?`,
        a: `${title}: ${pct(cap, 2)} all-cash, ${pct(lo.coc, 2)} at ${pct(low, 0)} LTV and ${pct(hi.coc, 2)} at ${pct(high, 0)}. ${kind === 'neutral' ? 'The loan constant equals the cap rate, so debt leaves the cash yield unchanged.' : `The ${pct(k, 2)} loan constant is ${kind === 'positive' ? 'below' : 'above'} the ${pct(cap, 2)} cap rate, so more debt ${kind === 'positive' ? 'raises' : 'lowers'} the cash yield.`}`,
        why: "Every borrowed dollar earns the property's yield (the cap rate) but costs the loan constant. When the cap rate is higher, the spread goes to the equity and cash-on-cash rises with each extra turn of debt; when the constant is higher, the equity subsidizes the lender and cash-on-cash falls. Compare the cap rate with the constant, not the interest rate. Buyers sometimes accept negative leverage on day one because they expect NOI growth to fix it, but that's a bet on growth.",
        formula: 'Loan constant = annual debt service ÷ loan\nCash-on-cash = (NOI − loan × constant) ÷ equity\nShortcut: cash-on-cash = cap + (cap − constant) × LTV ÷ (1 − LTV)',
        steps,
        visual: { kind: 'bars', unit: '%', dp: 2, items: [
          { label: 'All cash', value: round(cap * 100, 2) },
          { label: `${pct(low, 0)} LTV`, value: round(lo.coc * 100, 2) },
          { label: `${pct(high, 0)} LTV`, value: round(hi.coc * 100, 2), highlight: true }
        ], caption: `Cash-on-cash; loan constant ${pct(k, 2)} vs cap rate ${pct(cap, 2)}` },
        values: { cocLow: lo.coc, cocHigh: hi.coc, cap, k, low, high, noi, price }
      };
    },
    // Second way: the leverage identity, cash-on-cash = cap + (cap − constant) × LTV ÷ (1 − LTV), at both levels.
    check(p) {
      const v = p.values;
      const f = (L) => v.cap + (v.cap - v.k) * L / (1 - L);
      const sign = Math.sign(round(v.cap - v.k, 12)) === Math.sign(round(v.cocHigh - v.cocLow, 12));
      return near(f(v.low), v.cocLow, 1e-9) && near(f(v.high), v.cocHigh, 1e-9) && sign;
    }
  });

  // ---------------------------------------------------------------- Net effective rent
  Drills.add({
    id: 'drill-re-ner',
    track: 're',
    module: 're-leases',
    topic: 'Net effective rent',
    level: 2,
    ranges: { ner: [5, 120], ratio: [0.4, 1], nerD: [0, 120] },
    make(r) {
      const T = r.pick([5, 7, 10, 10]);
      const B = r.step(24, 60, 0.5);
      const esc = r.pick(['flat', 'fixed', 'fixed', 'pct', 'pct', 'pct']);
      const bump = esc === 'fixed' ? r.pick([0.5, 0.75, 1, 1.5]) : 0;
      const g = esc === 'pct' ? r.pick([0.025, 0.03, 0.03, 0.035]) : 0;
      const rents = [];
      for (let t = 1; t <= T; t++) rents.push(esc === 'fixed' ? B + bump * (t - 1) : B * Math.pow(1 + g, t - 1));
      const R = rents.reduce((s, x) => s + x, 0);
      const F = Math.min(12, Math.max(2, Math.round(T * r.step(0.5, 1.2, 0.1))));
      const free = F / 12 * B;
      const TI = Math.max(10, Math.round(B * T * r.step(0.1, 0.2, 0.01) / 5) * 5);
      const lc = r.step(0.04, 0.06, 0.005);
      const LC = lc * R;
      const net = R - free - TI - LC;
      const ner = net / T;
      const avg = R / T;
      const disc = r.chance(0.5);
      const d = r.pick([0.07, 0.08, 0.09]);
      const flows = [-(TI + LC)].concat(rents.map((x, i) => x - (i === 0 ? free : 0)));
      const af = (1 - Math.pow(1 + d, -T)) / d;
      const pvRent = Drills.npv(d, [0].concat(flows.slice(1)));
      const nerD = disc ? (pvRent - TI - LC) / af : 0;

      const BS = `[[${dollars(B, 2)}]]`, TS = `[[${T}]]`;
      const escText = esc === 'flat' ? ', flat for the term' : esc === 'fixed' ? ` and rises [[${dollars(bump, 2)}]] a year` : ` and rises [[${pct(g, 1)}]] a year`;
      const rentStep = esc === 'flat'
        ? `Base rent over the term: ${BS} × ${TS} = ${dollars(R, 2)} per SF`
        : esc === 'fixed'
          ? `Base rent over the term: ${TS} × ${BS} + [[${dollars(bump, 2)}]] × (0 + 1 + … + ${T - 1} = ${T * (T - 1) / 2}) = ${dollars(R, 2)} per SF`
          : `Base rent over the term: ${BS} × ((1 + [[${pct(g, 1)}]])^${T} − 1) ÷ [[${pct(g, 1)}]] = ${dollars(R, 2)} per SF`;
      const steps = [
        rentStep,
        `Free rent: [[${F}]] months × ${BS} ÷ 12 = ${dollars(free, 2)}`,
        `TI allowance: [[${dollars(TI, 2)}]]`,
        `Leasing commissions: [[${pct(lc, 1)}]] × ${dollars(R, 2)} = ${dollars(LC, 2)}`,
        `Net rent: ${dollars(R, 2)} − ${dollars(free, 2)} − [[${dollars(TI, 2)}]] − ${dollars(LC, 2)} = ${dollars(net, 2)} per SF over ${TS} years`,
        `NER: ${dollars(net, 2)} ÷ ${TS} = ${psf(ner)} a year, ${pct(1 - ner / avg, 0)} below the ${psf(avg)} average face rent`
      ];
      if (disc) {
        steps.push(`Discounted at [[${pct(d, 0)}]] (annual periods, rent at each year end, TI and commissions at signing): PV of rent after free rent = ${dollars(pvRent, 2)}`);
        steps.push(`Less TI and commissions: ${dollars(pvRent, 2)} − ${dollars(TI + LC, 2)} = ${dollars(pvRent - TI - LC, 2)}; ÷ ${num(af, 3)} (${T}-year annuity factor) = ${psf(nerD)}`);
      }
      const lease = `A ${TS}-year office lease starts at ${BS}/SF${escText}. The landlord gives [[${F}]] months free and ${an(dollars(TI, 2))} [[${dollars(TI, 2)}]]/SF TI allowance, and pays [[${pct(lc, 1)}]] commissions on total base rent.`;
      return {
        q: disc ? `${lease} What's the net effective rent, undiscounted and at ${an(pct(d, 0))} [[${pct(d, 0)}]] discount rate?` : `${lease} What's the net effective rent, undiscounted?`,
        a: `${psf(ner)} a year undiscounted, ${pct(1 - ner / avg, 0)} below the ${psf(avg)} average face rent.` + (disc ? ` Discounted at ${pct(d, 0)}, ${psf(nerD)}: the concessions come first and the rent later.` : ''),
        why: "Face rent overstates what a landlord earns when it hands money back through free rent, a TI allowance and commissions. Net effective rent nets those out and spreads the rest over the term, so you can compare proposals with different packages, or see whether rising face rents are just being given back. The undiscounted version is the quick check. Discounting lowers NER further, because the concessions are paid up front while the rent arrives over years.",
        formula: 'Net rent = total base rent − free rent − TI − leasing commissions\nNER (undiscounted) = net rent ÷ lease years\nNER (discounted) = PV of the net cash flows ÷ annuity factor',
        steps,
        visual: { kind: 'waterfall', unit: '$/SF', dp: 2, start: { label: `Base rent, ${T} years`, value: round(R, 2) }, steps: [
          { label: 'Free rent', delta: -round(free, 2) },
          { label: 'TI allowance', delta: -round(TI, 2) },
          { label: 'Commissions', delta: -round(LC, 2) }
        ], end: { label: 'Net rent', value: round(net, 2) }, caption: `÷ ${T} years = ${psf(ner)} a year` },
        values: { ner, nerD, ratio: ner / avg, flows, d, disc: disc ? 1 : 0, T }
      };
    },
    // Second way: add up the year-by-year net cash flows, and match the PV of the flows to the PV of a level NER.
    check(p) {
      const v = p.values;
      const total = v.flows.reduce((s, x) => s + x, 0);
      const level = [0].concat(new Array(v.T).fill(v.nerD));
      return near(total, v.ner * v.T, 1e-9) && (!v.disc || near(Drills.npv(v.d, v.flows), Drills.npv(v.d, level), 1e-9));
    }
  });

  // ---------------------------------------------------------------- Expense stops and base years
  Drills.add({
    id: 'drill-re-recoveries',
    track: 're',
    module: 're-leases',
    topic: 'Expense stops and base years',
    level: 2,
    ranges: { rec: [0, 6e5] },
    make(r) {
      const mode = r.pick(['base', 'stop', 'compare']);
      const why = "Both structures make the landlord cover operating expenses up to a set level and pass increases to the tenant. A base year sets the level at the actual expenses in the lease's first year; an expense stop fixes it at a negotiated dollar amount per SF. Either way the landlord's exposure is capped, so rising taxes or insurance don't erode its NOI. Tenants pay only for increases, not decreases, and landlords usually gross up variable costs to a stabilized occupancy so a half-empty base year doesn't set the bar too low.";
      const formula = 'Pro-rata share = tenant SF ÷ building SF\nBase-year recovery = pro-rata share × (this year\'s expenses − base-year expenses)\nExpense-stop recovery = tenant SF × (expenses per SF − stop), if positive';
      const stackOf = (landlord, tenant) => [
        { label: 'Landlord pays', value: round(landlord, 2) },
        { label: 'Tenant reimburses', value: round(tenant, 2), highlight: true }
      ];

      if (mode === 'base') {
        const bldg = r.pick([100000, 120000, 150000, 200000, 240000, 250000, 300000]);
        const share = r.step(0.02, 0.15, 0.0025);
        const sf = bldg * share;
        const baseTot = Math.round(bldg * r.step(9, 16, 0.25) / 1e4) * 1e4;
        const curTot = Math.round(baseTot * (1 + r.step(0.03, 0.15, 0.01)) / 1e4) * 1e4;
        const inc = curTot - baseTot;
        const rec = share * inc;
        const baseS = `[[${money(baseTot, 2)}]]`, curS = `[[${money(curTot, 2)}]]`;
        return {
          q: `A tenant leases [[${num(sf)}]] SF of a [[${num(bldg)}]] SF office building and pays increases over its base year. Operating expenses were ${baseS} in the base year and are ${curS} this year. What does the tenant owe in recoveries?`,
          a: `${dollars(rec)} a year (${psf(rec / sf)}): its ${pct(share, 2)} share of the ${exact(inc)} increase over the base year.`,
          why, formula,
          steps: [
            `Pro-rata share: [[${num(sf)}]] ÷ [[${num(bldg)}]] = ${pct(share, 2)}`,
            `Increase over the base year: ${curS} − ${baseS} = ${exact(inc)}`,
            `Recovery: ${pct(share, 2)} × ${exact(inc)} = ${dollars(rec)}, or ${psf(rec / sf)}`,
            `The landlord still carries the tenant's share of base-year costs: ${pct(share, 2)} × ${baseS} = ${dollars(share * baseTot)}`
          ],
          visual: { kind: 'stack', unit: '$/SF', dp: 2, items: stackOf(baseTot / bldg, inc / bldg), caption: `This year's expenses of ${psf(curTot / bldg)}, split between landlord and tenant` },
          values: { mode: 1, rec, share, baseTot, curTot, sf, bldg }
        };
      }

      if (mode === 'stop') {
        const sf = r.step(2500, 40000, 500);
        const stop = r.step(8, 14, 0.25);
        const cur = round(stop + (r.chance(0.15) ? -r.step(0.25, 0.75, 0.05) : r.step(0.25, 2.5, 0.05)), 2);
        const over = Math.max(0, cur - stop);
        const rec = sf * over;
        const stopS = `[[${psf(stop)}]]`, curS = `[[${psf(cur)}]]`;
        return {
          q: `A tenant's lease has ${an(psf(stop))} ${stopS} expense stop on its [[${num(sf)}]] SF. Operating expenses run ${curS} this year. What does the tenant pay in recoveries?`,
          a: over > 0 ? `${dollars(rec)} a year: ${psf(over)} above the stop on ${num(sf)} SF.` : `Nothing. Expenses of ${psf(cur)} are below the ${psf(stop)} stop, and a stop doesn't give the tenant a credit for the shortfall.`,
          why, formula,
          steps: over > 0 ? [
            `Excess over the stop: ${curS} − ${stopS} = ${psf(over)}`,
            `Recovery: ${psf(over)} × [[${num(sf)}]] SF = ${dollars(rec)}`,
            `The landlord bears the first ${stopS}: ${dollars(stop * sf)} a year on this space`
          ] : [
            `Expenses of ${curS} are ${psf(stop - cur)} below the ${stopS} stop`,
            `Recovery: $0. The landlord keeps the saving; the tenant pays only when expenses exceed the stop`
          ],
          visual: { kind: 'stack', unit: '$/SF', dp: 2, items: stackOf(Math.min(cur, stop), over), caption: `This year's expenses of ${psf(cur)}` },
          values: { mode: 2, rec, sf, stop, cur }
        };
      }

      const sf = r.step(5000, 25000, 500);
      const cur = r.step(11, 16, 0.05);
      const baseA = round(cur - r.step(0.4, 2, 0.05), 2);
      const stopB = round(cur - r.step(0.8, 3, 0.05), 2);
      const recA = sf * (cur - baseA), recB = sf * (cur - stopB);
      const curS = `[[${psf(cur)}]]`, aS = `[[${psf(baseA)}]]`, bS = `[[${psf(stopB)}]]`;
      return {
        q: `Two tenants each lease [[${num(sf)}]] SF. A pays increases over its base year, when expenses were ${aS}; B has an expense stop at ${bS}. Expenses are now ${curS}. What does each pay in recoveries?`,
        a: `A pays ${dollars(recA)} and B pays ${dollars(recB)}. The mechanics are the same; only the level where the landlord's share is fixed differs: ${psf(baseA)} for A, ${psf(stopB)} for B.`,
        why, formula,
        steps: [
          `A: (${curS} − ${aS}) × [[${num(sf)}]] SF = ${psf(cur - baseA)} × ${num(sf)} = ${dollars(recA)}`,
          `B: (${curS} − ${bS}) × [[${num(sf)}]] SF = ${psf(cur - stopB)} × ${num(sf)} = ${dollars(recB)}`,
          `The landlord absorbs ${psf(baseA)} on A's space and ${psf(stopB)} on B's, so ${recB > recA ? 'the lower stop pushes more of the cost to B' : 'the lower base year pushes more of the cost to A'}`
        ],
        visual: { kind: 'stack', unit: '$/SF', dp: 2, columns: [
          { title: 'A: base year', items: stackOf(baseA, cur - baseA) },
          { title: 'B: expense stop', items: stackOf(stopB, cur - stopB) }
        ], caption: `This year's expenses of ${psf(cur)} on each tenant's space` },
        values: { mode: 3, rec: recA, recB, sf, cur, baseA, stopB }
      };
    },
    // Second way: the landlord's part plus the tenant's recovery must add up to the tenant's full share of this year's expenses.
    check(p) {
      const v = p.values;
      if (v.mode === 1) return near(v.rec + v.share * v.baseTot, v.sf / v.bldg * v.curTot, 1e-9);
      if (v.mode === 2) return near(v.rec + v.sf * Math.min(v.cur, v.stop), v.sf * v.cur, 1e-9) && v.rec >= 0;
      return near(v.rec + v.sf * v.baseA, v.sf * v.cur, 1e-9) && near(v.recB + v.sf * v.stopB, v.sf * v.cur, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Loss-to-lease
  Drills.add({
    id: 'drill-re-loss-to-lease',
    track: 're',
    module: 're-leases',
    topic: 'Loss-to-lease',
    level: 2,
    ranges: { ltlPct: [0.003, 0.12], annual: [5e3, 3e6], value: [1e5, 6e7] },
    make(r) {
      const TYPES = [
        { name: 'Studio', plural: 'studios', lo: 1000, hi: 1800, uLo: 20, uHi: 80 },
        { name: '1BR', plural: '1BRs', lo: 1200, hi: 2200, uLo: 40, uHi: 160 },
        { name: '2BR', plural: '2BRs', lo: 1600, hi: 2900, uLo: 30, uHi: 120 },
        { name: '3BR', plural: '3BRs', lo: 2100, hi: 3600, uLo: 10, uHi: 40 }
      ];
      const count = r.int(2, 3);
      const first = r.int(0, TYPES.length - count);
      const lvl = r.next();
      const mix = TYPES.slice(first, first + count).map((t, i) => {
        const market = Math.round((t.lo + (t.hi - t.lo) * Math.min(1, Math.max(0, lvl + r.step(-0.1, 0.1, 0.02)))) / 25) * 25;
        // Usually below market; the last type is sometimes leased above it (gain-to-lease).
        const gap = i === count - 1 && r.chance(0.3) ? r.step(-0.03, -0.01, 0.01) : r.step(0.02, 0.1, 0.01);
        const inPlace = Math.round(market * (1 - gap) / 5) * 5;
        return { name: t.name, plural: t.plural, units: r.step(t.uLo, t.uHi, 2), market, inPlace };
      });
      // If an above-market type outweighs the rest, flip it below market so the building shows a loss-to-lease overall.
      const gapOf = () => mix.reduce((s, m) => s + m.units * (m.market - m.inPlace), 0);
      if (gapOf() <= 0.01 * mix.reduce((s, m) => s + m.units * m.market, 0)) {
        const last = mix[count - 1];
        last.inPlace = Math.round(last.market * 0.97 / 5) * 5;
      }
      const monthly = gapOf();
      const annual = monthly * 12;
      const gprMkt = mix.reduce((s, m) => s + m.units * m.market * 12, 0);
      const ltlPct = annual / gprMkt;
      const cap = r.step(0.045, 0.06, 0.0025);
      const value = annual / cap;
      const above = mix.filter((m) => m.inPlace > m.market);

      const desc = mix.map((m) => `[[${m.units}]] ${m.plural} at [[${dollars(m.inPlace)}]] vs [[${dollars(m.market)}]]`).join('; ');
      const steps = mix.map((m) => `${m.plural[0].toUpperCase() + m.plural.slice(1)}: [[${m.units}]] × ([[${dollars(m.market)}]] − [[${dollars(m.inPlace)}]]) = ${m.market >= m.inPlace ? '' : '−'}${dollars(Math.abs(m.units * (m.market - m.inPlace)))} a month`);
      steps.push(`Total: ${dollars(monthly)} a month × 12 = ${exact(annual)} a year`);
      steps.push(`GPR at market: ${exact(gprMkt)}, so loss-to-lease is ${pct(ltlPct, 1)} of it`);
      if (above.length) steps.push(`The ${above[0].plural} lease above market (gain-to-lease), which offsets the rest; those rents may fall at renewal`);
      steps.push(`Value of closing the gap: ${exact(annual)} ÷ [[${pct(cap, 2)}]] = ${money(value)}, if every lease reset to market with no added cost`);
      const rows = mix.map((m) => [m.name, String(m.units), `[[${dollars(m.inPlace)}]]`, `[[${dollars(m.market)}]]`, `${m.market >= m.inPlace ? '' : '−'}${dollars(Math.abs(m.units * (m.market - m.inPlace)))}`]);
      rows.push(['Total', String(mix.reduce((s, m) => s + m.units, 0)), '', '', dollars(monthly)]);

      return {
        q: `Rent roll, in-place vs market rent a month: ${desc}. What's the annual loss-to-lease, and what's closing it worth at ${an(pct(cap, 2))} [[${pct(cap, 2)}]] cap rate?`,
        a: `${money(annual)} a year, ${pct(ltlPct, 1)} of GPR at market. Closing it would be worth about ${money(value)} at ${an(pct(cap, 2))} ${pct(cap, 2)} cap, if tenants renew at market or the units re-lease there.`,
        why: "Loss-to-lease is the rent you give up because in-place leases sit below today's market. Underwriting starts GPR at market rents and deducts loss-to-lease to reach what tenants actually pay. With 12-month apartment leases, much of it can be captured within a year as leases renew or turn over, which is why buyers pay for it. But some tenants leave rather than take the full increase, and a large gap can also mean the market rents are optimistic.",
        formula: 'Loss-to-lease = units × (market rent − in-place rent), summed over unit types\nLoss-to-lease % = annual loss-to-lease ÷ GPR at market\nValue of closing it = annual loss-to-lease ÷ cap rate',
        steps,
        visual: { kind: 'table', headers: ['Type', 'Units', 'In place', 'Market', 'Gap a month'], rows },
        values: { annual, ltlPct, value, gprMkt, cap, mix }
      };
    },
    // Second way: GPR at market less the in-place rent roll must equal the loss-to-lease, and the value must re-cap to it.
    check(p) {
      const v = p.values;
      const inPlace = v.mix.reduce((s, m) => s + m.units * m.inPlace * 12, 0);
      return near(v.gprMkt - inPlace, v.annual, 1e-9) && near(v.value * v.cap, v.annual, 1e-9) && v.annual > 0;
    }
  });

  // ---------------------------------------------------------------- WALT
  Drills.add({
    id: 'drill-re-walt',
    track: 're',
    module: 're-leases',
    topic: 'WALT',
    level: 2,
    ranges: { waltRent: [0.5, 10.5], waltArea: [0.5, 10.5] },
    make(r) {
      const n = r.int(3, 4);
      const anchor = r.int(0, n - 1);
      const tenants = [];
      for (let i = 0; i < n; i++) {
        const sf = i === anchor ? r.step(25000, 80000, 500) : r.step(2500, 20000, 500);
        const rate = i === anchor ? r.step(18, 32, 0.5) : r.step(28, 60, 0.5);
        tenants.push({ name: 'ABCD'[i], sf, rate, rent: sf * rate, yrs: r.step(0.5, 10, 0.25) });
      }
      const totRent = tenants.reduce((s, t) => s + t.rent, 0);
      const totSF = tenants.reduce((s, t) => s + t.sf, 0);
      const waltRent = tenants.reduce((s, t) => s + t.rent * t.yrs, 0) / totRent;
      const waltArea = tenants.reduce((s, t) => s + t.sf * t.yrs, 0) / totSF;
      const basis = r.pick(['rent', 'rent', 'area', 'both']);
      const soon = tenants.filter((t) => t.yrs <= 2);
      const soonShare = soon.reduce((s, t) => s + t.rent, 0) / totRent;

      const yr = (x) => num(x, x % 1 ? 2 : 1).replace(/(\.\d)0$/, '$1');
      const roll = tenants.map((t) => `${t.name} [[${num(t.sf)}]], [[${dollars(t.rate, 2)}]], [[${yr(t.yrs)}]]`).join('; ');
      const ask = basis === 'rent' ? 'What is the WALT, weighted by rent?' : basis === 'area' ? 'What is the WALT, weighted by area?' : 'What is the WALT by rent and by area?';
      const steps = basis === 'area' ? [] : [`Annual rents: ${tenants.map((t) => `${t.name} [[${num(t.sf)}]] × [[${dollars(t.rate, 2)}]] = ${money(t.rent)}`).join('; ')}. Total ${money(totRent)}`];
      if (basis !== 'area') {
        steps.push(`Rent shares: ${tenants.map((t) => `${t.name} ${pct(t.rent / totRent, 1)}`).join(', ')}`);
        steps.push(`WALT by rent: ${tenants.map((t) => `${pct(t.rent / totRent, 1)} × [[${yr(t.yrs)}]]`).join(' + ')} = ${num(waltRent, 2)} years`);
      }
      if (basis !== 'rent') {
        steps.push(`Area shares of ${num(totSF)} SF: ${tenants.map((t) => `${t.name} ${pct(t.sf / totSF, 1)}`).join(', ')}`);
        steps.push(`WALT by area: ${tenants.map((t) => `${pct(t.sf / totSF, 1)} × [[${yr(t.yrs)}]]`).join(' + ')} = ${num(waltArea, 2)} years`);
      }
      const diff = waltRent < waltArea
        ? 'Weighting by rent shortens it: the tenants paying more per SF have the shorter leases'
        : 'Weighting by rent lengthens it: the tenants paying more per SF have the longer leases';
      if (basis === 'both') steps.push(diff);
      steps.push(soon.length
        ? `Rollover: ${pct(soonShare, 0)} of the rent (${soon.map((t) => t.name).join(' and ')}) expires within two years, a near-term risk the average can hide`
        : 'Rollover: nothing expires within two years, so no near-term expiry hides behind the average');

      const main = basis === 'area' ? waltArea : waltRent;
      return {
        q: `Rent roll (SF, rent per SF a year, years left): ${roll}. ${ask}`,
        a: basis === 'both'
          ? `${num(waltRent, 2)} years by rent and ${num(waltArea, 2)} years by area. ${diff}.`
          : `${num(main, 2)} years, weighted by ${basis}.`,
        why: "WALT (weighted average lease term) is the average time left on the leases, weighted by how much each lease matters. Weighting by rent, the basis most often quoted in valuation and lending, measures how long the income is locked in; weighting by area measures how long the space is committed. Say which one you're quoting. A long WALT can still hide a big expiry next year, so read it next to the rollover schedule.",
        formula: 'WALT by rent = Σ (annual rent × years left) ÷ total annual rent\nWALT by area = Σ (SF × years left) ÷ total SF',
        steps,
        visual: { kind: 'bars', unit: 'years', dp: 2, items: tenants.map((t) => ({ label: `${t.name} (${pct(basis === 'area' ? t.sf / totSF : t.rent / totRent, 0)} of ${basis === 'area' ? 'SF' : 'rent'})`, value: t.yrs }))
          .concat([{ label: `WALT by ${basis === 'area' ? 'area' : 'rent'}`, value: round(main, 2), highlight: true }]) },
        values: { waltRent, waltArea, tenants }
      };
    },
    // Second way: build the rollover schedule and add up, year by year, the share of rent (or area) still under lease.
    check(p) {
      const v = p.values;
      const walt = (w) => {
        const total = v.tenants.reduce((s, t) => s + w(t), 0);
        const sorted = v.tenants.slice().sort((a, b) => a.yrs - b.yrs);
        let left = total, prev = 0, area = 0;
        for (const t of sorted) { area += (t.yrs - prev) * left / total; left -= w(t); prev = t.yrs; }
        return area;
      };
      return near(walt((t) => t.rent), v.waltRent, 1e-9) && near(walt((t) => t.sf), v.waltArea, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Yield on cost and development spread
  Drills.add({
    id: 'drill-re-yoc',
    track: 're',
    module: 're-dev',
    topic: 'Yield on cost and development spread',
    level: 2,
    ranges: { yoc: [0.045, 0.09], spread: [0.003, 0.025], margin: [0.05, 0.6], profit: [5e5, 1e8] },
    make(r) {
      const units = r.step(120, 400, 10);
      const cap = r.step(0.045, 0.06, 0.0025);
      const mode = r.pick(['metrics', 'metrics', 'max']);
      const why = "Yield on cost is the cap rate you're effectively building at: stabilized NOI over everything you spend. Compare it with the cap rate the finished asset would sell at. The gap, the development spread, is your cushion for construction, lease-up and market risk, and it turns directly into profit: margin on cost = yield on cost ÷ exit cap − 1. Because the spread is small next to the cap rate, a modest rise in cap rates or a cost overrun can erase much of the profit.";
      const formula = 'Yield on cost = stabilized NOI ÷ total project cost\nDevelopment spread = yield on cost − market cap rate\nValue = stabilized NOI ÷ market cap rate; profit = value − cost\nMargin on cost = yield on cost ÷ cap rate − 1';
      const capS = `[[${pct(cap, 2)}]]`;

      if (mode === 'metrics') {
        const total0 = units * r.step(250, 450, 5) * 1000;
        const m = (x) => Math.round(x / 1e5) * 1e5;
        const land = m(total0 * r.step(0.1, 0.2, 0.01));
        const soft = m(total0 * r.step(0.12, 0.18, 0.01));
        const fin = m(total0 * r.step(0.04, 0.08, 0.01));
        const hard = m(total0 - land - soft - fin);
        const cost = land + hard + soft + fin;
        const noi = Math.round(cost * (cap + r.step(0.005, 0.02, 0.0025)) / 1e4) * 1e4;
        const yoc = noi / cost, spread = yoc - cap, value = noi / cap, profit = value - cost, margin = profit / cost;
        const cap2 = cap + 0.005, value2 = noi / cap2;
        const b = [land, hard, soft, fin].map((x) => `[[${money(x, 1)}]]`);
        const noiS = `[[${money(noi, 2)}]]`;
        return {
          q: `A [[${units}]]-unit development budgets land ${b[0]}, hard costs ${b[1]}, soft costs ${b[2]} and financing ${b[3]}. Stabilized NOI is ${noiS}; similar assets trade at ${an(pct(cap, 2))} ${capS} cap. Yield on cost, spread, value and profit?`,
          a: `Yield on cost ${pct(yoc, 2)}, ${an(bps(spread))} ${bps(spread)} spread over the ${pct(cap, 2)} cap rate. Stabilized value of ${money(value)} leaves ${money(profit)} of profit, ${pct(margin, 1)} on cost.`,
          why, formula,
          steps: [
            `Total cost: ${b.join(' + ')} = ${money(cost, 1)}, or ${money(cost / units)} a unit`,
            `Yield on cost: ${noiS} ÷ ${money(cost, 1)} = ${pct(yoc, 2)}`,
            `Development spread: ${pct(yoc, 2)} − ${capS} = ${bps(spread)}`,
            `Stabilized value: ${noiS} ÷ ${capS} = ${money(value)}`,
            `Profit: ${money(value)} − ${money(cost, 1)} = ${money(profit)}, ${pct(margin, 1)} on cost (${pct(yoc, 2)} ÷ ${pct(cap, 2)} − 1)`,
            `Stress: at ${an(pct(cap2, 2))} ${pct(cap2, 2)} exit cap, value falls to ${money(value2)} and profit to ${money(tidy(Math.round(value2 - cost)))}`
          ],
          visual: { kind: 'waterfall', unit: '$M', dp: 1, start: { label: 'Land', value: toM(land) }, steps: [
            { label: 'Hard costs', delta: round(hard / 1e6, 1) },
            { label: 'Soft costs', delta: round(soft / 1e6, 1) },
            { label: 'Financing', delta: round(fin / 1e6, 1) },
            { label: 'Total cost', subtotal: true },
            { label: 'Development profit', delta: round(profit / 1e6, 1) }
          ], end: { label: 'Stabilized value', value: round(round(cost / 1e6, 1) + round(profit / 1e6, 1), 1) } },
          values: { mode: 1, yoc, spread, value, cost, profit, margin, cap, noi }
        };
      }

      const noi = Math.round(units * r.step(14000, 26000, 500) / 1e4) * 1e4;
      const spreadReq = r.pick([0.01, 0.0125, 0.015, 0.0175, 0.02]);
      const yoc = cap + spreadReq;
      const cost = noi / yoc;
      const value = noi / cap, profit = value - cost, margin = profit / cost;
      const noiS = `[[${money(noi, 2)}]]`, sprS = `[[${bps(spreadReq)}]]`;
      return {
        q: `A planned [[${units}]]-unit project should stabilize at ${noiS} of NOI, and similar assets trade at ${an(pct(cap, 2))} ${capS} cap. You need ${an(bps(spreadReq))} ${sprS} development spread. What's the most you can spend all-in, and what profit does that leave?`,
        a: `About ${money(cost)} all-in (${money(cost / units)} a unit), for ${an(pct(yoc, 2))} ${pct(yoc, 2)} yield on cost. At the ${pct(cap, 2)} cap the project is worth ${money(value)}, ${an(money(profit))} ${money(profit)} profit, ${pct(margin, 1)} on cost.`,
        why, formula,
        steps: [
          `Required yield on cost: ${capS} + ${sprS} = ${pct(yoc, 2)}`,
          `Max all-in cost: ${noiS} ÷ ${pct(yoc, 2)} = ${money(cost)}, or ${money(cost / units)} a unit`,
          `Stabilized value: ${noiS} ÷ ${capS} = ${money(value)}`,
          `Profit: ${money(value)} − ${money(cost)} = ${money(profit)}, ${pct(margin, 1)} on cost (${bps(spreadReq)} ÷ ${pct(cap, 2)})`
        ],
        visual: { kind: 'bars', unit: '$M', dp: 1, items: [
          { label: 'Max all-in cost', value: round(cost / 1e6, 1), highlight: true },
          { label: 'Stabilized value', value: round(value / 1e6, 1) },
          { label: 'Profit', value: round(profit / 1e6, 1) }
        ] },
        values: { mode: 2, yoc, spread: spreadReq, value, cost, profit, margin, cap, noi }
      };
    },
    // Second way: margin on cost must equal yield on cost ÷ cap rate − 1, and value and cost must re-cap to the same NOI.
    check(p) {
      const v = p.values;
      return near(v.margin, v.yoc / v.cap - 1, 1e-9) && near(v.value * v.cap, v.cost * v.yoc, 1e-9) && near(v.yoc - v.cap, v.spread, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Residual land value
  Drills.add({
    id: 'drill-re-residual-land',
    track: 're',
    module: 're-dev',
    topic: 'Residual land value',
    level: 3,
    ranges: { land: [5e5, 8e7], landShare: [0.05, 0.35] },
    make(r) {
      const units = r.step(150, 400, 10);
      const noi = Math.round(units * r.step(14000, 26000, 500) / 1e4) * 1e4;
      const cap = r.step(0.045, 0.06, 0.0025);
      const value = noi / cap;
      const mode = r.pick(['margin', 'yoc']);
      const margin = r.pick([0.15, 0.175, 0.2, 0.2, 0.25]);
      const yocT = round(cap + r.pick([0.0125, 0.015, 0.0175, 0.02]), 4);
      const maxTotal = mode === 'margin' ? value / (1 + margin) : noi / yocT;
      // Back into hard costs per unit that leave land at a realistic 10–25% of total cost.
      const softPct = r.pick([0.15, 0.2, 0.25]);
      const finPct = r.step(0.06, 0.1, 0.01);
      const hardPU = Math.round(maxTotal * (1 - r.step(0.1, 0.25, 0.01)) / (1 + softPct + finPct) / units / 5000) * 5000;
      const hard = hardPU * units;
      const soft = hard * softPct;
      const fin = Math.round(hard * finPct / 1e5) * 1e5;
      const nonLand = hard + soft + fin;
      const land = maxTotal - nonLand;
      const profit = value - maxTotal;

      const noiS = `[[${money(noi, 2)}]]`, capS = `[[${pct(cap, 2)}]]`, hardS = `[[${exact(hard)}]]`;
      const softS = `[[${pct(softPct, 0)}]]`, finS = `[[${money(fin, 1)}]]`;
      const need = mode === 'margin'
        ? `You need a [[${pct(margin, 1)}]] profit on total cost.`
        : `You need ${an(pct(yocT, 2))} [[${pct(yocT, 2)}]] yield on cost.`;
      const steps = [`Stabilized value: ${noiS} ÷ ${capS} = ${money(value)}`];
      if (mode === 'margin') steps.push(`Max total cost, land included: ${money(value)} ÷ (1 + [[${pct(margin, 1)}]]) = ${money(maxTotal)}, since the profit is measured on all of it`);
      else steps.push(`Max total cost, land included: ${noiS} ÷ [[${pct(yocT, 2)}]] = ${money(maxTotal)}`);
      steps.push(`Non-land costs: ${hardS} + ${softS} × ${hardS} + ${finS} = ${money(nonLand)}`);
      steps.push(`Residual land value: ${money(maxTotal)} − ${money(nonLand)} = ${money(land)}, or ${money(land / units)} a unit`);
      steps.push(`Check: cost ${money(maxTotal)} against value ${money(value)} leaves ${money(profit)}, ${pct(profit / maxTotal, 1)} on cost, ${mode === 'margin' ? 'the required margin' : `and ${noiS} ÷ ${money(maxTotal)} = ${pct(noi / maxTotal, 2)} yield on cost`}`);

      return {
        q: `A [[${units}]]-unit project will stabilize at ${noiS} of NOI and sell at ${an(pct(cap, 2))} ${capS} cap. Hard costs ${hardS}, soft costs ${softS} of hard, financing ${finS}. ${need} What can you pay for the land?`,
        a: `About ${money(land)}, or ${money(land / units)} a unit: what's left of the ${money(maxTotal)} you can spend all-in after ${money(nonLand)} of hard, soft and financing costs.`,
        why: "Residual land value works backward from what the finished project is worth. Start with stabilized value, set aside the profit the risk requires, then subtract every non-land cost; what's left is the most you can pay for the land and still hit your return. Land absorbs every change in rents, cap rates and construction costs, so a small move in value or cost is a big move in the residual. That's why land prices swing hardest in a cycle.",
        formula: 'Max total cost = value ÷ (1 + required margin on cost), or NOI ÷ target yield on cost\nResidual land value = max total cost − hard − soft − financing costs',
        steps,
        visual: { kind: 'waterfall', unit: '$M', dp: 2, start: { label: 'Stabilized value', value: toM(value) }, steps: [
          { label: 'Developer profit', delta: -toM(profit) },
          { label: 'Max total cost', subtotal: true },
          { label: 'Hard costs', delta: -toM(hard) },
          { label: 'Soft costs', delta: -toM(soft) },
          { label: 'Financing', delta: -toM(fin) }
        ], end: { label: 'Residual land value', value: toM(land) } },
        values: { land, value, maxTotal, nonLand, landShare: land / maxTotal, noi, margin: mode === 'margin' ? margin : 0, yocT: mode === 'yoc' ? yocT : 0 }
      };
    },
    // Second way: add the land back to the other costs and confirm the project just meets the required margin or yield.
    check(p) {
      const v = p.values;
      const total = v.land + v.nonLand;
      return v.margin ? near((v.value - total) / total, v.margin, 1e-9) : near(v.noi / total, v.yocT, 1e-9);
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

  // ---------------------------------------------------------------- Total GP take
  Drills.add({
    id: 'drill-re-gp-take',
    track: 're',
    module: 're-deals',
    topic: 'Total GP take',
    level: 3,
    ranges: { take: [3e5, 1e8], share: [0.04, 0.6], lpIrr: [0.02, 0.3] },
    make(r) {
      const E = r.step(10, 80, 1) * 1e6;
      const gp = r.pick([0.05, 0.1, 0.1, 0.2]);
      const lp = 1 - gp;
      const n = r.int(3, 7);
      const h1 = r.pick([0.07, 0.08, 0.08, 0.09, 0.1]);
      const h2 = round(h1 + r.pick([0.04, 0.05, 0.06, 0.07]), 2);
      const p1 = r.pick([0.1, 0.2, 0.2]);
      const p2 = round(p1 + r.pick([0.1, 0.1, 0.15]), 2);
      // Tier 1 returns capital plus the first hurdle, pro rata. Tier 2 is the cash that lifts the LP to the second hurdle
      // when it gets only (1 − promote) of it; tier 3 is everything above.
      const H1 = E * Math.pow(1 + h1, n);
      const X2 = E * (Math.pow(1 + h2, n) - Math.pow(1 + h1, n)) / (1 - p1);
      let D = Math.round(E * Math.min(2.8, Math.pow(1 + r.step(0.06, 0.24, 0.01), n)) / 1e5) * 1e5;
      // Keep proceeds clear of a tier boundary, so no tier holds a sliver.
      if (Math.abs(D - H1) < 0.005 * H1) D += 5e5;
      if (Math.abs(D - H1 - X2) < 0.005 * D) D += 5e5;
      const T2 = D - H1 > 1000 ? Math.min(D - H1, X2) : 0;
      const T3 = D - H1 - X2 > 1000 ? D - H1 - X2 : 0;
      const T1 = D - T2 - T3;
      const promote = p1 * T2 + p2 * T3;
      const co = gp * (T1 + (1 - p1) * T2 + (1 - p2) * T3);
      const take = co + promote;
      const lpTotal = D - take;
      const gpCap = gp * E, profit = D - E, gpProfit = take - gpCap, share = gpProfit / profit;
      const lpIrr = Math.pow(lpTotal / (lp * E), 1 / n) - 1;

      const m = (x) => inM(x, 2);
      const eS = `[[${money(E, 1)}]]`, nS = `[[${n}]]`, gpS = `[[${pct(gp, 0)}]]`;
      const h1S = `[[${pct(h1, 0)}]]`, h2S = `[[${pct(h2, 0)}]]`, p1S = `[[${pct(p1, 0)}]]`, p2S = `[[${pct(p2, 0)}]]`;
      const f = (h) => `${num(1 + h, 2)}^${n}`;
      const steps = [];
      if (!T2) {
        steps.push(`Hurdle: ${eS} × ${f(h1)} = ${m(H1)}. The [[${m(D)}]] of proceeds doesn't clear it, so everything is pro rata`);
        steps.push(`GP: ${gpS} × [[${m(D)}]] = ${m(take)}, no promote`);
      } else {
        steps.push(`Tier 1, pro rata to ${an(pct(h1, 0))} ${h1S} IRR: ${eS} × ${f(h1)} = ${m(H1)}; the GP's ${gpS} is ${m(gp * T1)}`);
        const need = E * (Math.pow(1 + h2, n) - Math.pow(1 + h1, n));
        steps.push(`Tier 2 runs until the LP reaches ${pct(h2, 0)}. Investors need ${eS} × (${f(h2)} − ${f(h1)}) = ${m(need)} more but get only ${pct(1 - p1, 0)} of this tier, so it holds ${m(need)} ÷ ${pct(1 - p1, 0)} = ${m(X2)}` +
          (T3 ? '' : `; only ${m(T2)} is left`));
        steps.push(`GP in tier 2: ${p1S} promote ${m(p1 * T2)} + ${pct(gp, 0)} of the other ${pct(1 - p1, 0)} ${m(gp * (1 - p1) * T2)}`);
        if (T3) steps.push(`Tier 3, the remaining ${m(T3)}: ${p2S} promote ${m(p2 * T3)} + ${pct(gp, 0)} of the other ${pct(1 - p2, 0)} ${m(gp * (1 - p2) * T3)}`);
        steps.push(`GP take: ${m(co)} on its co-invest + ${m(promote)} of promote = ${m(take)}`);
      }
      steps.push(`GP profit: ${m(take)} − ${m(gpCap)} invested = ${m(gpProfit)}, ${pct(share, 1)} of the ${m(profit)} total profit on ${pct(gp, 0)} of the capital`);
      steps.push(`LP: ${m(lpTotal)}, ${mult(lpTotal / (lp * E), 2)} and ${pct(lpIrr, 1)} IRR. GP: ${mult(take / gpCap, 2)} on its co-invest`);

      const items = [{ label: 'GP capital back', value: toM(gpCap) }, { label: 'Profit on co-invest', value: toM(co - gpCap) }];
      if (promote > 0) items.push({ label: 'Promote', value: toM(promote), highlight: true });
      return {
        q: `LP [[${pct(lp, 0)}]] / GP ${gpS} invest ${eS}; one sale after ${nS} years returns [[${m(D)}]]. Waterfall: pro rata to ${an(pct(h1, 0))} ${h1S} IRR, then ${an(pct(p1, 0))} ${p1S} promote to ${an(pct(h2, 0))} ${h2S} LP IRR, then ${p2S} above. GP's total take and share of profit?`,
        a: T2
          ? `${m(take)}: ${m(co)} on its ${pct(gp, 0)} co-invest plus ${m(promote)} of promote. That's ${pct(share, 0)} of the ${m(profit)} profit for ${pct(gp, 0)} of the capital.`
          : `${m(take)}, just its ${pct(gp, 0)} pro rata share. The deal doesn't clear the ${pct(h1, 0)} hurdle, so there's no promote and the GP earns ${pct(gp, 0)} of the profit.`,
        why: "The GP is paid twice. As an investor, its co-invest earns exactly what the LP's capital earns, tier by tier. As sponsor, it takes the promote off the top of the cash above each hurdle. Promotes step up as returns rise, so in a strong deal the GP's share of profit can be several times its share of capital, and it falls back to its pro rata share if the deal never clears the first hurdle. That asymmetry is the point: it pays the sponsor for performance.",
        formula: 'GP take = GP % × investor distributions + promote\nPromote = tier-2 promote % × tier-2 cash + tier-3 promote % × tier-3 cash\nGP share of profit = (GP take − GP capital) ÷ (total proceeds − total equity)',
        steps,
        visual: { kind: 'stack', unit: '$M', dp: 2, items, caption: `The GP's ${m(take)}, from ${m(gpCap)} of co-invest` },
        values: { take, co, promote, gpProfit, share, lpIrr, lpTotal, D, E, gp, h1, h2, T2, T3, n }
      };
    },
    // Second way: GP take = its pro rata share of everything + (1 − GP %) × promote, and the LP's own IRR must sit in the tier the cash reached.
    check(p) {
      const v = p.values;
      const lpIrr = Drills.irr([-(1 - v.gp) * v.E].concat(new Array(v.n - 1).fill(0), [v.lpTotal]));
      const inTier = (!v.T2 || lpIrr >= v.h1 - 1e-5) && (v.T3 ? lpIrr >= v.h2 - 1e-5 : lpIrr <= v.h2 + 1e-5) && (v.T2 || lpIrr <= v.h1 + 1e-5);
      return near(v.gp * v.D + (1 - v.gp) * v.promote, v.take, 1e-9) && near(lpIrr, v.lpIrr, 1e-7) && inTier && near(v.take + v.lpTotal, v.D, 1e-9);
    }
  });
})();
