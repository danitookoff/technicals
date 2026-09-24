/* IB drills. Dollar amounts are in $M unless the question says otherwise. */
(function () {
  'use strict';
  const { fmt, near, round } = Drills;
  const { pct, mult, dollars, millions, num, signed, an } = fmt;

  // ---------------------------------------------------------------- EV bridge and back
  Drills.add({
    id: 'drill-ib-ev-bridge',
    track: 'ib',
    module: 'ib-ev',
    topic: 'EV bridge',
    level: 1,
    ranges: { ev: [300, 300000], price: [10, 200] },
    make(r) {
      const price = r.step(12, 180, 0.5);
      const shares = r.step(40, 600, 10);
      const eq = price * shares;
      const part = (lo, hi, to) => Math.max(to, Math.round(eq * r.step(lo, hi, 0.01) / to) * to);
      const debt = part(0.1, 0.8, 10);
      const cash = part(0.03, 0.25, 10);
      const pref = r.chance(0.4) ? part(0.02, 0.1, 5) : 0;
      const nci = r.chance(0.4) ? part(0.01, 0.06, 5) : 0;
      const inv = r.chance(0.3) ? part(0.01, 0.06, 5) : 0;
      const ev = eq + debt + pref + nci - cash - inv;

      const items = [['debt', debt, 1], ['preferred', pref, 1], ['NCI', nci, 1], ['cash', cash, -1], ['equity investments', inv, -1]]
        .filter((x) => x[1] > 0);
      const given = items.map(([name, v]) => `${name} [[${millions(v)}]]`).join(', ');
      const bridge = { kind: 'waterfall', unit: '$M', dp: 0, start: { label: 'Equity value', value: eq },
        steps: items.map(([name, v, s]) => ({ label: name[0].toUpperCase() + name.slice(1), delta: s * v })),
        end: { label: 'Enterprise value', value: ev } };
      const why = "Enterprise value is the value of the operations to every capital provider, so start from the shares and add each claim that ranks alongside or ahead of common equity (debt, preferred, noncontrolling interests). Subtract cash and non-operating investments, which a buyer gets along with the business. Going the other way, reverse every sign.";
      const formula = 'EV = equity value + debt + preferred + NCI − cash − equity investments\nEquity value = share price × diluted shares';

      if (r.chance(0.5)) {
        const steps = [`Equity value: [[${dollars(price, 2)}]] × [[${num(shares)}M]] shares = ${millions(eq)}`]
          .concat(items.map(([name, v, s]) => `${s > 0 ? 'Add' : 'Subtract'} ${name}: [[${millions(v)}]]`))
          .concat([`Enterprise value = ${millions(ev)}`]);
        return {
          q: `Share price [[${dollars(price, 2)}]], [[${num(shares)}M]] diluted shares, ${given}. What's enterprise value?`,
          a: `${millions(ev)}. Equity value of ${millions(eq)}, plus the other claims on the business, less cash${inv ? ' and non-operating investments' : ''}.`,
          why, formula, steps, visual: bridge,
          values: { ev, price, eq, shares, debt, pref, nci, cash, inv }
        };
      }

      const back = items.map(([name, v, s]) => `${s > 0 ? 'Subtract' : 'Add back'} ${name}: [[${millions(v)}]]`);
      return {
        q: `Enterprise value [[${millions(ev)}]], ${given}, [[${num(shares)}M]] diluted shares. What's the implied share price?`,
        a: `${dollars(price, 2)}. Equity value is ${millions(eq)} after reversing the bridge, divided by ${num(shares)}M shares.`,
        why, formula,
        steps: [`Start from EV: [[${millions(ev)}]]`].concat(back).concat([
          `Equity value = ${millions(eq)}`,
          `Share price: ${millions(eq)} ÷ [[${num(shares)}M]] = ${dollars(price, 2)}`
        ]),
        visual: bridge,
        values: { ev, price, eq, shares, debt, pref, nci, cash, inv }
      };
    },
    // Second way: walk the bridge backwards to the share price.
    check(p) {
      const v = p.values;
      return near((v.ev - v.debt - v.pref - v.nci + v.cash + v.inv) / v.shares, v.price, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Treasury stock method
  Drills.add({
    id: 'drill-ib-tsm',
    track: 'ib',
    module: 'ib-ev',
    topic: 'Treasury stock method',
    level: 2,
    ranges: { dilution: [1, 1.35] },
    make(r) {
      const basic = r.step(50, 400, 1);
      const price = r.step(15, 120, 1);
      const tranches = [];
      const n = r.int(2, 3);
      for (let i = 0; i < n; i++) {
        tranches.push({ count: r.step(1, 12, 0.5), strike: Math.max(1, Math.round(price * r.step(0.35, 1.3, 0.05))) });
      }
      if (!tranches.some((t) => t.strike < price)) tranches[0].strike = Math.round(price * 0.6);
      const rsu = r.chance(0.5) ? r.step(0.5, 6, 0.5) : 0;

      let net = 0;
      const steps = [];
      const rows = [];
      for (const t of tranches) {
        const label = `[[${num(t.count, 1)}M]] at [[$${t.strike}]]`;
        if (t.strike < price) {
          const proceeds = t.count * t.strike;
          const buyback = proceeds / price;
          const add = t.count - buyback;
          net += add;
          steps.push(`${label}: in the money. Exercise proceeds ${millions(proceeds, 1)} buy back ${num(buyback, 2)}M shares at [[$${price}]], net +${num(add, 2)}M`);
          rows.push([label, 'In the money', `+${num(add, 2)}M`]);
        } else {
          steps.push(`${label}: ${t.strike === price ? 'at' : 'out of'} the money, so excluded`);
          rows.push([label, t.strike === price ? 'At the money' : 'Out of the money', '0']);
        }
      }
      if (rsu) {
        steps.push(`RSUs: [[${num(rsu, 1)}M]] count in full, since there's no strike to pay`);
        rows.push([`[[${num(rsu, 1)}M]] RSUs`, 'No strike', `+${num(rsu, 1)}M`]);
      }
      const diluted = basic + net + rsu;
      steps.push(`Diluted shares: [[${num(basic)}M]] + ${num(net, 2)}M${rsu ? ` + ${num(rsu, 1)}M` : ''} = ${num(diluted, 2)}M`);

      const opts = tranches.map((t) => `[[${num(t.count, 1)}M]] at ${an('$' + t.strike)} [[$${t.strike}]] strike`).join(', ');
      return {
        q: `[[${num(basic)}M]] basic shares at [[$${price}]]. Options: ${opts}.${rsu ? ` RSUs: [[${num(rsu, 1)}M]].` : ''} How many diluted shares?`,
        a: `${num(diluted, 2)}M. In-the-money options add ${num(net, 2)}M net of the buyback${rsu ? `, RSUs add ${num(rsu, 1)}M` : ''}, and out-of-the-money options add nothing.`,
        why: 'The treasury stock method assumes in-the-money options are exercised and the company uses the exercise cash to buy back shares at today\'s price. So each option adds only the fraction of a share its intrinsic value represents: (price − strike) ÷ price. Out-of-the-money options wouldn\'t be exercised. RSUs have no strike, so they count in full.',
        formula: 'Net new shares = options × (price − strike) ÷ price\nDiluted shares = basic + net option shares + RSUs',
        steps,
        visual: { kind: 'table', headers: ['Instrument', 'Status', 'Adds'], rows },
        values: { diluted, net, basic, rsu, price, dilution: diluted / basic, tranches }
      };
    },
    // Second way: net new shares = total intrinsic value ÷ share price.
    check(p) {
      const v = p.values;
      const intrinsic = v.tranches.reduce((s, t) => s + (t.strike < v.price ? t.count * (v.price - t.strike) : 0), 0);
      return near(intrinsic / v.price, v.net, 1e-9) && near(v.basic + intrinsic / v.price + v.rsu, v.diluted, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Paper LBO
  Drills.add({
    id: 'drill-ib-paper-lbo',
    track: 'ib',
    module: 'ib-lbo',
    topic: 'Paper LBO',
    level: 2,
    ranges: { moic: [0.8, 6], irr: [-0.05, 0.6] },
    make(r) {
      const ebitda = r.step(50, 400, 10);
      const m0 = r.step(7, 12, 0.5);
      const lev = Math.min(r.step(4, 6.5, 0.5), m0 - 2.5);
      const years = r.pick([4, 5, 5, 5, 6, 7]);
      const g = r.step(0.03, 0.1, 0.01);
      const m1 = r.chance(0.6) ? m0 : m0 + r.pick([-1, -0.5, 0.5, 1]);
      const conv = r.step(0.25, 0.5, 0.05);

      const price = ebitda * m0, debt = ebitda * lev, equity = price - debt;
      let sumE = 0;
      for (let t = 1; t <= years; t++) sumE += ebitda * Math.pow(1 + g, t);
      const repaid = conv * sumE;
      const exitE = ebitda * Math.pow(1 + g, years);
      const exitEV = exitE * m1;
      const netDebt = debt - repaid;
      const exitEq = exitEV - netDebt;
      const moic = exitEq / equity;
      const irr = Math.pow(moic, 1 / years) - 1;

      const growth = (exitE - ebitda) * m0;
      const rerate = (m1 - m0) * exitE;
      const debtText = netDebt >= 0
        ? `leaving ${millions(netDebt, 1)} of debt`
        : `repaying all ${millions(debt)} with ${millions(-netDebt, 1)} of cash left over`;
      const exitText = m1 === m0 ? `[[${mult(m1, 1)}]]` : `[[${mult(m1, 1)}]] (entry was [[${mult(m0, 1)}]])`;

      return {
        q: `Buy a company with [[${millions(ebitda)}]] of EBITDA at [[${mult(m0, 1)}]], funded with [[${mult(lev, 1)}]] of debt. EBITDA grows [[${pct(g, 0)}]] a year and [[${pct(conv, 0)}]] of each year's EBITDA repays debt. Exit after [[${years}]] years at [[${mult(m1, 1)}]]. MOIC and IRR?`,
        a: `${mult(moic, 2)} and about ${pct(irr, 1)} IRR. Equity grows from ${millions(equity)} to ${millions(exitEq, 1)}.`,
        why: 'Equity at exit is exit enterprise value less whatever debt remains, so returns come from three places: EBITDA growth, any change in the multiple, and debt paid down from cash flow. Each dollar of value gained or debt repaid belongs to the equity, and the smaller the equity check, the more each dollar moves the multiple.',
        formula: 'Equity in = EBITDA × entry multiple − debt\nEquity out = exit EBITDA × exit multiple − remaining net debt\nMOIC = equity out ÷ equity in; IRR = MOIC^(1/years) − 1',
        steps: [
          `Entry: [[${millions(ebitda)}]] × [[${mult(m0, 1)}]] = ${millions(price)}. Debt [[${mult(lev, 1)}]] = ${millions(debt)}, so equity = ${millions(equity)}`,
          `Exit EBITDA: [[${millions(ebitda)}]] × (1 + [[${pct(g, 0)}]])^[[${years}]] = ${millions(exitE, 1)}`,
          `Exit EV: ${millions(exitE, 1)} × ${exitText} = ${millions(exitEV)}`,
          `Debt repaid: [[${pct(conv, 0)}]] × ${millions(sumE, 1)} of EBITDA over years 1–${years} = ${millions(repaid, 1)}, ${debtText}`,
          `Exit equity: ${millions(exitEV)} ${netDebt >= 0 ? '−' : '+'} ${millions(Math.abs(netDebt), 1)} = ${millions(exitEq, 1)}`,
          `MOIC: ${millions(exitEq, 1)} ÷ ${millions(equity)} = ${mult(moic, 2)}. IRR = ${num(moic, 2)}^(1/${years}) − 1 = ${pct(irr, 1)}`,
          'Rule of thumb over 5 years: 2x ≈ 15%, 2.5x ≈ 20%, 3x ≈ 25%'
        ],
        visual: { kind: 'waterfall', unit: '$M', dp: 0, start: { label: 'Equity at entry', value: round(equity, 0) }, steps: [
          { label: 'EBITDA growth', delta: round(growth, 0) },
          { label: m1 >= m0 ? 'Multiple expansion' : 'Multiple contraction', delta: round(rerate, 0) },
          { label: 'Debt paydown', delta: round(repaid, 0) }
        ], end: { label: 'Equity at exit', value: round(exitEq, 0) } },
        values: { moic, irr, equity, exitEq, years, growth, rerate, repaid }
      };
    },
    // Second way: solve the IRR numerically from the cash flows, and rebuild exit equity from the value bridge.
    check(p) {
      const v = p.values;
      const cfs = [-v.equity];
      for (let t = 1; t < v.years; t++) cfs.push(0);
      cfs.push(v.exitEq);
      return near(Drills.irr(cfs), v.irr, 1e-7) && near(v.equity + v.growth + v.rerate + v.repaid, v.exitEq, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Three-statement walk-through generator
  // Each item returns line-item changes as [label, value, isTotal]. Cash from the cash flow statement must
  // equal cash on the balance sheet, and the balance sheet must balance: check() tests both.
  const WALKS = [
    {
      q: (A) => `Depreciation goes up by [[${A.s}]]`,
      why: 'Depreciation is a non-cash expense. It lowers pre-tax income, so taxes fall; the cash flow statement adds the full amount back, leaving the tax saving as the only cash effect.',
      build: (a, t) => ({
        is: [['Depreciation', a], ['Pre-tax income', -a, 1], ['Taxes', -a * t], ['Net income', -a * (1 - t), 1]],
        cfs: [['Net income', -a * (1 - t)], ['Depreciation add-back', a]],
        assets: [['Cash', a * t], ['PP&E', -a]],
        le: [['Retained earnings', -a * (1 - t)]]
      })
    },
    {
      q: (A) => `The company spends [[${A.s}]] on capex`,
      why: "Buying equipment isn't an expense when it happens. It's capitalized: cash turns into PP&E, and the cost reaches the income statement later through depreciation.",
      build: (a) => ({ is: [], cfs: [['Capex (investing)', -a]], assets: [['Cash', -a], ['PP&E', a]], le: [] })
    },
    {
      q: (A) => `The company buys [[${A.s}]] of inventory with cash`,
      why: "Buying inventory swaps one asset for another. There's no expense until the inventory is sold, when its cost moves to COGS.",
      build: (a) => ({ is: [], cfs: [['Increase in inventory', -a]], assets: [['Cash', -a], ['Inventory', a]], le: [] })
    },
    {
      q: (A) => `The company buys [[${A.s}]] of inventory on credit`,
      why: 'No cash moves yet. Inventory and accounts payable both rise, so the balance sheet grows on both sides, and the two working-capital changes cancel on the cash flow statement.',
      build: (a) => ({ is: [], cfs: [['Increase in inventory', -a], ['Increase in AP', a]], assets: [['Inventory', a]], le: [['Accounts payable', a]] })
    },
    {
      q: (A) => `The company writes down [[${A.s}]] of inventory (assume it's tax-deductible)`,
      why: 'A write-down is a non-cash expense, like depreciation: it cuts pre-tax income and taxes, the add-back cancels the expense, and the tax saving is the cash effect. Deductibility is the usual interview assumption; for tax, losses often count only when the goods are disposed of.',
      build: (a, t) => ({
        is: [['Inventory write-down', a], ['Pre-tax income', -a, 1], ['Taxes', -a * t], ['Net income', -a * (1 - t), 1]],
        cfs: [['Net income', -a * (1 - t)], ['Write-down add-back', a]],
        assets: [['Cash', a * t], ['Inventory', -a]],
        le: [['Retained earnings', -a * (1 - t)]]
      })
    },
    {
      q: (A) => `The company collects [[${A.s}]] of accounts receivable`,
      why: "Collecting a receivable turns one asset into another. The revenue was recorded when the sale happened, so the income statement doesn't move.",
      build: (a) => ({ is: [], cfs: [['Decrease in AR', a]], assets: [['Cash', a], ['Accounts receivable', -a]], le: [] })
    },
    {
      q: (A) => `The company books [[${A.s}]] of revenue on credit, with no extra costs (taxes paid in cash)`,
      why: "Revenue lifts net income right away, but the customer hasn't paid. The cash flow statement subtracts the AR increase, so cash falls by the tax owed on profit that hasn't been collected yet.",
      build: (a, t) => ({
        is: [['Revenue', a], ['Pre-tax income', a, 1], ['Taxes', a * t], ['Net income', a * (1 - t), 1]],
        cfs: [['Net income', a * (1 - t)], ['Increase in AR', -a]],
        assets: [['Cash', -a * t], ['Accounts receivable', a]],
        le: [['Retained earnings', a * (1 - t)]]
      })
    },
    {
      q: (A) => `The company prepays [[${A.s}]] of next year's rent`,
      why: 'Paying in advance creates an asset, a prepaid expense. The expense reaches the income statement later, as the period it covers passes.',
      build: (a) => ({ is: [], cfs: [['Increase in prepaid expenses', -a]], assets: [['Cash', -a], ['Prepaid expenses', a]], le: [] })
    },
    {
      q: (A) => `A customer pays [[${A.s}]] up front for a service delivered next year`,
      why: "Cash received before the work is done is a liability: the company owes the customer the service. Revenue is recognized later, when it's delivered. (Assumes tax follows the book timing, the usual interview simplification.)",
      build: (a) => ({ is: [], cfs: [['Increase in deferred revenue', a]], assets: [['Cash', a]], le: [['Deferred revenue', a]] })
    },
    {
      q: (A) => `The company accrues a [[${A.s}]] bonus it hasn't paid yet (assume it's deductible now)`,
      why: "The expense is recorded when it's incurred, even though no cash has gone out. Net income falls; the cash flow statement adds back the rise in accrued liabilities, so cash rises by the tax saving.",
      build: (a, t) => ({
        is: [['Bonus expense', a], ['Pre-tax income', -a, 1], ['Taxes', -a * t], ['Net income', -a * (1 - t), 1]],
        cfs: [['Net income', -a * (1 - t)], ['Increase in accrued liabilities', a]],
        assets: [['Cash', a * t]],
        le: [['Accrued liabilities', a], ['Retained earnings', -a * (1 - t)]]
      })
    },
    {
      q: (A) => `The company raises [[${A.s}]] of debt`,
      why: "Borrowing isn't income. Cash and debt rise together, and the only cash flow line that moves is in financing.",
      build: (a) => ({ is: [], cfs: [['Debt raised (financing)', a]], assets: [['Cash', a]], le: [['Debt', a]] })
    },
    {
      q: (A) => `The company pays [[${A.s}]] of cash interest`,
      why: 'Interest is a tax-deductible cash expense, so net income and cash both fall by the after-tax amount.',
      build: (a, t) => ({
        is: [['Interest expense', a], ['Pre-tax income', -a, 1], ['Taxes', -a * t], ['Net income', -a * (1 - t), 1]],
        cfs: [['Net income', -a * (1 - t)]],
        assets: [['Cash', -a * (1 - t)]],
        le: [['Retained earnings', -a * (1 - t)]]
      })
    },
    {
      q: (A) => `The company accrues [[${A.s}]] of PIK interest`,
      why: 'PIK interest is an expense paid by adding to the loan balance instead of paying cash. It cuts net income and taxes, gets added back as non-cash, and increases the debt.',
      build: (a, t) => ({
        is: [['PIK interest', a], ['Pre-tax income', -a, 1], ['Taxes', -a * t], ['Net income', -a * (1 - t), 1]],
        cfs: [['Net income', -a * (1 - t)], ['PIK interest add-back', a]],
        assets: [['Cash', a * t]],
        le: [['Debt', a], ['Retained earnings', -a * (1 - t)]]
      })
    },
    {
      q: (A) => `The company pays a [[${A.s}]] dividend`,
      why: "Dividends distribute profit; they aren't an expense, so they skip the income statement. Cash and retained earnings both fall.",
      build: (a) => ({ is: [], cfs: [['Dividends paid (financing)', -a]], assets: [['Cash', -a]], le: [['Retained earnings', -a]] }),
      dividend: true
    },
    {
      q: (A) => `The company buys back [[${A.s}]] of its own stock`,
      why: 'A buyback returns cash to shareholders and reduces equity through treasury stock. Nothing touches the income statement.',
      build: (a) => ({ is: [], cfs: [['Share buyback (financing)', -a]], assets: [['Cash', -a]], le: [['Treasury stock', -a]] })
    },
    {
      q: (A) => `The company issues [[${A.s}]] of new shares`,
      why: 'Selling new shares raises cash and equity (common stock and APIC). It is financing, not income.',
      build: (a) => ({ is: [], cfs: [['Shares issued (financing)', a]], assets: [['Cash', a]], le: [['Common stock and APIC', a]] })
    },
    {
      q: (A) => `The company records a [[${A.s}]] goodwill impairment (not tax-deductible)`,
      why: "Goodwill impairment is a non-cash charge that usually isn't tax-deductible, so there's no tax saving: net income falls by the full amount, the add-back restores it, and cash doesn't change.",
      build: (a) => ({
        is: [['Goodwill impairment', a], ['Pre-tax income', -a, 1], ['Net income', -a, 1]],
        cfs: [['Net income', -a], ['Impairment add-back', a]],
        assets: [['Goodwill', -a]],
        le: [['Retained earnings', -a]]
      })
    },
    {
      sale: true,
      q: (A) => `The company sells equipment with a [[${A.bookS}]] book value for [[${A.proceedsS}]] in cash`,
      why: "The gain or loss hits the income statement, but the cash from the sale belongs in investing. So the cash flow statement reverses the gain or loss in operating cash flow and shows the full proceeds in investing. Cash moves by the proceeds adjusted for the tax on the gain or the tax saved on the loss.",
      build: (a, t, A) => {
        const g = A.proceeds - A.book;
        const label = g >= 0 ? 'Gain on sale' : 'Loss on sale';
        return {
          is: g >= 0
            ? [[label, g], ['Pre-tax income', g, 1], ['Taxes', g * t], ['Net income', g * (1 - t), 1]]
            : [[label, -g], ['Pre-tax income', g, 1], ['Taxes', g * t], ['Net income', g * (1 - t), 1]],
          cfs: [['Net income', g * (1 - t)], [g >= 0 ? 'Less gain on sale' : 'Add back loss on sale', -g], ['Sale proceeds (investing)', A.proceeds]],
          assets: [['Cash', A.proceeds - g * t], ['PP&E', -A.book]],
          le: [['Retained earnings', g * (1 - t)]]
        };
      }
    }
  ];

  const cents = (x) => (Math.abs(round(x, 2) - round(x, 0)) < 1e-9 ? 0 : 2);
  const usd = (x) => dollars(Math.abs(x), cents(x));

  Drills.add({
    id: 'drill-ib-walk',
    track: 'ib',
    module: 'ib-walk',
    topic: 'Three-statement walk-through',
    level: 1,
    ranges: { cash: [-150, 150], ni: [-150, 150] },
    make(r) {
      const item = r.pick(WALKS);
      const t = r.pick([0.2, 0.21, 0.25, 0.25, 0.3, 0.4]);
      const amount = r.pick([10, 20, 25, 40, 50, 100]);
      const A = { s: usd(amount) };
      if (item.sale) {
        A.book = r.pick([40, 50, 80, 100]);
        A.proceeds = A.book + r.pick([-20, -10, 10, 20, 30]);
        A.bookS = usd(A.book);
        A.proceedsS = usd(A.proceeds);
      }
      const fx = item.build(amount, t, A);
      const taxLabel = `Taxes at ${pct(t, 0)}`;
      const lines = (arr) => arr.map(([label, value, total]) => ({ label: label === 'Taxes' ? taxLabel : label, value: round(value, 2), total: !!total }));

      const ni = fx.is.length ? fx.is[fx.is.length - 1][1] : 0;
      const cash = fx.cfs.reduce((s, x) => s + x[1], 0);
      const cfs = lines(fx.cfs).concat([{ label: 'Net change in cash', value: round(cash, 2), total: true }]);
      const assetsTotal = fx.assets.reduce((s, x) => s + x[1], 0);
      const leTotal = fx.le.reduce((s, x) => s + x[1], 0);

      const move = (x, up, down) => (round(x, 2) === 0 ? null : `${round(x, 2) > 0 ? up : down} ${usd(x)}`);
      const niText = move(ni, 'Net income rises', 'Net income falls') || 'No income statement change';
      const cashText = move(cash, 'cash rises', 'cash falls') || "cash doesn't change";
      // Lowercase for mid-sentence use, but leave acronyms like PP&E alone.
      const lower = (label) => (/^[A-Z][a-z]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label);
      const side = (arr) => arr.map(([label, v]) => `${lower(label)} ${signed(v, cents(v))}`).join(', ');
      const totalText = round(assetsTotal, 2) === 0 ? "Total assets don't change." : `Both sides move ${signed(assetsTotal, cents(assetsTotal))}.`;
      const bsText = `Balance sheet: ${side(fx.assets)}${fx.le.length ? `; ${side(fx.le)} on the other side` : ''}. ${totalText}`;

      const IS = fx.is.map(([label, v]) => `${label === 'Taxes' ? taxLabel : label} ${signed(v, cents(v))}`);
      return {
        q: `${item.q(A)}. Tax rate [[${pct(t, 0)}]]. Walk me through the three statements.`,
        a: `${niText}; ${cashText}. ${bsText}`,
        why: item.why,
        formula: 'After-tax effect = pre-tax change × (1 − tax rate)\nChange in cash = net income + non-cash items − increases in working capital + investing + financing\nAssets = liabilities + equity',
        steps: [
          `Income statement: ${IS.length ? IS.join(', ') : 'no change'}`,
          `Cash flow statement: ${fx.cfs.map(([label, v]) => `${label} ${signed(v, cents(v))}`).join(', ')}; net change in cash ${signed(cash, cents(cash))}`,
          `Balance sheet: assets ${signed(assetsTotal, cents(assetsTotal))} (${side(fx.assets)}); liabilities and equity ${signed(leTotal, cents(leTotal))}${fx.le.length ? ` (${side(fx.le)})` : ''}`
        ],
        visual: { kind: 'threeStatement', unit: '$', is: lines(fx.is), cfs, bs: { assets: lines(fx.assets), le: lines(fx.le) } },
        values: { ni, cash, assetsTotal, leTotal, bsCash: (fx.assets.find((x) => x[0] === 'Cash') || [0, 0])[1], reChange: (fx.le.find((x) => x[0] === 'Retained earnings') || [0, 0])[1], dividend: item.dividend ? amount : 0 }
      };
    },
    // Second way: the balance sheet must balance, balance sheet cash must equal the cash flow statement,
    // and retained earnings must move by net income less dividends.
    check(p) {
      const v = p.values;
      return near(v.assetsTotal, v.leTotal, 1e-9) && near(v.bsCash, v.cash, 1e-9) && near(v.reChange, v.ni - v.dividend, 1e-9);
    }
  });
})();
