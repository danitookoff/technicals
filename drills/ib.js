/* IB drills. Dollar amounts are in $M unless the question says otherwise. */
(function () {
  'use strict';
  const { fmt, near, round } = Drills;
  const { pct, mult, dollars, millions, num, signed, an } = fmt;

  // Local helpers.
  // $M with only the decimals a figure needs, so every figure shows exactly: 1240 → "$1,240M", 219.4 → "$219.4M".
  const dpOf = (x) => (Math.abs(x - round(x, 0)) < 1e-7 ? 0 : Math.abs(x - round(x, 1)) < 1e-7 ? 1 : 2);
  const M = (x) => millions(x, dpOf(x));
  // Rounding that first clears float noise, so exact halves round up: 7.5% × 0.75 = 5.625% → 5.63%, not 5.62%.
  const rd = (x, dp) => round(round(x, 9), dp);
  // A result rounded to $0.1M, the precision the working shows; later steps continue from it.
  const r1 = (x) => rd(x, 1);
  // Capitalized article for the start of a sentence.
  const An = (t) => (an(t) === 'an' ? 'An' : 'A');
  // Rates the way they're quoted: 0.04 → "4.0%", 0.0425 → "4.25%".
  const rate = (x) => pct(x);
  // Plain decimals without trailing zeros: 1.2765, 0.75.
  const dec = (x, dp) => num(x, dp).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  // ---------------------------------------------------------------- Implied share price from a multiple
  Drills.add({
    id: 'drill-ib-share-price',
    track: 'ib',
    module: 'ib-comps',
    topic: 'Implied share price',
    level: 2,
    ranges: { price: [3, 500], multiple: [4, 30], equity: [50, 80000] },
    make(r) {
      const mode = r.pick(['median', 'median', 'pe', 'range']);
      const basis = r.pick(['LTM', 'NTM', 'NTM']);
      // Today's price sits 3–22% from the implied value, so the verdict is never a coin flip.
      const away = (x) => {
        let f = r.step(0.78, 1.22, 0.01);
        if (Math.abs(f - 1) < 0.03) f = f < 1 ? 0.95 : 1.05;
        return rd(x * f, 2);
      };
      const side = (up) => `${pct(Math.abs(up), 1)} ${up >= 0 ? 'upside' : 'downside'}`;
      const sgn = (up) => `${up < 0 ? '−' : '+'}${pct(Math.abs(up), 1)}`;
      const sh = (x) => `[[${num(x, 1)}M]]`;
      const $ = (x) => dollars(x, 2);

      if (mode === 'median') {
        const ebitda = r.step(60, 1500, 5);
        const mid = r.step(7, 12.5, 0.1);
        const b2 = rd(mid - r.step(0.3, 1.2, 0.1), 1);
        const b1 = rd(b2 - r.step(0.3, 1.5, 0.1), 1);
        const a1 = rd(mid + r.step(0.3, 1.2, 0.1), 1);
        const outlier = r.pick(['high', 'high', 'low', 'none', 'none']);
        const a2 = rd(a1 + (outlier === 'high' ? r.step(3, 7, 0.1) : r.step(0.3, 1.5, 0.1)), 1);
        const lo = outlier === 'low' ? rd(Math.max(3.5, b1 - r.step(2.5, 4, 0.1)), 1) : b1;
        const sorted = [lo, b2, mid, a1, a2];
        const peers = r.shuffle(sorted);
        const mean = sorted.reduce((s, x) => s + x, 0) / 5;
        const ev = r1(mid * ebitda);
        const debt = Math.round(ebitda * r.step(0.5, 3.5, 0.1) / 5) * 5;
        const cash = Math.max(5, Math.round(ebitda * r.step(0.1, 0.8, 0.05) / 5) * 5);
        const nd = debt - cash;
        const equity = r1(ev - nd);
        const shares = Math.max(5, rd(equity / r.step(18, 160, 1), 1));
        const price = equity / shares, shown = rd(price, 2);
        const cur = r.chance(0.6) ? away(shown) : 0;
        const up = cur ? shown / cur - 1 : 0;
        const list = peers.map((x) => `[[${mult(x, 1)}]]`);
        const steps = [
          `Median: in order, ${sorted.map((x) => mult(x, 1)).join(', ')}, so the middle one is ${mult(mid, 1)}` +
            (outlier === 'none' ? '' : `. The mean, ${mult(mean, 2)}, is pulled ${outlier === 'high' ? 'up' : 'down'} by the ${mult(outlier === 'high' ? a2 : lo, 1)} outlier; the median isn't`),
          `Implied EV: ${mult(mid, 1)} × [[${M(ebitda)}]] = ${M(ev)}`,
          `Equity value: ${M(ev)} − [[${M(debt)}]] of debt + [[${M(cash)}]] of cash = ${M(equity)}`,
          `Share price: ${M(equity)} ÷ ${sh(shares)} diluted shares = ${$(shown)}`
        ];
        if (cur) steps.push(`Against [[${$(cur)}]] today: ${$(shown)} ÷ [[${$(cur)}]] − 1 = ${sgn(up)}, so ${side(up)}`);
        const netText = nd >= 0 ? `after ${M(nd)} of net debt` : `with ${M(-nd)} of net cash added`;
        return {
          q: `Five peers trade at ${list.slice(0, 4).join(', ')} and ${list[4]} ${basis} EBITDA. The target has [[${M(ebitda)}]] of ${basis} EBITDA, [[${M(debt)}]] of debt, [[${M(cash)}]] of cash and ${sh(shares)} diluted shares${cur ? `, and trades at [[${$(cur)}]]` : ''}. What share price does the peer median imply?`,
          a: `${$(shown)} a share. The ${mult(mid, 1)} median on ${M(ebitda)} of ${basis} EBITDA gives ${M(ev)} of EV, or ${M(equity)} of equity value ${netText}.${cur ? ` That's ${side(up)} from ${$(cur)}.` : ''}`,
          why: `Comps value the target the way the market values similar businesses. EV/EBITDA is a whole-company multiple, so applied to the target's EBITDA (${basis} to ${basis}, matching the peers) it gives enterprise value, not equity value. Bridge to equity by subtracting debt and adding cash, then divide by diluted shares. The median shrugs off outliers, like a peer with a one-off or a takeover bid in its price, better than the mean. In practice you show a range, since no peer is a perfect match.`,
          formula: 'Implied EV = peer multiple × target EBITDA\nEquity value = EV − debt + cash\nShare price = equity value ÷ diluted shares',
          steps,
          visual: { kind: 'waterfall', unit: '$M', dp: Math.max(dpOf(ev), dpOf(equity)), start: { label: 'Implied EV', value: ev },
            steps: [{ label: 'Debt', delta: -debt }, { label: 'Cash', delta: cash }], end: { label: 'Equity value', value: equity },
            caption: `÷ ${num(shares, 1)}M diluted shares = ${$(shown)} a share` },
          values: { mode: 1, price, shown, equity, ev, multiple: mid, peers: sorted, ebitda, debt, cash, shares, cur, up }
        };
      }

      if (mode === 'pe') {
        const ni = r.step(40, 900, 1);
        const pe = r.step(10, 28, 0.1);
        const equity = r1(pe * ni);
        const shares = Math.max(5, rd(equity / r.step(18, 160, 1), 1));
        const price = equity / shares, shown = rd(price, 2);
        const cur = away(shown);
        const up = shown / cur - 1;
        const curPe = cur * shares / ni;
        return {
          q: `Peers trade at a median [[${mult(pe, 1)}]] ${basis} P/E. The target's ${basis} net income is [[${M(ni)}]], it has ${sh(shares)} diluted shares and its stock trades at [[${$(cur)}]]. What share price does the median imply, and how far is that from today's?`,
          a: `${$(shown)} a share, ${side(up)} from ${$(cur)}. The ${mult(pe, 1)} median P/E on ${M(ni)} of net income gives ${M(equity)} of equity value directly, spread over ${num(shares, 1)}M diluted shares.`,
          why: "P/E prices the equity directly: net income is what's left after lenders are paid, so the peer P/E times the target's net income is equity value, with no bridge through net debt. Divide by diluted shares, or multiply the P/E by EPS, for the share price. The catch is that P/E mixes the business with its capital structure: more debt means more interest and a different P/E for the same operations. That's why EV/EBITDA is usually the main multiple and P/E a cross-check.",
          formula: 'Equity value = peer P/E × target net income\nShare price = equity value ÷ diluted shares = P/E × EPS\nUpside = implied price ÷ current price − 1',
          steps: [
            `Implied equity value: [[${mult(pe, 1)}]] × [[${M(ni)}]] = ${M(equity)}. Net income is already after interest, so there's no bridge`,
            `Share price: ${M(equity)} ÷ ${sh(shares)} = ${$(shown)}`,
            `Against [[${$(cur)}]] today: ${$(shown)} ÷ [[${$(cur)}]] − 1 = ${sgn(up)}`,
            `Today's P/E: [[${$(cur)}]] × ${sh(shares)} ÷ [[${M(ni)}]] = ${mult(curPe, 1)}, ${curPe < pe ? 'below' : 'above'} the [[${mult(pe, 1)}]] peer median`
          ],
          visual: { kind: 'bars', unit: '$', dp: 2, caption: 'Share price', items: [
            { label: 'Today', value: cur },
            { label: `At ${mult(pe, 1)} P/E`, value: shown, highlight: true }
          ] },
          values: { mode: 2, price, shown, equity, multiple: pe, ni, shares, cur, up, curPe }
        };
      }

      const ebitda = r.step(60, 1500, 5);
      const lo = r.step(6, 11, 0.5);
      const hi = lo + r.pick([1, 1.5, 2, 2, 2.5, 3]);
      const debt = Math.round(ebitda * r.step(0.5, 3.5, 0.1) / 5) * 5;
      const cash = Math.max(5, Math.round(ebitda * r.step(0.1, 0.8, 0.05) / 5) * 5);
      const nd = debt - cash;
      const evLo = r1(lo * ebitda), evHi = r1(hi * ebitda);
      const eqLo = r1(evLo - nd), eqHi = r1(evHi - nd);
      const shares = Math.max(5, rd((eqLo + eqHi) / 2 / r.step(18, 160, 1), 1));
      const pLo = eqLo / shares, pHi = eqHi / shares;
      const sLo = rd(pLo, 2), sHi = rd(pHi, 2);
      const pos = r.pick(['below', 'within', 'within', 'above']);
      const cur = pos === 'below' ? rd(sLo * r.step(0.82, 0.96, 0.01), 2)
        : pos === 'above' ? rd(sHi * r.step(1.04, 1.18, 0.01), 2)
          : rd(sLo + (sHi - sLo) * r.step(0.1, 0.9, 0.05), 2);
      const at = (cur - sLo) / (sHi - sLo);
      const verdict = pos === 'below' ? 'below the range, so on these comps it looks cheap'
        : pos === 'above' ? 'above the range: the market already prices it richer than its peers'
          : `inside the range, ${at < 1 / 3 ? 'near the low end' : at > 2 / 3 ? 'near the high end' : 'around the middle'}`;
      const Fr = (x) => millions(x, Math.max(...[evLo, evHi, eqLo, eqHi].map(dpOf)));
      const netStep = nd >= 0 ? `Net debt: [[${M(debt)}]] − [[${M(cash)}]] = ${Fr(nd)}` : `Net cash: [[${M(cash)}]] − [[${M(debt)}]] = ${Fr(-nd)}`;
      const eqStep = nd >= 0
        ? `Equity value: ${Fr(evLo)} − ${Fr(nd)} = ${Fr(eqLo)}; ${Fr(evHi)} − ${Fr(nd)} = ${Fr(eqHi)}`
        : `Equity value: ${Fr(evLo)} + ${Fr(-nd)} = ${Fr(eqLo)}; ${Fr(evHi)} + ${Fr(-nd)} = ${Fr(eqHi)}`;
      const spread = nd >= 0
        ? `EV rises ${pct(evHi / evLo - 1, 1)} from the low end to the high end, but the share price rises ${pct(sHi / sLo - 1, 1)}: net debt is the same at both ends, so the equity absorbs the whole swing`
        : `EV rises ${pct(evHi / evLo - 1, 1)} from the low end to the high end and the share price ${pct(sHi / sLo - 1, 1)}: the net cash is the same at both ends, which cushions the equity`;
      return {
        q: `Peers trade at [[${mult(lo, 1)}]] to [[${mult(hi, 1)}]] ${basis} EBITDA (25th to 75th percentile). The target: ${basis} EBITDA [[${M(ebitda)}]], debt [[${M(debt)}]], cash [[${M(cash)}]], ${sh(shares)} diluted shares, share price [[${$(cur)}]]. What price range do the comps imply?`,
        a: `${$(sLo)} to ${$(sHi)} a share. At ${$(cur)} the stock trades ${verdict}.`,
        why: "Comps give a range, not a point: the 25th to 75th percentile of peer multiples brackets how the market prices businesses like this one. Apply both ends to the target's EBITDA, bridge each to equity value and divide by diluted shares. Net debt is the same at both ends, so for a levered company the equity range is wider in percentage terms than the EV range, and the more debt, the wider it gets. On a football field this bar sits beside precedents, the DCF and the LBO.",
        formula: 'EV = multiple × EBITDA, at each end of the range\nEquity value = EV − net debt\nShare price = equity value ÷ diluted shares',
        steps: [
          `EV: [[${mult(lo, 1)}]] × [[${M(ebitda)}]] = ${Fr(evLo)}; [[${mult(hi, 1)}]] × [[${M(ebitda)}]] = ${Fr(evHi)}`,
          netStep,
          eqStep,
          `Per share: ${Fr(eqLo)} ÷ ${sh(shares)} = ${$(sLo)}; ${Fr(eqHi)} ÷ ${sh(shares)} = ${$(sHi)}`,
          spread,
          `At [[${$(cur)}]], the stock trades ${verdict}`
        ],
        visual: { kind: 'bars', unit: '$', dp: 2, caption: 'Implied share price at each end of the peer range', items: [
          { label: `Low end (${mult(lo, 1)})`, value: sLo },
          { label: 'Today', value: cur, highlight: true },
          { label: `High end (${mult(hi, 1)})`, value: sHi }
        ] },
        values: { mode: 3, price: pLo, pHi, sLo, sHi, equity: eqLo, eqHi, multiple: lo, hi, ebitda, nd, shares, cur, pos }
      };
    },
    // Second way: rebuild EV from the share price (price × shares + net debt) and divide by EBITDA to get back the
    // multiple; for P/E, rebuild the multiple from price × shares ÷ net income.
    check(p) {
      const v = p.values;
      if (v.mode === 1) {
        const median = v.peers.slice().sort((a, b) => a - b)[2];
        const upOk = !v.cur || near(v.up, rd(v.price, 2) / v.cur - 1, 1e-9);
        return near(median, v.multiple, 1e-9) && near((v.price * v.shares + v.debt - v.cash) / v.ebitda, v.multiple, 1e-9) && upOk;
      }
      if (v.mode === 2) {
        return near(v.price * v.shares / v.ni, v.multiple, 1e-9) && near(v.curPe / v.multiple, v.cur / v.price, 1e-9) &&
          (v.up > 0) === (v.curPe < v.multiple);
      }
      const where = v.cur < v.sLo ? 'below' : v.cur > v.sHi ? 'above' : 'within';
      return near((v.price * v.shares + v.nd) / v.ebitda, v.multiple, 1e-9) && near((v.pHi * v.shares + v.nd) / v.ebitda, v.hi, 1e-9) && where === v.pos;
    }
  });

  // ---------------------------------------------------------------- LTM and calendarization
  Drills.add({
    id: 'drill-ib-ltm',
    track: 'ib',
    module: 'ib-comps',
    topic: 'LTM and calendarization',
    level: 2,
    ranges: { ebitda: [20, 5000] },
    make(r) {
      const mode = r.pick(['ltm', 'ltm', 'multiple', 'cal', 'cal']);
      const why = "Comps only work when every company is measured over the same 12 months. LTM rolls the last annual report forward to the latest quarter: take the full fiscal year, add this year's year-to-date and remove the same period of last year, which leaves the most recent 12 months. Calendarizing lines up a company whose fiscal year doesn't end in December with peers that do, by blending the two fiscal years that overlap the calendar year by the months each contributes. The blend assumes even months; with quarterly data, add the actual quarters, which handles seasonality.";

      if (mode === 'cal') {
        const fye = r.pick([3, 6, 9]);
        const Y = r.pick([2025, 2026, 2026, 2027]);
        const fy1 = r.step(80, 2400, 2);
        const fy2 = rd(fy1 * (1 + r.step(0.03, 0.15, 0.01)) / 2, 0) * 2;
        const w1 = fye / 12, w2 = 1 - w1;
        const c1 = r1(w1 * fy1), c2 = r1(w2 * fy2);
        const cy = r1(c1 + c2);
        const Fc = (x) => millions(x, Math.max(dpOf(c1), dpOf(c2), dpOf(cy)));
        const mon = MONTHS[fye - 1];
        const day = fye === 3 ? 31 : 30;
        const next = MONTHS[fye];
        const withEv = r.chance(0.5);
        const ev = withEv ? Math.round(cy * r.step(7, 13, 0.1) / 10) * 10 : 0;
        const steps = [
          `Calendar ${Y} runs January to December ${Y}: ${fye} months (January to ${mon}) fall in the fiscal year ending ${mon} ${Y}, the other ${12 - fye} (${next} to December) in the year ending ${mon} ${Y + 1}`,
          `Weights: ${fye}/12 = ${dec(w1, 2)} and ${12 - fye}/12 = ${dec(w2, 2)}`,
          `Calendar ${Y} EBITDA: ${dec(w1, 2)} × [[${M(fy1)}]] + ${dec(w2, 2)} × [[${M(fy2)}]] = ${Fc(c1)} + ${Fc(c2)} = ${Fc(cy)}`
        ];
        if (withEv) steps.push(`Calendar ${Y} multiple: [[${M(ev)}]] ÷ ${Fc(cy)} = ${mult(ev / cy, 1)}, comparable with peers' calendar ${Y} multiples`);
        steps.push(`The result sits between the two fiscal years, closer to the one that contributes more months. It assumes EBITDA is spread evenly; with quarterly data, add the actual quarters instead`);
        return {
          q: `A company's fiscal year ends [[${mon} ${day}]]. EBITDA is [[${M(fy1)}]] for the year ending ${mon} ${Y} and [[${M(fy2)}]] for the year ending ${mon} ${Y + 1}. Peers use calendar years. What's its calendar ${Y} EBITDA?${withEv ? ` At [[${M(ev)}]] of EV, what multiple is that?` : ''}`,
          a: `${Fc(cy)}: ${fye}/12 of the fiscal year ending ${mon} ${Y} plus ${12 - fye}/12 of the year ending ${mon} ${Y + 1}.${withEv ? ` That puts it at ${mult(ev / cy, 1)} calendar ${Y} EBITDA.` : ''}`,
          why,
          formula: 'Calendar-year figure = (months in the earlier fiscal year ÷ 12) × that year + (months in the later fiscal year ÷ 12) × that year\nLTM = last fiscal year + current year-to-date − prior year-to-date',
          steps,
          visual: { kind: 'table', headers: ['Fiscal year', 'EBITDA', 'Months in CY' + String(Y).slice(2), 'Counts'], rows: [
            [`Ends ${mon.slice(0, 3)} ${Y}`, `[[${M(fy1)}]]`, `${fye} of 12`, Fc(c1)],
            [`Ends ${mon.slice(0, 3)} ${Y + 1}`, `[[${M(fy2)}]]`, `${12 - fye} of 12`, Fc(c2)],
            [`Calendar ${Y}`, '', '12', Fc(cy)]
          ] },
          values: { mode: 3, ebitda: cy, fy1, fy2, fye, ev }
        };
      }

      // LTM: a fiscal year plus year-to-date figures. Usually a December year-end; sometimes June, March or September.
      const fye = r.pick([12, 12, 12, 6, 3, 9]);
      const n = r.pick([3, 6, 9]);
      const endMonth = MONTHS[(fye + n - 1) % 12];
      const R = r.step(300, 6000, 10);
      const m = r.step(0.12, 0.34, 0.005);
      const E = Math.round(R * m);
      const g = r.step(-0.04, 0.16, 0.01);
      const ytdR0 = Math.round(R * n / 12 * r.step(0.9, 1.1, 0.01));
      const ytdR1 = Math.round(ytdR0 * (1 + g));
      const ytdE0 = Math.round(ytdR0 * m * r.step(0.94, 1.06, 0.01));
      const ytdE1 = Math.round(ytdR1 * m * r.step(0.94, 1.08, 0.01));
      const ltmR = R + ytdR1 - ytdR0, ltmE = E + ytdE1 - ytdE0;
      const words = { 3: 'Three', 6: 'Six', 9: 'Nine' }[n];
      const fyText = fye === 12 ? 'Last fiscal year (to December)' : `Fiscal years end in ${MONTHS[fye - 1]}. Last fiscal year`;
      const stub = 12 - n;
      const tail = (lead, x, y, cur) => `${lead} last fiscal year's final ${stub} months ([[${M(x)}]] − [[${M(y)}]] = ${M(x - y)}) plus this year's first ${n} ([[${M(cur)}]])`;

      if (mode === 'multiple') {
        const ev = Math.round(ltmE * r.step(7, 13, 0.1) / 10) * 10;
        const fyM = ev / E, ltmM = ev / ltmE;
        return {
          q: `${fyText}: EBITDA [[${M(E)}]]. ${words} months to ${endMonth}: [[${M(ytdE1)}]] this year vs [[${M(ytdE0)}]] a year earlier. EV is [[${M(ev)}]]. What are LTM EBITDA and the LTM EV/EBITDA multiple, against the multiple on last fiscal year?`,
          a: `LTM EBITDA is ${M(ltmE)}, so EV/LTM EBITDA is ${mult(ltmM, 1)}, against ${mult(fyM, 1)} on last fiscal year's ${M(E)}. ${ltmE > E ? 'EBITDA has grown since year-end, so the stale figure overstates the multiple.' : ltmE < E ? 'EBITDA has fallen since year-end, so the stale figure understates the multiple.' : 'EBITDA is flat, so the two agree.'}`,
          why,
          formula: 'LTM = last fiscal year + current year-to-date − prior year-to-date\nLTM multiple = EV ÷ LTM EBITDA',
          steps: [
            `LTM EBITDA: [[${M(E)}]] + [[${M(ytdE1)}]] − [[${M(ytdE0)}]] = ${M(ltmE)}`,
            tail('The LTM window is', E, ytdE0, ytdE1),
            `LTM multiple: [[${M(ev)}]] ÷ ${M(ltmE)} = ${mult(ltmM, 1)}`,
            `On last fiscal year: [[${M(ev)}]] ÷ [[${M(E)}]] = ${mult(fyM, 1)}`
          ],
          visual: { kind: 'waterfall', unit: '$M', dp: 0, start: { label: 'Last fiscal year', value: E }, steps: [
            { label: `This year's ${n} months`, delta: ytdE1 },
            { label: `Last year's ${n} months`, delta: -ytdE0 }
          ], end: { label: 'LTM EBITDA', value: ltmE }, caption: `LTM to ${endMonth}` },
          values: { mode: 2, ebitda: ltmE, E, ytdE0, ytdE1, n, ev, ltmM, fyM, R: 0, ytdR0: 0, ytdR1: 0 }
        };
      }

      const mFY = E / R, mL = ltmE / ltmR;
      return {
        q: `${fyText}: revenue [[${M(R)}]], EBITDA [[${M(E)}]]. ${words} months to ${endMonth}: revenue [[${M(ytdR1)}]] this year vs [[${M(ytdR0)}]] a year earlier; EBITDA [[${M(ytdE1)}]] vs [[${M(ytdE0)}]]. What are LTM revenue and EBITDA?`,
        a: `LTM revenue ${M(ltmR)} and EBITDA ${M(ltmE)}, ${an(pct(mL, 1))} ${pct(mL, 1)} margin: last fiscal year, plus this year's ${n} months, less the same ${n} months of last year.`,
        why,
        formula: 'LTM = last fiscal year + current year-to-date − prior year-to-date\nLTM margin = LTM EBITDA ÷ LTM revenue',
        steps: [
          `LTM revenue: [[${M(R)}]] + [[${M(ytdR1)}]] − [[${M(ytdR0)}]] = ${M(ltmR)}`,
          `LTM EBITDA: [[${M(E)}]] + [[${M(ytdE1)}]] − [[${M(ytdE0)}]] = ${M(ltmE)}`,
          tail('For revenue, the window is', R, ytdR0, ytdR1),
          `LTM margin: ${M(ltmE)} ÷ ${M(ltmR)} = ${pct(mL, 1)}, against ${pct(mFY, 1)} in the last fiscal year`
        ],
        visual: { kind: 'table', headers: ['', 'Last FY', `+ ${n}M this year`, `− ${n}M last year`, 'LTM'], rows: [
          ['Revenue', `[[${M(R)}]]`, `[[${M(ytdR1)}]]`, `[[${M(ytdR0)}]]`, M(ltmR)],
          ['EBITDA', `[[${M(E)}]]`, `[[${M(ytdE1)}]]`, `[[${M(ytdE0)}]]`, M(ltmE)],
          ['Margin', pct(mFY, 1), pct(ytdE1 / ytdR1, 1), pct(ytdE0 / ytdR0, 1), pct(mL, 1)]
        ], caption: `LTM to ${endMonth}` },
        values: { mode: 1, ebitda: ltmE, E, ytdE0, ytdE1, n, R, ytdR0, ytdR1, ltmR }
      };
    },
    // Second way: build the months. Spread each period evenly over its months and add up the latest 12
    // (for calendarization, January to December across the two fiscal years).
    check(p) {
      const v = p.values;
      if (v.mode === 3) {
        const months = [];
        for (let k = 0; k < 12; k++) months.push(v.fy1 / 12);
        for (let k = 0; k < 12; k++) months.push(v.fy2 / 12);
        // Fiscal year 1 covers months 0–11, ending in month fye of the calendar year; January is month 12 − fye.
        const cal = months.slice(12 - v.fye, 24 - v.fye).reduce((s, x) => s + x, 0);
        return Math.abs(cal - v.ebitda) <= 0.1 + 1e-9;
      }
      const roll = (fy, y0, y1) => {
        const s = [];
        for (let k = 0; k < v.n; k++) s.push(y0 / v.n);
        for (let k = v.n; k < 12; k++) s.push((fy - y0) / (12 - v.n));
        for (let k = 0; k < v.n; k++) s.push(y1 / v.n);
        return s.slice(s.length - 12).reduce((t, x) => t + x, 0);
      };
      const e = near(roll(v.E, v.ytdE0, v.ytdE1), v.ebitda, 1e-9);
      if (v.mode === 2) return e && near(v.ev / v.ebitda, v.ltmM, 1e-9);
      return e && near(roll(v.R, v.ytdR0, v.ytdR1), v.ltmR, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Unlevered free cash flow
  // Tax rates with an EBIT grid that keeps the tax charge to $0.1M: 25% on $2M steps, 24% and 26% on $5M, 21% on $10M.
  const TAX = [[0.21, 10], [0.24, 5], [0.25, 2], [0.25, 2], [0.26, 5]];
  Drills.add({
    id: 'drill-ib-ufcf',
    track: 'ib',
    module: 'ib-dcf',
    topic: 'Unlevered free cash flow',
    level: 1,
    ranges: { ufcf: [1, 4000], conversion: [0.15, 0.95] },
    make(r) {
      const mode = r.pick(['ebit', 'ebitda', 'ni', 'revenue']);
      const [t, grid] = r.pick(TAX);
      const tS = `[[${pct(t, 0)}]]`;
      let ebit, da, capex, dn, tax, ebitda, ni = 0, interest = 0, atInt = 0, R0 = 0, R1 = 0, m = 0, d = 0, c = 0, w = 0;
      if (mode === 'revenue') {
        R0 = r.step(300, 5000, 10);
        R1 = Math.round(R0 * (1 + r.step(0.03, 0.15, 0.01)) / 10) * 10;
        m = r.step(0.15, 0.35, 0.01);
        d = r.step(0.02, 0.05, 0.01);
        c = rd(d + r.step(0, 0.02, 0.01), 2);
        w = r.step(0.05, 0.2, 0.01);
        ebitda = r1(m * R1); da = r1(d * R1); capex = r1(c * R1); dn = r1(w * (R1 - R0));
        ebit = r1(ebitda - da);
        // Taxes are shown to $0.1M, and the rest of the working continues from that figure.
        tax = r1(ebit * t);
      } else {
        ebit = r.step(60, 1500, grid);
        da = Math.round(ebit * r.step(0.15, 0.5, 0.01));
        capex = Math.round(da * r.step(0.9, 1.6, 0.05));
        dn = Math.max(1, Math.round(ebit * r.step(0.01, 0.12, 0.01))) * (r.chance(0.75) ? 1 : -1);
        ebitda = ebit + da;
        tax = r1(ebit * t);
        if (mode === 'ni') {
          interest = Math.max(grid, Math.round(ebit * r.step(0.08, 0.4, 0.01) / grid) * grid);
          ni = r1((ebit - interest) * (1 - t));
          atInt = r1(interest * (1 - t));
        }
      }
      const nopat = r1(ebit - tax);
      const ufcf = r1(nopat + da - capex - dn);
      // Calculated figures share one number of decimals, so a column of them reads cleanly.
      const dpW = Math.max(...[ebit, da, capex, dn, tax, nopat, ufcf, ebitda, ni, atInt].map(dpOf));
      const F = (x) => millions(x, dpW);
      const given = mode !== 'revenue';
      const G = (x) => (given ? `[[${M(x)}]]` : F(x));
      const nwcQ = `net working capital ${dn > 0 ? 'rises' : 'falls'} by [[${M(Math.abs(dn))}]]`;
      const nwcStep = dn > 0 ? `Subtract the increase in net working capital: − ${G(dn)}` : `Add the decrease in net working capital: + ${G(-dn)}`;
      const sum = `UFCF: ${F(nopat)} + ${G(da)} − ${G(capex)}${dn > 0 ? ` − ${G(dn)}` : ` + ${G(-dn)}`} = ${F(ufcf)}, ${pct(ufcf / ebitda, 0)} of EBITDA`;
      const why0 = "Unlevered free cash flow is the cash the operations produce for every capital provider, lenders and shareholders alike, so it's measured before interest: tax is charged on EBIT as if the company had no debt, and the interest tax shield shows up in WACC instead. D&A comes back because it's a non-cash charge that already cut EBIT; its only cash effect is the tax it saved. Capex and a growing working-capital balance absorb cash, so they come off; a working-capital release adds cash.";
      // Given inputs keep their own format in the answer; calculated ones use the shared decimals.
      const I = (x) => (given ? M(x) : F(x));
      const rest = dn > 0
        ? `plus ${I(da)} of D&A, less ${I(capex)} of capex and the ${I(dn)} working-capital build`
        : `plus ${I(da)} of D&A and the ${I(-dn)} working-capital release, less ${I(capex)} of capex`;
      const restNi = dn > 0
        ? `Add ${I(da)} of D&A, then subtract ${I(capex)} of capex and the ${I(dn)} working-capital build`
        : `Add ${I(da)} of D&A and the ${I(-dn)} working-capital release, then subtract ${I(capex)} of capex`;
      const nwcBar = { label: dn > 0 ? 'Increase in NWC' : 'Decrease in NWC', delta: -dn };
      let q, a, steps, why = why0, start, wf;

      if (mode === 'ni') {
        q = `Net income is [[${M(ni)}]] after [[${M(interest)}]] of interest expense, at a ${tS} tax rate. D&A is [[${M(da)}]], capex [[${M(capex)}]], and ${nwcQ}. What's unlevered free cash flow?`;
        steps = [
          `After-tax interest: [[${M(interest)}]] × (1 − ${tS}) = ${F(atInt)}`,
          `NOPAT: [[${M(ni)}]] + ${F(atInt)} = ${F(nopat)}, what the company would earn with no debt (EBIT of ${F(ebit)} × (1 − ${tS}))`,
          `Add back D&A: + ${G(da)}; subtract capex: − ${G(capex)}`,
          nwcStep,
          sum
        ];
        a = `${F(ufcf)}. Net income plus ${F(atInt)} of after-tax interest is NOPAT of ${F(nopat)}. ${restNi}.`;
        why = why0 + ' From net income, add back interest after tax: it belongs to the lenders.';
        start = { label: 'Net income', value: ni };
        wf = [{ label: 'After-tax interest', delta: atInt }, { label: 'NOPAT', subtotal: true }, { label: 'D&A', delta: da }, { label: 'Capex', delta: -capex }, nwcBar];
      } else if (mode === 'revenue') {
        q = `Revenue grows from [[${M(R0)}]] to [[${M(R1)}]]. EBITDA margin [[${pct(m, 0)}]]; D&A [[${pct(d, 0)}]] and capex [[${pct(c, 0)}]] of revenue; net working capital [[${pct(w, 0)}]] of revenue; tax rate ${tS}. What's this year's unlevered FCF?`;
        steps = [
          `EBITDA: [[${pct(m, 0)}]] × [[${M(R1)}]] = ${F(ebitda)}; D&A: [[${pct(d, 0)}]] × [[${M(R1)}]] = ${F(da)}; EBIT = ${F(ebit)}`,
          `Taxes: ${F(ebit)} × ${tS} = ${F(tax)}, so NOPAT = ${F(nopat)}`,
          `Capex: [[${pct(c, 0)}]] × [[${M(R1)}]] = ${F(capex)}`,
          `Increase in NWC: [[${pct(w, 0)}]] × ([[${M(R1)}]] − [[${M(R0)}]]) = ${F(dn)}. Working capital grows with revenue`,
          sum
        ];
        a = `${F(ufcf)}: NOPAT of ${F(nopat)} ${rest}.`;
        why = why0 + ' In a projection, working capital scales with revenue, so growth itself uses cash.';
        start = { label: 'EBITDA', value: ebitda };
        wf = [{ label: 'D&A', delta: -da }, { label: 'EBIT', subtotal: true }, { label: 'Taxes', delta: -tax }, { label: 'D&A add-back', delta: da }, { label: 'Capex', delta: -capex }, nwcBar];
      } else {
        const fromEbitda = mode === 'ebitda';
        q = fromEbitda
          ? `EBITDA is [[${M(ebitda)}]], D&A [[${M(da)}]], capex [[${M(capex)}]] and the tax rate ${tS}, and ${nwcQ}. What's unlevered free cash flow?`
          : `EBIT is [[${M(ebit)}]], the tax rate ${tS}, D&A [[${M(da)}]] and capex [[${M(capex)}]], and ${nwcQ}. What's unlevered free cash flow?`;
        steps = (fromEbitda ? [`EBIT: [[${M(ebitda)}]] − [[${M(da)}]] = ${F(ebit)}`] : []).concat([
          `Taxes on EBIT: ${fromEbitda ? F(ebit) : `[[${M(ebit)}]]`} × ${tS} = ${F(tax)}, so NOPAT = ${F(nopat)}`,
          `Add back D&A: + ${G(da)}; subtract capex: − ${G(capex)}`,
          nwcStep,
          sum
        ]);
        a = `${F(ufcf)}: NOPAT of ${F(nopat)} ${rest}.`;
        start = fromEbitda ? { label: 'EBITDA', value: ebitda } : { label: 'EBIT', value: ebit };
        wf = (fromEbitda ? [{ label: 'D&A', delta: -da }, { label: 'EBIT', subtotal: true }] : [])
          .concat([{ label: 'Taxes', delta: -tax }, { label: fromEbitda ? 'D&A add-back' : 'D&A', delta: da }, { label: 'Capex', delta: -capex }, nwcBar]);
      }
      return {
        q, a, why, steps,
        formula: 'UFCF = EBIT × (1 − tax rate) + D&A − capex − increase in NWC\nFrom net income: add back interest × (1 − tax rate) to reach NOPAT\nSame thing: EBITDA × (1 − tax rate) + D&A × tax rate − capex − increase in NWC',
        visual: { kind: 'waterfall', unit: '$M', dp: dpW, start, steps: wf, end: { label: 'Unlevered FCF', value: ufcf } },
        // Only the revenue form rounds a step (taxes to $0.1M), so only it needs a tolerance.
        values: { ufcf, conversion: ufcf / ebitda, ebitda, da, capex, dn, t, ni, interest, R0, R1, m, d, c, w, mode, tol: mode === 'revenue' ? 0.05 + 1e-6 : 1e-6 }
      };
    },
    // Second way: the tax-shield form, EBITDA × (1 − t) + D&A × t − capex − increase in NWC, built from the raw inputs
    // (from net income, EBITDA is rebuilt as pre-tax income plus interest plus D&A).
    check(p) {
      const v = p.values;
      let ebitda = v.ebitda, da = v.da, capex = v.capex, dn = v.dn;
      if (v.mode === 'revenue') { ebitda = v.m * v.R1; da = v.d * v.R1; capex = v.c * v.R1; dn = v.w * (v.R1 - v.R0); }
      if (v.mode === 'ni') ebitda = v.ni / (1 - v.t) + v.interest + v.da;
      const exact = ebitda * (1 - v.t) + da * v.t - capex - dn;
      return Math.abs(exact - v.ufcf) <= v.tol && v.ufcf > 0;
    }
  });

  // The PV of a terminal value, discounted N years with an exact power, against the drill's figure (factor shown to
  // four decimals, PV to $1M): the gap is at most $0.5M plus the factor's rounding.
  const pvOk = (v) => {
    const pow = Math.pow(1 + v.W, v.N);
    return Math.abs(v.pvTV - v.tv / pow) <= 0.5 + v.tv * 5e-5 / (v.fac * pow) + 1e-6;
  };

  // ---------------------------------------------------------------- Gordon growth terminal value
  Drills.add({
    id: 'drill-ib-tv-gordon',
    track: 'ib',
    module: 'ib-dcf',
    topic: 'Gordon growth terminal value',
    level: 2,
    ranges: { tv: [150, 80000], multiple: [3, 30] },
    make(r) {
      const mode = r.pick(['peers', 'peers', 'pv']);
      const W = r.step(0.075, 0.115, 0.0025);
      const g = r.step(0.015, Math.min(0.035, Math.floor((W - 0.045) / 0.005 + 1e-9) * 0.005), 0.005);
      const fcf = r.step(40, 1500, 1);
      const ebitda = Math.round(fcf / r.step(0.4, 0.65, 0.01) / 5) * 5;
      // Each figure is shown rounded (next year's FCF to $0.1M, TV to $1M) and the next step works from it.
      const pipe = (w, gg) => {
        const f1 = r1(fcf * (1 + gg));
        const tv = rd(f1 / (w - gg), 0);
        return { f1, tv, m: tv / ebitda };
      };
      const base = pipe(W, g);
      const { f1, tv } = base;
      const im = base.m;
      const WS = `[[${rate(W)}]]`, gS = `[[${rate(g)}]]`, fS = `[[${M(fcf)}]]`, eS = `[[${M(ebitda)}]]`;
      const tvSteps = [
        `Next year's FCF: ${fS} × (1 + ${gS}) = ${M(f1)}. The formula needs the perpetuity's first cash flow, not the last forecast year's`,
        `Terminal value: ${M(f1)} ÷ (${WS} − ${gS}) = ${M(f1)} ÷ ${rate(W - g)} = ${M(tv)}`,
        `Implied exit multiple: ${M(tv)} ÷ ${eS} = ${mult(im, 1)} final-year EBITDA`
      ];
      const hi = pipe(W, g + 0.005);
      const why = "The Gordon growth model treats every cash flow after the forecast as a perpetuity growing at a constant rate, so it takes the first cash flow of that perpetuity (next year's) and divides by WACC minus growth. The growth rate has to be one the business can sustain forever, so it's usually kept at or below long-run nominal growth in the economy. Because value rests on the gap between WACC and growth, small changes in either swing the answer. Converting the result into an EBITDA multiple is the sanity check: it should look like what similar companies trade at.";
      const formula = 'Terminal value = final-year FCF × (1 + g) ÷ (WACC − g)\nImplied exit multiple = terminal value ÷ final-year EBITDA\nPV of terminal value = terminal value ÷ (1 + WACC)^N';

      if (mode === 'pv') {
        const N = r.pick([5, 5, 6, 7]);
        const gf = r.step(0.04, 0.1, 0.01);
        let raw = 0;
        for (let k = 1; k <= N; k++) raw += fcf / Math.pow(1 + gf, N - k) / Math.pow(1 + W, k);
        const pvSum = Math.round(raw / 5) * 5;
        const fac = rd(Math.pow(1 + W, N), 4);
        const pvTV = rd(tv / fac, 0);
        const ev = pvSum + pvTV;
        const share = pvTV / ev;
        return {
          q: `Year-[[${N}]] unlevered FCF is ${fS} and EBITDA ${eS}; the PV of years 1–${N} FCF is [[${M(pvSum)}]]. WACC ${WS}, perpetual growth ${gS}, year-end discounting. What are the terminal value, EV and the terminal value's share of EV?`,
          a: `Terminal value ${M(tv)} (${mult(im, 1)} EBITDA), worth ${M(pvTV)} today. EV is ${M(ev)}, and the terminal value is ${pct(share, 0)} of it.`,
          why, formula,
          steps: tvSteps.concat([
            `Discount it [[${N}]] years: (1 + ${WS})^${N} = ${num(fac, 4)}, so ${M(tv)} ÷ ${num(fac, 4)} = ${M(pvTV)}`,
            `EV: [[${M(pvSum)}]] + ${M(pvTV)} = ${M(ev)}`,
            `Terminal value share: ${M(pvTV)} ÷ ${M(ev)} = ${pct(share, 1)}. That's typical, and why the growth rate and WACC deserve the most scrutiny`
          ]),
          visual: { kind: 'stack', unit: '$M', dp: 0, caption: `Enterprise value of ${M(ev)}`, items: [
            { label: `PV of years 1–${N} FCF`, value: pvSum },
            { label: 'PV of terminal value', value: pvTV, highlight: true }
          ] },
          values: { mode: 2, tv, multiple: im, f1, fcf, ebitda, W, g, N, fac, pvTV, pvSum, ev, share }
        };
      }

      const pm = Math.max(6, Math.round(im * r.step(0.75, 1.25, 0.05) * 2) / 2);
      const lo = pm - 1, hi2 = pm + 1;
      const shownM = rd(im, 1);
      const where = shownM < lo ? 'below' : shownM > hi2 ? 'above' : 'inside';
      const verdict = where === 'inside' ? `Inside the [[${mult(lo, 1)}]]–[[${mult(hi2, 1)}]] peer range, so the growth rate and WACC hang together`
        : where === 'below' ? `Below the [[${mult(lo, 1)}]]–[[${mult(hi2, 1)}]] peer range: the ${gS} growth rate looks conservative, or WACC high`
          : `Above the [[${mult(lo, 1)}]]–[[${mult(hi2, 1)}]] peer range: the ${gS} growth rate looks aggressive, or WACC low`;
      const cols = [g - 0.005, g, g + 0.005];
      const rows = [W - 0.005, W, W + 0.005].map((w) => [w === W ? `[[${rate(w)}]]` : rate(w)].concat(cols.map((gg) => mult(pipe(w, gg).m, 1))));
      return {
        q: `Final-year unlevered FCF is ${fS} and EBITDA ${eS}. WACC ${WS}, perpetual growth ${gS}. What's the Gordon growth terminal value, and what exit multiple does it imply? Peers trade at [[${mult(lo, 1)}]] to [[${mult(hi2, 1)}]] EBITDA.`,
        a: `${M(tv)}, which implies ${an(mult(im, 1))} ${mult(im, 1)} exit multiple: ${where === 'inside' ? 'inside the peer range, so the assumptions look consistent' : where === 'below' ? 'below the peer range, so the growth rate looks conservative' : 'above the peer range, so the growth rate looks aggressive'}.`,
        why, formula,
        steps: tvSteps.concat([
          verdict,
          `Sensitivity: at ${rate(g + 0.005)} growth the terminal value is ${M(hi.tv)}, ${pct(hi.tv / tv - 1, 0)} higher, because the gap WACC − g shrinks`
        ]),
        visual: { kind: 'table', headers: ['WACC', `g ${rate(cols[0])}`, `g ${rate(cols[1])}`, `g ${rate(cols[2])}`], rows,
          caption: 'Implied exit multiple of final-year EBITDA; the given case is the middle cell' },
        values: { mode: 1, tv, multiple: im, f1, fcf, ebitda, W, g, lo, hi: hi2, where }
      };
    },
    // Second way: add up the growing perpetuity year by year (2,000 years is plenty) and compare with the formula;
    // then multiply the implied multiple back to the terminal value.
    check(p) {
      const v = p.values;
      let sum = 0, cf = v.f1;
      for (let k = 1; k <= 2000; k++) { sum += cf / Math.pow(1 + v.W, k); cf *= 1 + v.g; }
      const ok = Math.abs(sum - v.tv) <= 0.5 + 1e-6 * v.tv && near(v.multiple * v.ebitda, v.tv, 1e-9) && Math.abs(v.f1 - v.fcf * (1 + v.g)) <= 0.05 + 1e-9;
      if (v.mode === 2) return ok && near(v.pvSum + v.pvTV, v.ev, 1e-9) && pvOk(v) && near(v.pvTV / v.ev, v.share, 1e-9);
      const m = rd(v.multiple, 1);
      return ok && v.where === (m < v.lo ? 'below' : m > v.hi ? 'above' : 'inside');
    }
  });

  // ---------------------------------------------------------------- Exit-multiple terminal value
  Drills.add({
    id: 'drill-ib-tv-exit',
    track: 'ib',
    module: 'ib-dcf',
    topic: 'Exit-multiple terminal value',
    level: 2,
    ranges: { tv: [300, 80000], g: [-0.03, 0.08] },
    make(r) {
      const mode = r.pick(['basic', 'basic', 'pv']);
      const W = r.step(0.075, 0.115, 0.0025);
      const ebitda = r.step(80, 2500, 5);
      const fcf = Math.round(ebitda * r.step(0.38, 0.62, 0.01));
      // Pick a growth rate first, then round the multiple it implies to 0.5x, so the multiples look like real ones.
      const g0 = r.step(0.005, 0.05, 0.005);
      const m = Math.min(16, Math.max(5, Math.round(fcf * (1 + g0) / (W - g0) / ebitda * 2) / 2));
      // Shown figures: TV to $0.1M and TV × WACC to $0.1M; the implied growth works from them.
      const pipe = (mm) => {
        const tv = r1(mm * ebitda);
        const top = r1(tv * W);
        return { tv, top, g: (top - fcf) / (tv + fcf) };
      };
      const { tv, top, g } = pipe(m);
      const dpW = Math.max(dpOf(tv), dpOf(top));
      const F = (x) => millions(x, dpW);
      const mS = `[[${mult(m, 1)}]]`, WS = `[[${rate(W)}]]`, eS = `[[${M(ebitda)}]]`, fS = `[[${M(fcf)}]]`;
      // Judge the rate as shown, to one decimal.
      const gShown = rd(g, 3);
      const band = gShown < 0 ? 'negative' : gShown < 0.015 ? 'low' : gShown <= 0.035 ? 'plausible' : 'high';
      const verdict = {
        negative: `That implies cash flow shrinking forever, so the ${mS} multiple looks too low for a going concern (or WACC too high)`,
        low: `That's very little growth for a business that keeps going, so the ${mS} multiple looks conservative (or WACC high)`,
        plausible: `That's a plausible perpetual rate: models typically use low single digits, at or below long-run growth in the economy`,
        high: `That's more than most businesses can sustain forever (models rarely go much above 3–4%), so the ${mS} multiple looks rich`
      }[band];
      const short = {
        negative: 'cash flow shrinking forever, so the multiple looks too low',
        low: 'low, so the multiple looks conservative',
        plausible: 'a plausible long-run rate',
        high: 'aggressive, so the multiple may be too rich'
      }[band];
      const tvStep = `Terminal value: ${mS} × ${eS} = ${F(tv)}`;
      const gStep = `Implied growth: (${F(tv)} × ${WS} − ${fS}) ÷ (${F(tv)} + ${fS}) = (${F(top)} − ${fS}) ÷ ${F(tv + fcf)} = ${pct(g, 1)}`;
      const why = "An exit multiple values the business as if it were sold at the end of the forecast at a multiple similar companies trade at today. It's market-based and easy to explain, but it imports today's pricing into a year far in the future. The cross-check is to ask what perpetual growth rate the same terminal value implies: solve the Gordon formula, TV = FCF × (1 + g) ÷ (WACC − g), for g. If the answer is above long-run growth in the economy, the multiple is too rich; if it's near zero or negative, it may be too low.";
      const formula = 'Terminal value = final-year EBITDA × exit multiple\nImplied growth = (TV × WACC − final-year FCF) ÷ (TV + final-year FCF)\nPV of terminal value = TV ÷ (1 + WACC)^N, from the end of year N';

      if (mode === 'pv') {
        const N = r.pick([5, 5, 6, 7]);
        const gf = r.step(0.04, 0.1, 0.01);
        let raw = 0;
        for (let k = 1; k <= N; k++) raw += fcf / Math.pow(1 + gf, N - k) / Math.pow(1 + W, k);
        const pvSum = Math.round(raw / 5) * 5;
        const fac = rd(Math.pow(1 + W, N), 4);
        const pvTV = rd(tv / fac, 0);
        const ev = pvSum + pvTV;
        const share = pvTV / ev;
        return {
          q: `Year-[[${N}]] EBITDA is ${eS} and unlevered FCF ${fS}; the PV of years 1–${N} FCF is [[${M(pvSum)}]]. Exit multiple ${mS}, WACC ${WS}. What's EV, how much of it is terminal value, and what growth rate does the multiple imply?`,
          a: `EV is ${M(ev)}, ${pct(share, 0)} of it from the terminal value (${M(tv)} at exit, ${M(pvTV)} today). The multiple implies ${pct(g, 1)} perpetual growth: ${short}.`,
          why, formula,
          steps: [
            tvStep,
            `Discount it [[${N}]] full years: (1 + ${WS})^${N} = ${num(fac, 4)}, so ${F(tv)} ÷ ${num(fac, 4)} = ${M(pvTV)}. An exit is a sale at the end of year ${N}, so it's discounted from year-end even under the mid-year convention`,
            `EV: [[${M(pvSum)}]] + ${M(pvTV)} = ${M(ev)}; terminal value share ${M(pvTV)} ÷ ${M(ev)} = ${pct(share, 1)}`,
            gStep,
            verdict
          ],
          visual: { kind: 'stack', unit: '$M', dp: 0, caption: `Enterprise value of ${M(ev)}`, items: [
            { label: `PV of years 1–${N} FCF`, value: pvSum },
            { label: 'PV of terminal value', value: pvTV, highlight: true }
          ] },
          values: { mode: 2, tv, g, m, W, fcf, ebitda, top, N, fac, pvTV, pvSum, ev, share }
        };
      }

      const rows = [m - 1, m, m + 1].map((mm) => {
        const x = pipe(mm);
        return [mm === m ? mS : mult(mm, 1), F(x.tv), pct(x.g, 1)];
      });
      return {
        q: `Final-year EBITDA is ${eS} and unlevered FCF ${fS}. At ${an(mult(m, 1))} ${mS} exit multiple and ${an(rate(W))} ${WS} WACC, what's the terminal value, and what perpetual growth rate does it imply?`,
        a: `${M(tv)}. It implies ${pct(g, 1)} perpetual growth: ${short}.`,
        why, formula,
        steps: [
          tvStep,
          gStep,
          'That formula is the Gordon model, TV = FCF × (1 + g) ÷ (WACC − g), solved for g',
          verdict
        ],
        visual: { kind: 'table', headers: ['Exit multiple', 'Terminal value', 'Implied growth'], rows, caption: `At ${an(rate(W))} ${rate(W)} WACC; each turn of multiple moves the implied growth rate` },
        values: { mode: 1, tv, g, m, W, fcf, ebitda, top }
      };
    },
    // Second way: put the implied growth back into the Gordon formula; it must rebuild the terminal value.
    check(p) {
      const v = p.values;
      const gx = (v.tv * v.W - v.fcf) / (v.tv + v.fcf);
      const ok = near(v.fcf * (1 + gx) / (v.W - gx), v.tv, 1e-9) && Math.abs(v.g - gx) <= 0.05 / (v.tv + v.fcf) + 1e-12 && near(v.tv, v.m * v.ebitda, 1e-9);
      if (v.mode === 2) return ok && near(v.pvSum + v.pvTV, v.ev, 1e-9) && pvOk(v);
      return ok;
    }
  });

  // ---------------------------------------------------------------- Discount factors and the mid-year convention
  Drills.add({
    id: 'drill-ib-discount',
    track: 'ib',
    module: 'ib-dcf',
    topic: 'Mid-year convention',
    level: 2,
    ranges: { pv: [50, 40000], lift: [0.03, 0.065] },
    make(r) {
      const mode = r.pick(['compare', 'compare', 'tv']);
      const W = r.step(0.075, 0.12, 0.0025);
      const N = r.pick([3, 4, 5]);
      const f0 = r.step(40, 600, 1);
      const gf = r.step(0.03, 0.12, 0.01);
      const fcfs = [];
      for (let t = 1; t <= N; t++) fcfs.push(Math.round(f0 * Math.pow(1 + gf, t - 1)));
      // Factors to four decimals and PVs to $0.1M, the way a model's output would show them.
      const dfMid = (t) => rd(1 / Math.pow(1 + W, t - 0.5), 4);
      const dfEnd = (t) => rd(1 / Math.pow(1 + W, t), 4);
      const pvMid = fcfs.map((f, i) => r1(f * dfMid(i + 1)));
      const pvEnd = fcfs.map((f, i) => r1(f * dfEnd(i + 1)));
      const sMid = r1(pvMid.reduce((s, x) => s + x, 0));
      const sEnd = r1(pvEnd.reduce((s, x) => s + x, 0));
      const lift = sMid / sEnd - 1;
      const WS = `[[${rate(W)}]]`;
      const fS = fcfs.map((f) => `[[${M(f)}]]`);
      const list = `${fS.slice(0, -1).join(', ')} and ${fS[N - 1]}`;
      const half = rd(Math.sqrt(1 + W), 4);
      const why = "Discounting assumes each year's cash arrives on a single date. Year-end discounting puts it all on the last day of the year, but a business collects cash all year, so the mid-year convention discounts each year's cash flow from the middle of the year: 0.5, 1.5, 2.5 years and so on. Every cash flow moves half a year closer, so the PV rises by the same factor, (1 + WACC)^0.5, roughly half of WACC. An exit-multiple terminal value is a sale at the end of the final year, so it keeps year-end discounting.";
      const formula = 'Year-end factor = 1 ÷ (1 + WACC)^t\nMid-year factor = 1 ÷ (1 + WACC)^(t − 0.5)\nPV = Σ cash flow × discount factor';
      const P = (x) => millions(x, 1);
      const yearStep = (i, withEnd) => `Year ${i + 1}: ${fS[i]} × ${num(dfMid(i + 1), 4)} = ${P(pvMid[i])}` + (withEnd ? ` (year-end: × ${num(dfEnd(i + 1), 4)} = ${P(pvEnd[i])})` : '');
      const periods = Array.from({ length: N }, (_, i) => dec(i + 0.5, 1)).join(', ');

      if (mode === 'tv') {
        const tv = Math.round(fcfs[N - 1] * r.step(12, 22, 0.5) / 10) * 10;
        const dN = dfEnd(N);
        const pvTV = r1(tv * dN);
        const ev = r1(sMid + pvTV);
        return {
          q: `Unlevered FCF is ${list} in years 1–${N}, and the exit-multiple terminal value is [[${M(tv)}]] at the end of year ${N}. WACC is ${WS}. Using the mid-year convention for the cash flows, what's enterprise value?`,
          a: `${P(ev)}: ${P(sMid)} from the cash flows, discounted from mid-year, plus ${P(pvTV)} for the terminal value, discounted from the end of year ${N}.`,
          why, formula,
          steps: [`Mid-year factors: 1 ÷ (1 + ${WS})^t for t = ${periods} years`]
            .concat(fcfs.map((f, i) => yearStep(i, false)))
            .concat([
              `Cash flows: ${pvMid.map(P).join(' + ')} = ${P(sMid)}`,
              `Terminal value: [[${M(tv)}]] × 1 ÷ (1 + ${WS})^${N} = [[${M(tv)}]] × ${num(dN, 4)} = ${P(pvTV)}. It's a sale price at the end of year ${N}, so it's discounted the full ${N} years`,
              `EV: ${P(sMid)} + ${P(pvTV)} = ${P(ev)}`,
              `A Gordon growth terminal value built on mid-year cash flows is often discounted ${dec(N - 0.5, 1)} years instead; practice varies, so check the model`
            ]),
          visual: { kind: 'table', headers: ['Year', 'Cash flow', 'Periods', 'Factor', 'PV'], rows: fcfs.map((f, i) => [String(i + 1), fS[i], dec(i + 0.5, 1), num(dfMid(i + 1), 4), P(pvMid[i])])
            .concat([['TV', `[[${M(tv)}]]`, String(N), num(dN, 4), P(pvTV)], ['EV', '', '', '', P(ev)]]) },
          values: { mode: 2, pv: sMid, sEnd, lift, W, fcfs, tv, pvTV, ev, N }
        };
      }

      return {
        q: `Unlevered FCF is ${list} in years 1–${N}. WACC is ${WS}. What's the present value with the mid-year convention, and how much higher is it than with year-end discounting?`,
        a: `${P(sMid)} with the mid-year convention, ${pct(lift, 1)} more than the ${P(sEnd)} from year-end discounting, because each cash flow arrives half a year sooner.`,
        why, formula,
        steps: [`Mid-year factors: 1 ÷ (1 + ${WS})^t for t = ${periods}; year-end factors use t = ${Array.from({ length: N }, (_, i) => i + 1).join(', ')}`]
          .concat(fcfs.map((f, i) => yearStep(i, true)))
          .concat([
            `Mid-year PV: ${pvMid.map(P).join(' + ')} = ${P(sMid)}`,
            `Year-end PV: ${pvEnd.map(P).join(' + ')} = ${P(sEnd)}`,
            `Difference: ${P(sMid)} ÷ ${P(sEnd)} − 1 = ${pct(lift, 1)}. Every flow moves half a year closer, so the ratio is (1 + ${WS})^0.5 = ${num(half, 4)} for any cash flows`
          ]),
        visual: { kind: 'table', headers: ['Year', 'FCF', 'PV mid-year', 'PV year-end'], rows: fcfs.map((f, i) => [String(i + 1), fS[i], P(pvMid[i]), P(pvEnd[i])])
          .concat([['Total', M(fcfs.reduce((s, x) => s + x, 0)), P(sMid), P(sEnd)]]) },
        values: { mode: 1, pv: sMid, sEnd, lift, W, fcfs, tv: 0, pvTV: 0, ev: 0, N }
      };
    },
    // Second way: discount year-end with Drills.npv, then scale by (1 + WACC)^0.5 for the mid-year view.
    // Factors to four decimals and PVs to $0.1M leave a small, bounded rounding gap.
    check(p) {
      const v = p.values;
      const yearEnd = Drills.npv(v.W, [0].concat(v.fcfs));
      const tol = v.fcfs.reduce((s, f) => s + 0.05 + f * 5e-5, 0.05);
      const ok = Math.abs(yearEnd * Math.sqrt(1 + v.W) - v.pv) <= tol && Math.abs(yearEnd - v.sEnd) <= tol;
      if (v.mode === 2) return ok && Math.abs(v.pvTV - v.tv / Math.pow(1 + v.W, v.N)) <= 0.05 + v.tv * 5e-5 && near(v.pv + v.pvTV, v.ev, 1e-9);
      return ok;
    }
  });

  // ---------------------------------------------------------------- CAPM cost of equity
  Drills.add({
    id: 'drill-ib-capm',
    track: 'ib',
    module: 'ib-wacc',
    topic: 'CAPM cost of equity',
    level: 1,
    ranges: { ke: [0.05, 0.22] },
    make(r) {
      const mode = r.pick(['basic', 'basic', 'market', 'size']);
      const rf = r.step(0.03, 0.05, 0.0025);
      const erp = r.step(0.045, 0.065, 0.0025);
      const beta = r.step(0.6, 1.8, 0.05);
      const size = mode === 'size' ? r.step(0.01, 0.035, 0.0025) : 0;
      const rm = rd(rf + erp, 4);
      // Beta × ERP is shown to 0.01%, and the cost of equity adds up from the figures shown.
      const prem = rd(beta * erp, 4);
      const ke = rd(rf + prem + size, 4);
      const rfS = `[[${rate(rf)}]]`, erpS = `[[${rate(erp)}]]`, bS = `[[${num(beta, 2)}]]`, sizeS = `[[${rate(size)}]]`;
      const steps = [];
      let q;
      if (mode === 'market') {
        q = `The risk-free rate is ${rfS} and the market is expected to return [[${rate(rm)}]]. A stock's beta is ${bS}. What's its cost of equity under CAPM?`;
        steps.push(`Equity risk premium: [[${rate(rm)}]] − ${rfS} = ${rate(erp)}. CAPM needs the market's return above the risk-free rate, not the market return itself`);
      } else if (mode === 'size') {
        q = `A small company's beta, from its peers, is ${bS}. Risk-free rate ${rfS}, equity risk premium ${erpS}, and you add ${an(rate(size))} ${sizeS} size premium. What's its cost of equity?`;
      } else {
        q = `A company's levered beta is ${bS}. With ${an(rate(rf))} ${rfS} risk-free rate and ${an(rate(erp))} ${erpS} equity risk premium, what's its cost of equity under CAPM?`;
      }
      const erpIn = mode === 'market' ? rate(erp) : erpS;
      steps.push(`Beta × equity risk premium: ${bS} × ${erpIn} = ${pct(prem, 2)}`);
      steps.push(`Cost of equity: ${rfS} + ${pct(prem, 2)}${size ? ` + ${sizeS}` : ''} = ${pct(ke, 2)}`);
      steps.push(`Each 0.1 of beta moves it by 0.1 × ${rate(erp)} = ${dec(erp * 10, 3)} percentage points; a beta of ${num(beta, 2)} ${beta > 1 ? 'means the stock swings more than the market, so it needs more than the market premium' : beta < 1 ? 'means the stock swings less than the market, so it needs less than the market premium' : 'earns exactly the market premium'}`);
      return {
        q,
        a: `${pct(ke, 2)}: the ${rate(rf)} risk-free rate plus ${num(beta, 2)} × the ${rate(erp)} equity risk premium (${pct(prem, 2)})${size ? `, plus ${an(rate(size))} ${rate(size)} size premium` : ''}.`,
        why: "CAPM prices only the risk a diversified investor can't diversify away: how much the stock moves with the market, measured by beta. Start from the risk-free rate and add beta times the equity risk premium, the extra return the market as a whole is expected to earn over risk-free. A beta of 1.0 earns exactly the market premium; above 1.0, more. Practice varies on every input: which government bond sets the risk-free rate, how the premium is estimated, and whether to add size or country premiums for small or emerging-market companies.",
        formula: 'Cost of equity = risk-free rate + beta × equity risk premium (+ any size or country premium)\nEquity risk premium = expected market return − risk-free rate',
        steps,
        visual: { kind: 'waterfall', unit: '%', dp: 2, start: { label: 'Risk-free rate', value: rd(rf * 100, 2) },
          steps: [{ label: `Beta × ERP (${num(beta, 2)} × ${rate(erp)})`, delta: rd(prem * 100, 2) }].concat(size ? [{ label: 'Size premium', delta: rd(size * 100, 2) }] : []),
          end: { label: 'Cost of equity', value: rd(ke * 100, 2) } },
        values: { ke, rf, beta, erp, size, rm, prem }
      };
    },
    // Second way: the security market line, cost of equity = (1 − beta) × risk-free + beta × market return (+ size premium).
    check(p) {
      const v = p.values;
      return Math.abs((1 - v.beta) * v.rf + v.beta * v.rm + v.size - v.ke) <= 5e-5 + 1e-12;
    }
  });

  // ---------------------------------------------------------------- WACC
  Drills.add({
    id: 'drill-ib-wacc',
    track: 'ib',
    module: 'ib-wacc',
    topic: 'WACC',
    level: 2,
    ranges: { wacc: [0.045, 0.15], wE: [0.25, 0.95] },
    make(r) {
      const mode = r.pick(['given', 'capm', 'capm', 'pref', 'target']);
      const t = r.pick([0.21, 0.25, 0.25, 0.26]);
      const tS = `[[${pct(t, 0)}]]`;
      let ke, rf = 0, beta = 0, erp = 0, prem = 0;
      if (mode === 'capm') {
        rf = r.step(0.03, 0.05, 0.0025);
        beta = r.step(0.7, 1.6, 0.05);
        erp = r.step(0.045, 0.065, 0.0025);
        prem = rd(beta * erp, 4);
        ke = rd(rf + prem, 4);
      } else {
        ke = r.step(0.085, 0.14, 0.0025);
      }
      // Debt costs less than equity: keep the pre-tax yield at least 2 points below the cost of equity.
      const kd = r.step(0.045, Math.max(0.045, Math.min(0.09, Math.floor((ke - 0.02) / 0.0025 + 1e-9) * 0.0025)), 0.0025);
      const kdat = rd(kd * (1 - t), 4);
      let E = 0, D = 0, P = 0, kp = 0, price = 0, shares = 0, de = 0, wD, wP = 0;
      if (mode === 'target') {
        de = r.pick([0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1]);
        wD = rd(de / (1 + de), 3);
      } else {
        if (mode === 'pref') {
          E = r.step(800, 30000, 10);
        } else {
          price = r.int(1500, 15000) / 100;
          shares = r.step(20, 800, 0.1);
          E = rd(price * shares, 0);
        }
        D = Math.max(10, Math.round(E * r.step(0.1, 0.9, 0.01) / 10) * 10);
        if (mode === 'pref') {
          P = Math.max(10, Math.round(E * r.step(0.03, 0.12, 0.01) / 10) * 10);
          kp = r.step(Math.max(kdat + 0.005, 0.055), ke - 0.005, 0.0025);
          kp = rd(Math.ceil(kp / 0.0025 - 1e-9) * 0.0025, 4);
        }
        const V = E + D + P;
        wD = rd(D / V, 3);
        wP = rd(P / V, 3);
      }
      const wE = rd(1 - wD - wP, 3);
      const cE = rd(wE * ke, 4), cD = rd(wD * kdat, 4), cP = rd(wP * kp, 4);
      const wacc = rd(cE + cD + cP, 4);
      const V = E + D + P;
      const w1 = (x) => pct(x, 1), p2 = (x) => pct(x, 2);
      const keS = mode === 'capm' ? p2(ke) : `[[${rate(ke)}]]`;
      const steps = [];
      let q;
      if (mode === 'target') {
        q = `The company targets [[${pct(de, 0)}]] debt to equity. Cost of equity [[${rate(ke)}]], pre-tax cost of debt [[${rate(kd)}]], tax rate ${tS}. What's WACC?`;
        steps.push(`Weights from D/E: debt [[${pct(de, 0)}]] ÷ (1 + [[${pct(de, 0)}]]) = ${w1(wD)} of capital, equity ${w1(wE)}. A D/E of ${pct(de, 0)} doesn't mean ${pct(de, 0)} debt`);
      } else if (mode === 'pref') {
        q = `Equity value [[${M(E)}]], debt [[${M(D)}]] yielding [[${rate(kd)}]] pre-tax, preferred stock [[${M(P)}]] costing [[${rate(kp)}]], tax rate ${tS}, cost of equity [[${rate(ke)}]]. What's WACC?`;
        steps.push(`Total capital: [[${M(E)}]] + [[${M(D)}]] + [[${M(P)}]] = ${M(V)}; weights: equity ${w1(wE)}, debt ${w1(wD)}, preferred ${w1(wP)}`);
      } else {
        const capm = mode === 'capm' ? ` Risk-free rate [[${rate(rf)}]], beta [[${num(beta, 2)}]], equity risk premium [[${rate(erp)}]].` : ` Cost of equity [[${rate(ke)}]].`;
        q = `Share price [[${dollars(price, 2)}]], [[${num(shares, 1)}M]] diluted shares, [[${M(D)}]] of debt (market value) yielding [[${rate(kd)}]] pre-tax, tax rate ${tS}.${capm} What's WACC?`;
        steps.push(`Equity value: [[${dollars(price, 2)}]] × [[${num(shares, 1)}M]] = ${M(E)}; total capital ${M(E)} + [[${M(D)}]] = ${M(V)}`);
        steps.push(`Weights: equity ${M(E)} ÷ ${M(V)} = ${w1(wE)}, debt ${w1(wD)}`);
        if (mode === 'capm') steps.push(`Cost of equity: [[${rate(rf)}]] + [[${num(beta, 2)}]] × [[${rate(erp)}]] = [[${rate(rf)}]] + ${p2(prem)} = ${p2(ke)}`);
      }
      steps.push(`After-tax cost of debt: [[${rate(kd)}]] × (1 − ${tS}) = ${p2(kdat)}`);
      if (P) steps.push(`Preferred costs its full [[${rate(kp)}]]: its dividends aren't tax-deductible`);
      steps.push(`WACC: ${w1(wE)} × ${keS} + ${w1(wD)} × ${p2(kdat)}${P ? ` + ${w1(wP)} × [[${rate(kp)}]]` : ''} = ${p2(cE)} + ${p2(cD)}${P ? ` + ${p2(cP)}` : ''} = ${p2(wacc)}`);
      const rows = [['Equity', w1(wE), keS, p2(cE)], ['Debt, after tax', w1(wD), p2(kdat), p2(cD)]];
      if (P) rows.push(['Preferred', w1(wP), `[[${rate(kp)}]]`, p2(cP)]);
      rows.push(['WACC', '100.0%', '', p2(wacc)]);
      return {
        q,
        a: `${p2(wacc)}: ${w1(wE)} equity at ${p2(ke)} and ${w1(wD)} debt at ${p2(kdat)} after tax${P ? `, plus ${w1(wP)} preferred at ${rate(kp)}` : ''}.`,
        why: "WACC is the return the business must earn to satisfy all its capital providers at once, so each source's cost is weighted by its share of capital at market value: what investors could sell their stakes for today, not book value. Debt enters after tax because interest is deductible, which makes it the cheapest source; equity costs the most because it's paid last and absorbs the swings. Adding debt lowers WACC at first, until rising default risk pushes up the cost of both debt and equity.",
        formula: 'WACC = E ÷ V × cost of equity + D ÷ V × pre-tax cost of debt × (1 − tax rate) (+ P ÷ V × cost of preferred)\nV = E + D (+ P), at market values\nFrom a D/E ratio: D ÷ V = D/E ÷ (1 + D/E)',
        steps,
        visual: { kind: 'table', headers: ['Source', 'Weight', 'Cost', 'Contribution'], rows },
        values: { wacc, wE, wD, wP, ke, kd, kdat, kp, t, E, D, P, de, mode }
      };
    },
    // Second way: the dollar cost of capital. Each source's market value times its cost, summed and divided by total
    // capital (for a target D/E, per $1 of equity), with unrounded weights. Rounding the weights to 0.1% and the costs
    // to 0.01% leaves a small gap.
    check(p) {
      const v = p.values;
      const E = v.mode === 'target' ? 1 : v.E, D = v.mode === 'target' ? v.de : v.D, P = v.P;
      const dollar = (E * v.ke + D * v.kd * (1 - v.t) + P * v.kp) / (E + D + P);
      return Math.abs(dollar - v.wacc) <= 4e-4 && v.wacc < v.ke && v.wacc > v.kdat && near(v.wE + v.wD + v.wP, 1, 1e-9);
    }
  });

  // ---------------------------------------------------------------- Unlevering and relevering beta
  Drills.add({
    id: 'drill-ib-beta',
    track: 'ib',
    module: 'ib-wacc',
    topic: 'Unlevering and relevering beta',
    level: 2,
    ranges: { betaL: [0.4, 3], betaU: [0.3, 1.8] },
    make(r) {
      const mode = r.pick(['peers', 'peers', 'recap', 'capital']);
      const t = r.pick([0.21, 0.25, 0.25]);
      const tS = `[[${pct(t, 0)}]]`;
      const keep = dec(1 - t, 2);
      // 1 + (1 − t) × D/E, shown with the decimals it needs (1.30, 1.2765).
      const fac = (de) => rd(1 + (1 - t) * de, 4);
      const fs = (x) => num(x, [2, 3, 4].find((dp) => Math.abs(x - rd(x, dp)) < 1e-9) || 4);
      const b2 = (x) => num(x, 2);
      const why = "A levered beta mixes two risks: the business's own risk and the extra swing that debt adds to the equity. Peers carry different amounts of debt, so strip the leverage out of each beta (unlever), average the business risk, then add back the target's leverage (relever). Hamada's formula assumes debt carries no market risk (a debt beta of zero) and that the debt level is permanent. Relevered betas rise with leverage, which is why the cost of equity climbs as a company borrows more.";
      const formula = 'Unlevered beta = levered beta ÷ (1 + (1 − tax rate) × D/E)\nRelevered beta = unlevered beta × (1 + (1 − tax rate) × target D/E)\nD/E = (D/V) ÷ (1 − D/V)';
      const assume = 'Hamada assumes debt carries no market risk (a debt beta of zero) and a steady debt level; with risky debt, the unlevered beta would be a little higher';

      if (mode === 'recap') {
        const bL0 = r.step(0.8, 1.4, 0.05);
        const de0 = r.step(0.1, 0.5, 0.05);
        const de1 = r.step(0.6, 1.5, 0.1);
        const rf = r.step(0.03, 0.05, 0.0025), erp = r.step(0.045, 0.065, 0.0025);
        const f0 = fac(de0), f1 = fac(de1);
        const bU = rd(bL0 / f0, 2);
        const bL1 = rd(bU * f1, 2);
        const ke0 = rd(rf + rd(bL0 * erp, 4), 4), ke1 = rd(rf + rd(bL1 * erp, 4), 4);
        return {
          q: `A company's beta is [[${b2(bL0)}]] at [[${pct(de0, 0)}]] debt to equity. A recapitalization takes debt to equity to [[${pct(de1, 0)}]]. Tax rate ${tS}, risk-free rate [[${rate(rf)}]], equity risk premium [[${rate(erp)}]]. New levered beta and cost of equity?`,
          a: `Beta rises to ${b2(bL1)} and the cost of equity from ${pct(ke0, 2)} to ${pct(ke1, 2)}. The business risk (unlevered beta ${b2(bU)}) hasn't changed; the equity now carries far more debt ahead of it.`,
          why, formula,
          steps: [
            `Unlever: [[${b2(bL0)}]] ÷ (1 + ${keep} × [[${pct(de0, 0)}]]) = [[${b2(bL0)}]] ÷ ${fs(f0)} = ${b2(bU)}`,
            `Relever: ${b2(bU)} × (1 + ${keep} × [[${pct(de1, 0)}]]) = ${b2(bU)} × ${fs(f1)} = ${b2(bL1)}`,
            `Cost of equity before: [[${rate(rf)}]] + [[${b2(bL0)}]] × [[${rate(erp)}]] = ${pct(ke0, 2)}`,
            `Cost of equity after: [[${rate(rf)}]] + ${b2(bL1)} × [[${rate(erp)}]] = ${pct(ke1, 2)}`,
            assume
          ],
          visual: { kind: 'bars', unit: '', dp: 2, caption: 'Beta', items: [
            { label: 'Unlevered', value: bU },
            { label: `Levered at ${pct(de0, 0)} D/E`, value: bL0 },
            { label: `Levered at ${pct(de1, 0)} D/E`, value: bL1, highlight: true }
          ] },
          values: { mode: 2, betaL: bL1, betaU: bU, t, peers: [{ bL: bL0, de: de0 }], deT: de1, ke0, ke1, rf, erp }
        };
      }

      const n = mode === 'peers' ? 3 : 2;
      const peers = [];
      for (let i = 0; i < n; i++) {
        const de = r.step(0.1, 1.2, 0.05);
        const bU0 = r.step(0.6, 1.2, 0.01);
        peers.push({ name: 'ABC'[i], de, bL: Math.max(0.5, rd(Math.round(bU0 * fac(de) / 0.05) * 0.05, 2)) });
      }
      peers.forEach((pe) => { pe.f = fac(pe.de); pe.bU = rd(pe.bL / pe.f, 2); });
      const avg = rd(peers.reduce((s, pe) => s + pe.bU, 0) / n, 2);
      let deT, dv = 0;
      const steps = peers.map((pe) => `${pe.name}: [[${b2(pe.bL)}]] ÷ (1 + ${keep} × [[${pct(pe.de, 0)}]]) = [[${b2(pe.bL)}]] ÷ ${fs(pe.f)} = ${b2(pe.bU)}`);
      steps.unshift(`Unlever each peer: levered beta ÷ (1 + (1 − ${tS}) × D/E)`);
      steps.push(`Average unlevered beta: (${peers.map((pe) => b2(pe.bU)).join(' + ')}) ÷ ${n} = ${b2(avg)}`);
      if (mode === 'capital') {
        dv = r.pick([0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]);
        deT = rd(dv / (1 - dv), 3);
        steps.push(`Convert the target structure: [[${pct(dv, 0)}]] debt to capital means ${pct(dv, 0)} ÷ ${pct(1 - dv, 0)} = ${pct(deT, 1)} debt to equity`);
      } else {
        deT = r.step(0.2, 1.5, 0.05);
      }
      const fT = fac(deT);
      const bL = rd(avg * fT, 2);
      const deTS = mode === 'capital' ? pct(deT, 1) : `[[${pct(deT, 0)}]]`;
      steps.push(`Relever at the target's ${deTS}: ${b2(avg)} × (1 + ${keep} × ${deTS}) = ${b2(avg)} × ${fs(fT)} = ${b2(bL)}`);
      steps.push(assume);
      const list = peers.map((pe) => `${pe.name} [[${b2(pe.bL)}]] at [[${pct(pe.de, 0)}]]`).join(', ');
      const target = mode === 'capital' ? `The target's structure is [[${pct(dv, 0)}]] debt to total capital` : `The target runs [[${pct(deT, 0)}]] debt to equity`;
      return {
        q: `Peer levered betas and debt-to-equity ratios: ${list}. Tax rate ${tS}. ${target}. What's its relevered beta, using the peers' average unlevered beta?`,
        a: `${b2(bL)}: the peers' average unlevered beta of ${b2(avg)}, relevered at the target's ${pct(deT, mode === 'capital' ? 1 : 0)} debt to equity.`,
        why, formula,
        steps,
        visual: { kind: 'table', headers: ['', 'Levered beta', 'D/E', 'Unlevered beta'], rows: peers.map((pe) => [pe.name, `[[${b2(pe.bL)}]]`, `[[${pct(pe.de, 0)}]]`, b2(pe.bU)])
          .concat([['Average', '', '', b2(avg)], ['Target', b2(bL), deTS, b2(avg)]]) },
        values: { mode: mode === 'peers' ? 1 : 3, betaL: bL, betaU: avg, t, peers: peers.map((pe) => ({ bL: pe.bL, de: pe.de, bU: pe.bU })), deT }
      };
    },
    // Second way: the asset-beta view. A levered beta is the unlevered beta scaled by value weights, βU = βL × E ÷ (E + (1 − t) × D)
    // with debt's beta at zero; rebuild each unlevered beta that way, average, and scale back up at the target's D/E.
    check(p) {
      const v = p.values;
      const bUs = v.peers.map((pe) => pe.bL * 1 / (1 + (1 - v.t) * pe.de));
      const avg = bUs.reduce((s, x) => s + x, 0) / bUs.length;
      const lev = 1 + (1 - v.t) * v.deT;
      // Each shown beta is rounded to 0.01, and the relevering multiplies that rounding by the leverage factor.
      const tol = 0.005 * (1 + 2 * lev) + 1e-9;
      const ok = Math.abs(avg * lev - v.betaL) <= tol && Math.abs(avg - v.betaU) <= 0.0101;
      if (v.mode === 2) return ok && v.ke1 > v.ke0 && Math.abs(v.rf + v.betaL * v.erp - v.ke1) <= 5e-5 + 1e-12;
      return ok;
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

  // ---------------------------------------------------------------- MOIC and IRR
  Drills.add({
    id: 'drill-ib-moic-irr',
    track: 'ib',
    module: 'ib-lbo',
    topic: 'MOIC and IRR',
    level: 2,
    ranges: { moic: [1.2, 6], irr: [0.03, 0.6] },
    make(r) {
      const mode = r.pick(['toIrr', 'toIrr', 'toMoic', 'dividend', 'dividend']);
      const why = "MOIC counts dollars: cash back ÷ cash in, whenever it arrives. IRR is the annual compound return that turns the money in into the money out, so it rewards getting cash back sooner. With a single exit they're tied by IRR = MOIC^(1 ÷ years) − 1, which gives the rules of thumb: over five years, 2.0x is about 15%, 2.5x about 20% and 3.0x about 25%. An early payout such as a dividend recap lifts IRR without changing MOIC, and a longer hold lowers IRR for the same MOIC, which is why sponsors quote both.";
      const formula = 'MOIC = total cash returned ÷ equity invested\nIRR with a single exit = MOIC^(1 ÷ years) − 1\nRequired MOIC = (1 + target IRR)^years';
      // The growth factor is shown to four decimals and the IRR comes from it, so the working reproduces.
      const irrOf = (m, y) => rd(Math.pow(m, 1 / y), 4) - 1;

      if (mode === 'toIrr') {
        const moic = r.step(1.5, 4, 0.1);
        const years = r.pick([3, 4, 5, 5, 6, 7]);
        const root = rd(Math.pow(moic, 1 / years), 4);
        const irr = root - 1;
        const ys = [Math.max(2, years - 2), years, years + 2];
        const ms = [Math.max(1.5, moic - 0.5), moic, moic + 0.5].filter((x, i, a) => a.indexOf(x) === i);
        const short = irrOf(moic, ys[0]), long = irrOf(moic, ys[2]);
        return {
          q: `A sponsor's equity returns [[${mult(moic, 1)}]] its money in a single exit after [[${years}]] years. What's the IRR, and what would the same multiple return over ${ys[0]} or ${ys[2]} years?`,
          a: `About ${pct(irr, 1)}. The same ${mult(moic, 1)} is ${pct(short, 1)} over ${ys[0]} years but only ${pct(long, 1)} over ${ys[2]}: time dilutes a fixed multiple.`,
          why, formula,
          steps: [
            `IRR = [[${mult(moic, 1)}]]^(1/[[${years}]]) − 1 = ${num(root, 4)} − 1 = ${pct(irr, 1)}`,
            `Over ${ys[0]} years: ${num(moic, 1)}^(1/${ys[0]}) − 1 = ${pct(short, 1)}; over ${ys[2]} years: ${num(moic, 1)}^(1/${ys[2]}) − 1 = ${pct(long, 1)}`,
            `Check: ${num(root, 4)}^${years} = ${num(Math.pow(root, years), 2)}, back to about [[${mult(moic, 1)}]]`,
            'Rules of thumb over five years: 2.0x ≈ 15%, 2.5x ≈ 20%, 3.0x ≈ 25%'
          ],
          visual: { kind: 'table', headers: ['MOIC'].concat(ys.map((y) => `${y} years`)),
            rows: ms.map((m) => [m === moic ? `[[${mult(m, 1)}]]` : mult(m, 1)].concat(ys.map((y) => pct(irrOf(m, y), 1)))),
            caption: 'IRR by multiple and hold period; the question is the middle column' },
          values: { mode: 1, moic, irr, years, root }
        };
      }

      if (mode === 'toMoic') {
        let years = r.pick([3, 4, 5, 5, 6, 7]);
        const target = r.pick([0.15, 0.18, 0.2, 0.2, 0.22, 0.25, 0.3]);
        while (Math.pow(1 + target, years) > 5) years--;
        const equity = r.step(100, 2000, 10);
        const fac = rd(Math.pow(1 + target, years), 4);
        const exitEq = r1(equity * fac);
        const ys = [Math.max(2, years - 2), years, years + 2];
        return {
          q: `A sponsor invests [[${M(equity)}]] of equity and targets ${an(pct(target, 0))} [[${pct(target, 0)}]] IRR over [[${years}]] years, with everything returned at exit. What MOIC does that take, and what must the equity be worth at exit?`,
          a: `${mult(fac, 2)}: the equity must be worth about ${M(exitEq)} at exit, from ${M(equity)} invested.`,
          why, formula,
          steps: [
            `Required MOIC: (1 + [[${pct(target, 0)}]])^[[${years}]] = ${num(fac, 4)}, about ${mult(fac, 2)}`,
            `Exit equity: [[${M(equity)}]] × ${num(fac, 4)} = ${M(exitEq)}`,
            `Profit: ${M(exitEq)} − [[${M(equity)}]] = ${M(r1(exitEq - equity))}`,
            `A longer hold needs a bigger multiple for the same IRR: ${ys.filter((y) => y !== years).map((y) => `${y} years ${mult(Math.pow(1 + target, y), 2)}`).join(', ')}`
          ],
          visual: { kind: 'bars', unit: 'x', dp: 2, caption: `MOIC needed for ${an(pct(target, 0))} ${pct(target, 0)} IRR`, items: ys.map((y) => ({
            label: `${y} years`, value: rd(Math.pow(1 + target, y), 2), highlight: y === years })) },
          values: { mode: 2, moic: fac, irr: target, years, equity, exitEq }
        };
      }

      const equity = r.step(200, 2000, 10);
      const years = r.pick([4, 5, 5, 6]);
      const k = r.int(1, Math.min(3, years - 1));
      const div = Math.max(10, Math.round(equity * r.step(0.2, 0.6, 0.05) / 10) * 10);
      const exit = Math.round(equity * r.step(1.2, 3.5, 0.05) / 10) * 10;
      const moic = (div + exit) / equity;
      const cfs = [-equity];
      for (let y = 1; y <= years; y++) cfs.push((y === k ? div : 0) + (y === years ? exit : 0));
      const irr = Drills.irr(cfs);
      // The single-exit comparison works from the MOIC as shown, to two decimals.
      const single = Math.pow(rd(moic, 2), 1 / years) - 1;
      const pts = rd(rd(irr * 100, 1) - rd(single * 100, 1), 1);
      // Check the IRR by discounting at it, to two decimals.
      const q4 = rd(1 + irr, 4);
      const pvD = r1(div / Math.pow(q4, k)), pvX = r1(exit / Math.pow(q4, years));
      return {
        q: `A sponsor invests [[${M(equity)}]], takes ${an(M(div))} [[${M(div)}]] dividend recap in year [[${k}]] and sells its stake for [[${M(exit)}]] in year [[${years}]]. What are the MOIC and IRR, and how much does the dividend add to the IRR?`,
        a: `MOIC ${mult(moic, 2)} and IRR ${pct(irr, 1)}. The same ${mult(moic, 2)} paid only at exit would be ${pct(single, 1)}, so taking ${M(div)} out in year ${k} adds about ${num(pts, 1)} points of IRR without changing the MOIC.`,
        why, formula,
        steps: [
          `MOIC: ([[${M(div)}]] + [[${M(exit)}]]) ÷ [[${M(equity)}]] = ${M(div + exit)} ÷ [[${M(equity)}]] = ${mult(moic, 2)}`,
          `IRR: the rate that sets −[[${M(equity)}]] + [[${M(div)}]] ÷ (1 + r)^${k} + [[${M(exit)}]] ÷ (1 + r)^${years} to zero (Excel's IRR, or trial and error): ${pct(irr, 2)}`,
          `Check at ${pct(irr, 2)}: [[${M(div)}]] ÷ ${num(q4, 4)}^${k} + [[${M(exit)}]] ÷ ${num(q4, 4)}^${years} = ${millions(pvD, 1)} + ${millions(pvX, 1)} ≈ [[${M(equity)}]] invested`,
          `The same ${mult(moic, 2)} in one payment at year ${years}: ${num(moic, 2)}^(1/${years}) − 1 = ${pct(single, 1)}`,
          `The dividend comes back ${years - k} year${years - k > 1 ? 's' : ''} early, so it lifts IRR by about ${num(pts, 1)} points; the MOIC can't see timing`
        ],
        visual: { kind: 'bars', unit: '%', dp: 1, caption: `IRR on the same ${mult(moic, 2)}`, items: [
          { label: `Dividend in year ${k}`, value: rd(irr * 100, 1), highlight: true },
          { label: `All at exit in year ${years}`, value: rd(single * 100, 1) }
        ] },
        values: { mode: 3, moic, irr, single, years, equity, cfs }
      };
    },
    // Second way: price the cash flows at the IRR (NPV must be zero) with Drills.npv, and for the single-exit forms
    // solve the IRR numerically with Drills.irr.
    check(p) {
      const v = p.values;
      if (v.mode === 1) return Math.abs(Drills.irr([-1].concat(new Array(v.years - 1).fill(0), [v.moic])) - v.irr) <= 5e-5 + 1e-9;
      if (v.mode === 2) return Math.abs(Drills.irr([-v.equity].concat(new Array(v.years - 1).fill(0), [v.exitEq])) - v.irr) <= 1e-4;
      const npv = Drills.npv(v.irr, v.cfs);
      const back = v.cfs.slice(1).reduce((s, x) => s + x, 0);
      return Math.abs(npv) < 1e-6 * v.equity && near(back / v.equity, v.moic, 1e-9) && v.irr > v.single;
    }
  });

  // ---------------------------------------------------------------- Accretion/dilution
  // Share of the purchase price paid in new stock (s), cash on hand (c) and new debt (d).
  const FUNDING = [
    { s: 1, c: 0, d: 0, name: 'stock' }, { s: 0, c: 1, d: 0, name: 'cash' }, { s: 0, c: 0, d: 1, name: 'debt' },
    { s: 0.5, c: 0, d: 0.5, name: 'stock and debt' }, { s: 0, c: 0.5, d: 0.5, name: 'cash and debt' }, { s: 0.6, c: 0.4, d: 0, name: 'stock and cash' }
  ];
  // One draw of a deal. Every figure in the working is rounded as shown ($0.1M, 0.1M shares, cents) and later steps use it.
  function accretionCase(r) {
    const eps = r.step(2, 9, 0.01);
    const P = rd(eps * r.step(11, 24, 0.1), 2);
    const N = r.step(60, 900, 10);
    const niA = r1(eps * N);
    const f = r.pick(FUNDING);
    // Paying from cash on hand limits the size: a balance sheet rarely holds more than a modest share of market value in cash.
    const price = Math.round(P * N * (f.c ? r.step(0.05, 0.15, 0.01) : r.step(0.1, 0.45, 0.01)) / 10) * 10;
    const niT = Math.max(5, Math.round(price / r.step(10, 28, 0.5)));
    const t = r.pick([0.21, 0.25, 0.25]);
    const rDebt = r.step(0.05, 0.09, 0.0025), rCash = r.step(0.02, 0.05, 0.0025);
    const syn = r.chance(0.35) ? Math.max(5, Math.round(price * r.step(0.005, 0.02, 0.001) / 5) * 5) : 0;
    const stock = price * f.s, cash = price * f.c, debt = price * f.d;
    const newSh = r1(stock / P);
    const costC = r1(cash * rCash * (1 - t)), costD = r1(debt * rDebt * (1 - t)), synAT = r1(syn * (1 - t));
    const pfNI = r1(niA + niT + synAT - costC - costD);
    const pfN = r1(N + newSh);
    const pfEps = rd(pfNI / pfN, 2);
    const acc = pfEps / eps - 1;
    const exact = (niA + niT + syn * (1 - t) - (cash * rCash + debt * rDebt) * (1 - t)) / (N + stock / P) / eps - 1;
    // The shortcut: the target's earnings yield against the blended after-tax cost of the funding.
    const cS = rd(eps / P, 4), cC = rd(rCash * (1 - t), 4), cD = rd(rDebt * (1 - t), 4);
    const yT = rd((niT + synAT) / price, 4);
    const b = rd(f.s * cS + f.c * cC + f.d * cD, 4);
    return { eps, P, N, niA, price, niT, f, t, rDebt, rCash, syn, stock, cash, debt, newSh, costC, costD, synAT, pfNI, pfN, pfEps, acc, exact, cS, cC, cD, yT, b };
  }
  Drills.add({
    id: 'drill-ib-accretion',
    track: 'ib',
    module: 'ib-ma',
    topic: 'Accretion/dilution',
    level: 2,
    ranges: { acc: [-0.35, 0.35], pfEps: [1, 40] },
    make(r) {
      const $ = (x) => dollars(x, 2), p2 = (x) => pct(x, 2), F = (x) => millions(x, 1);
      let x, q;
      // Redraw until the verdict is clear-cut and realistic (1% to 15% either way, with the shortcut agreeing as shown) and the question fits.
      for (let k = 0; k < 200; k++) {
        x = accretionCase(r);
        const { f, rCash, rDebt } = x;
        const cashS = `cash earning [[${rate(rCash)}]]`, debtS = `new debt at [[${rate(rDebt)}]]`;
        const fund = f.s === 1 ? 'all in new stock' : f.c === 1 ? `all from ${cashS}` : f.d === 1 ? `all with ${debtS}`
          : f.s && f.d ? `[[${pct(f.s, 0)}]] in stock and [[${pct(f.d, 0)}]] with ${debtS}`
            : f.c && f.d ? `[[${pct(f.c, 0)}]] from ${cashS} and [[${pct(f.d, 0)}]] with ${debtS}`
              : `[[${pct(f.s, 0)}]] in stock and [[${pct(f.c, 0)}]] from ${cashS}`;
        q = `Acquirer: [[${$(x.P)}]] share price, [[${$(x.eps)}]] EPS, [[${num(x.N)}M]] shares. It buys a target for [[${M(x.price)}]] of equity; the target earns [[${M(x.niT)}]]. It pays ${fund}. Tax rate [[${pct(x.t, 0)}]].${x.syn ? ` Pre-tax synergies [[${M(x.syn)}]].` : ''} Accretive or dilutive, and by how much?`;
        const clear = Math.abs(x.exact) >= 0.01 && Math.abs(x.exact) <= 0.15 && Math.sign(x.acc) === Math.sign(x.exact) && x.yT !== x.b && (x.yT > x.b) === (x.acc > 0);
        if (clear && q.replace(/\[\[|\]\]/g, '').length <= 260) break;
      }
      const { eps, P, N, niA, price, niT, f, t, rDebt, rCash, syn, stock, cash, debt, newSh, costC, costD, synAT, pfNI, pfN, pfEps, acc, cS, cC, cD, yT, b } = x;
      const tS = `[[${pct(t, 0)}]]`, priceS = `[[${M(price)}]]`, epsS = `[[${$(eps)}]]`, pS = `[[${$(P)}]]`;
      const part = (w, amt) => (w < 1 ? `${M(amt)} ([[${pct(w, 0)}]] of ${priceS})` : priceS);
      const steps = [`Acquirer net income: ${epsS} × [[${num(N)}M]] = ${F(niA)}; its P/E is ${pS} ÷ ${epsS} = ${mult(P / eps, 1)}`];
      if (f.s) steps.push(`New shares: ${part(f.s, stock)} ÷ ${pS} = ${num(newSh, 1)}M`);
      if (f.c) steps.push(`Interest lost on the cash, after tax: ${part(f.c, cash)} × [[${rate(rCash)}]] × (1 − ${tS}) = ${F(costC)}`);
      if (f.d) steps.push(`Interest on the new debt, after tax: ${part(f.d, debt)} × [[${rate(rDebt)}]] × (1 − ${tS}) = ${F(costD)}`);
      if (syn) steps.push(`Synergies after tax: [[${M(syn)}]] × (1 − ${tS}) = ${F(synAT)}`);
      steps.push(`Pro forma net income: ${F(niA)} + [[${M(niT)}]]${syn ? ` + ${F(synAT)}` : ''}${f.c ? ` − ${F(costC)}` : ''}${f.d ? ` − ${F(costD)}` : ''} = ${F(pfNI)}`);
      steps.push(`Pro forma EPS: ${F(pfNI)} ÷ ${f.s ? `(${num(N)}M + ${num(newSh, 1)}M) = ${F(pfNI)} ÷ ${num(pfN, 1)}M` : `[[${num(N)}M]]`} = ${$(pfEps)}`);
      steps.push(`Against ${epsS} standalone: ${$(pfEps)} ÷ ${epsS} − 1 = ${acc < 0 ? '−' : '+'}${pct(Math.abs(acc), 1)}, so ${acc > 0 ? 'accretive' : 'dilutive'}`);
      const costs = [];
      if (f.s) costs.push(`stock ${epsS} ÷ ${pS} = ${p2(cS)}, its earnings yield`);
      if (f.c) costs.push(`cash [[${rate(rCash)}]] × (1 − ${tS}) = ${p2(cC)}`);
      if (f.d) costs.push(`debt [[${rate(rDebt)}]] × (1 − ${tS}) = ${p2(cD)}`);
      steps.push(`After-tax cost of each source: ${costs.join('; ')}`);
      const mix = [[f.s, cS], [f.c, cC], [f.d, cD]].filter(([w]) => w > 0 && w < 1).map(([w, c]) => `${pct(w, 0)} × ${p2(c)}`);
      const yText = `${syn ? `([[${M(niT)}]] + ${F(synAT)})` : `[[${M(niT)}]]`} ÷ ${priceS} = ${p2(yT)}`;
      steps.push(`Shortcut: the target yields ${yText} on the price, against ${mix.length ? `a blended ${mix.join(' + ')} = ${p2(b)}` : `the ${p2(b)} cost of ${f.name}`}. ${yT > b ? `${p2(yT)} beats ${p2(b)}, so accretive` : `${p2(b)} is more than ${p2(yT)}, so dilutive`}`);
      let pre = 0;
      if (acc < 0) {
        const need = r1(eps * pfN), gap = r1(need - pfNI);
        pre = r1(gap / (1 - t));
        steps.push(`Break-even: ${epsS} on ${num(pfN, f.s ? 1 : 0)}M shares needs ${F(need)} of net income, ${F(gap)} more, or ${F(pre)} of ${syn ? 'extra ' : ''}pre-tax synergies (${F(gap)} ÷ (1 − ${tS}))`);
      }
      const items = [{ label: syn ? 'Target yield, with synergies' : 'Target earnings yield', value: rd(yT * 100, 2), highlight: true }];
      if (f.s) items.push({ label: 'Cost of stock', value: rd(cS * 100, 2) });
      if (f.c) items.push({ label: 'Cost of cash, after tax', value: rd(cC * 100, 2) });
      if (f.d) items.push({ label: 'Cost of debt, after tax', value: rd(cD * 100, 2) });
      if (mix.length) items.push({ label: 'Blended cost of funds', value: rd(b * 100, 2) });
      return {
        q,
        a: acc > 0
          ? `Accretive: EPS rises from ${$(eps)} to ${$(pfEps)}, about ${pct(acc, 1)}. The target's ${p2(yT)} earnings yield${syn ? ' (synergies included)' : ''} beats ${f.s === 1 ? `the ${p2(b)} cost of the stock, the acquirer's own earnings yield` : `the ${p2(b)} after-tax cost of the ${f.name} used to pay for it`}.`
          : `Dilutive: EPS falls from ${$(eps)} to ${$(pfEps)}, about ${pct(-acc, 1)}. ${f.s === 1 ? `The stock costs its ${p2(b)} earnings yield` : `The funding (${f.name}) costs ${p2(b)} after tax`}, more than the target's ${p2(yT)} earnings yield${syn ? ' with synergies' : ''}; it would take about ${F(pre)} of ${syn ? 'extra ' : ''}pre-tax synergies to break even.`,
        why: "EPS rises when the earnings you buy beat what you give up to pay for them. Each source of funds has an after-tax cost per dollar: new debt costs its interest after tax, cash costs the interest it would have earned, and new stock costs the acquirer's own earnings yield (EPS ÷ share price, the inverse of its P/E), because the new shares claim earnings at that rate. If the target's earnings yield at the purchase price beats the blended cost, the deal is accretive. Accretion isn't value creation, though: cheap debt can make an overpriced deal accretive.",
        formula: 'Pro forma EPS = (acquirer NI + target NI + synergies × (1 − t) − after-tax interest cost) ÷ (acquirer shares + new shares)\nTarget earnings yield = (target NI + after-tax synergies) ÷ purchase price\nCost of stock = EPS ÷ share price; of cash or debt = interest rate × (1 − t)\nAccretive when the yield beats the blended cost',
        steps,
        visual: { kind: 'bars', unit: '%', dp: 2, caption: 'The shortcut: what the target earns on the price against what the funding costs', items },
        values: { acc, pfEps, eps, P, N, niT, price, syn, t, rDebt, rCash, s: f.s, c: f.c, d: f.d, yT, b }
      };
    },
    // Second way: the change in EPS in closed form, (target NI + after-tax synergies − after-tax funding cost − EPS × new shares)
    // ÷ pro forma shares, from the unrounded inputs; and the shortcut's verdict must match.
    check(p) {
      const v = p.values;
      const newSh = v.s * v.price / v.P;
      const dEps = (v.niT + v.syn * (1 - v.t) - v.price * (v.c * v.rCash + v.d * v.rDebt) * (1 - v.t) - v.eps * newSh) / (v.N + newSh);
      const exact = dEps / v.eps;
      return Math.abs(exact - v.acc) <= 0.005 / v.eps + 0.001 && Math.sign(exact) === Math.sign(v.acc) && (v.yT > v.b) === (v.acc > 0);
    }
  });

  // ---------------------------------------------------------------- Goodwill from a purchase price allocation
  Drills.add({
    id: 'drill-ib-goodwill',
    track: 'ib',
    module: 'ib-ma',
    topic: 'Goodwill and purchase price allocation',
    level: 3,
    ranges: { gw: [10, 40000], share: [0.05, 0.9] },
    make(r) {
      const mode = r.pick(['stock', 'stock', 'offer', 'asset']);
      // Write-ups on a grid that keeps the new DTL to $0.1M at each tax rate.
      const [t, grid] = r.pick([[0.21, 10], [0.25, 4], [0.25, 4], [0.26, 5]]);
      const BV = r.step(200, 4000, 10);
      const GW0 = r.chance(0.6) ? Math.max(10, Math.round(BV * r.step(0.1, 0.4, 0.05) / 10) * 10) : 0;
      const aim = BV * r.step(1.4, 3.5, 0.05);
      let price, offer = 0, shares = 0;
      if (mode === 'offer') {
        offer = r.step(20, 120, 0.5);
        shares = Math.max(10, Math.round(aim / offer));
        price = r1(offer * shares);
      } else {
        price = Math.round(aim / 10) * 10;
      }
      const adj = BV - GW0;
      const W = (price - adj) * r.step(0.2, 0.6, 0.05);
      const WP = Math.max(grid, Math.round(W * r.step(0.3, 0.7, 0.05) / grid) * grid);
      const WI = Math.max(grid, Math.round((W - WP) / grid) * grid);
      const Wt = WP + WI;
      const asset = mode === 'asset';
      const dtlIf = r1(Wt * t);
      const dtl = asset ? 0 : dtlIf;
      const gw = r1(price - adj - Wt + dtl);
      const alt = asset ? r1(gw + dtlIf) : r1(gw - dtlIf);
      const fv = r1(adj + Wt - dtl);
      // The target's liabilities aren't needed for goodwill; check() uses them to rebuild the consolidated balance sheet.
      const L = Math.round(BV * r.step(0.5, 2, 0.1) / 10) * 10;
      // Shared decimals for the main working; the closing what-if line uses its own.
      const dpW = Math.max(...[price, dtl, gw, fv].map(dpOf));
      const F = (x) => millions(x, dpW);
      const tS = `[[${pct(t, 0)}]]`;
      const priceRef = mode === 'offer' ? F(price) : `[[${M(price)}]]`;
      const book = GW0 ? `Target book equity [[${M(BV)}]], including [[${M(GW0)}]] of existing goodwill` : `Target book equity [[${M(BV)}]]`;
      const ups = `Write-ups: PP&E [[${M(WP)}]], new intangibles [[${M(WI)}]]`;
      let q;
      if (mode === 'offer') {
        q = `An acquirer pays [[${dollars(offer, 2)}]] for each of a target's [[${num(shares)}M]] shares. ${book}. ${ups}. Tax rate ${tS}; a stock deal, so no tax step-up. How much goodwill is created?`;
      } else {
        q = `Purchase equity value [[${M(price)}]]. ${book}. ${ups}. Tax rate ${tS}; ${asset ? 'an asset deal, so the tax basis steps up too' : 'a stock deal, so no tax step-up'}. How much goodwill is created?`;
      }
      const steps = [];
      if (mode === 'offer') steps.push(`Purchase equity value: [[${dollars(offer, 2)}]] × [[${num(shares)}M]] = ${F(price)}`);
      steps.push(GW0 ? `Net assets at book, without the old goodwill: [[${M(BV)}]] − [[${M(GW0)}]] = ${M(adj)}. The old goodwill is written off; new goodwill replaces it` : `Net assets at book: [[${M(BV)}]], with no old goodwill to write off`);
      steps.push(`Write-ups: [[${M(WP)}]] + [[${M(WI)}]] = ${M(Wt)}`);
      steps.push(asset
        ? 'No new deferred tax liability: in an asset deal the tax basis steps up along with the book values'
        : `New deferred tax liability: ${M(Wt)} × ${tS} = ${F(dtl)}. Book values step up but the tax basis doesn't, so book depreciation and amortization will exceed the tax deductions`);
      steps.push(`Goodwill: ${priceRef} − ${M(adj)} − ${M(Wt)}${asset ? '' : ` + ${F(dtl)}`} = ${F(gw)}, ${pct(gw / price, 0)} of the price`);
      steps.push(`Check: net identifiable assets at fair value are ${M(adj)} + ${M(Wt)}${asset ? '' : ` − ${F(dtl)}`} = ${F(fv)}; add ${F(gw)} of goodwill and you're back to the ${F(price)} price`);
      steps.push(asset
        ? `In a stock deal the write-ups would create ${an(M(dtlIf))} ${M(dtlIf)} DTL and goodwill would be ${M(alt)}`
        : `In an asset deal (or with a 338(h)(10) election) there'd be no DTL: goodwill would be ${M(alt)}, and deductible for tax over 15 years`);
      const wf = [{ label: 'Book equity', delta: -BV }];
      if (GW0) wf.push({ label: 'Old goodwill written off', delta: GW0 });
      wf.push({ label: 'PP&E write-up', delta: -WP }, { label: 'New intangibles', delta: -WI });
      if (!asset) wf.push({ label: 'New DTL', delta: dtl });
      return {
        q,
        a: asset
          ? `${F(gw)}: the ${F(price)} price less ${M(adj)} of book value${GW0 ? ' (after writing off the old goodwill)' : ''} and ${M(Wt)} of write-ups. The tax basis steps up too, so there's no new deferred tax liability to add back.`
          : `${F(gw)}: the ${F(price)} price less ${M(adj)} of book value${GW0 ? ' (after writing off the old goodwill)' : ''} and ${M(Wt)} of write-ups, plus the ${F(dtl)} deferred tax liability the write-ups create.`,
        why: "Goodwill is the part of the price you can't pin to identifiable assets. Start from the purchase equity value and subtract the target's net assets at fair value: book equity with its old goodwill removed (it's written off and replaced), plus the write-ups to PP&E and newly recognized intangibles such as customer relationships. In a stock deal the tax basis doesn't step up, so the write-ups create a deferred tax liability; that liability reduces net assets, so it adds to goodwill. Under US GAAP goodwill isn't amortized; it's tested for impairment.",
        formula: 'Goodwill = purchase equity value − (book equity − existing goodwill) − write-ups + new DTL\nNew DTL = write-ups × tax rate in a stock deal; none in an asset deal or 338(h)(10) election\nFair value of net assets + goodwill = purchase equity value',
        steps,
        visual: { kind: 'waterfall', unit: '$M', dp: dpW, start: { label: 'Purchase equity value', value: price }, steps: wf, end: { label: 'Goodwill', value: gw } },
        values: { gw, share: gw / price, price, BV, GW0, WP, WI, dtl, t, L, asset: asset ? 1 : 0, alt }
      };
    },
    // Second way: consolidate. The acquirer records the target's assets at fair value (book assets without the old goodwill,
    // plus write-ups) and the new goodwill; against them sit the target's liabilities, the new DTL and the price paid.
    check(p) {
      const v = p.values;
      const assets = (v.BV + v.L - v.GW0) + v.WP + v.WI + v.gw;
      const claims = v.L + v.dtl + v.price;
      const dtlOk = v.asset ? v.dtl === 0 && near(v.alt - v.gw, v.t * (v.WP + v.WI), 1e-9) : near(v.dtl, v.t * (v.WP + v.WI), 1e-9) && near(v.gw - v.alt, v.dtl, 1e-9);
      return Math.abs(assets - claims) < 1e-6 && dtlOk && v.gw > 0;
    }
  });

  // ---------------------------------------------------------------- Working-capital days and the cash conversion cycle
  Drills.add({
    id: 'drill-ib-wc-days',
    track: 'ib',
    module: 'ib-ratios',
    topic: 'Working-capital days',
    level: 2,
    ranges: { ccc: [-40, 220], dso: [10, 120] },
    make(r) {
      const mode = r.pick(['days', 'days', 'free', 'project']);
      const rev = r.step(200, 8000, 10);
      const cogs = Math.round(rev * r.step(0.45, 0.8, 0.01));
      const ar = Math.max(1, Math.round(rev * r.step(25, 80, 0.1) / 365));
      const inv = Math.max(1, Math.round(cogs * r.step(20, 120, 0.1) / 365));
      const ap = Math.max(1, Math.round(cogs * r.step(20, 75, 0.1) / 365));
      // Days to one decimal; the cycle adds up the days as shown.
      const dso = rd(ar / rev * 365, 1), dio = rd(inv / cogs * 365, 1), dpo = rd(ap / cogs * 365, 1);
      const ccc = rd(dso + dio - dpo, 1);
      const d1 = (x) => `${num(x, 1)} days`;
      const F = (x) => millions(x, 1);
      const revS = `[[${M(rev)}]]`, cogsS = `[[${M(cogs)}]]`, arS = `[[${M(ar)}]]`, invS = `[[${M(inv)}]]`, apS = `[[${M(ap)}]]`;
      const why = "The cash conversion cycle counts the days between paying suppliers and collecting from customers. Inventory sits for DIO days and receivables take DSO days to collect, while payables let the company hold its suppliers' cash for DPO days. Each day in the cycle ties up about a day of sales or COGS in working capital, so shortening it releases cash once, and a growing business with a long cycle keeps absorbing cash. DSO is measured against revenue; DIO and DPO against COGS, because inventory and payables are carried at cost. Practice varies: some use average balances or a 360-day year.";
      const formula = 'DSO = receivables ÷ revenue × 365\nDIO = inventory ÷ COGS × 365; DPO = payables ÷ COGS × 365\nCash conversion cycle = DSO + DIO − DPO\nCash freed by cutting DSO = revenue ÷ 365 × days cut';
      const daySteps = [
        `DSO: ${arS} ÷ ${revS} × 365 = ${d1(dso)}`,
        `DIO: ${invS} ÷ ${cogsS} × 365 = ${d1(dio)}`,
        `DPO: ${apS} ÷ ${cogsS} × 365 = ${d1(dpo)}`,
        `Cash conversion cycle: ${num(dso, 1)} + ${num(dio, 1)} − ${num(dpo, 1)} = ${d1(ccc)}`
      ];
      const read = ccc > 0
        ? `cash is tied up for about ${num(ccc, 0)} days between paying suppliers and collecting from customers`
        : 'suppliers fund the business: it collects from customers before it pays for what it sold';
      const dayViz = { kind: 'waterfall', unit: 'days', dp: 1, start: { label: 'DSO', value: dso },
        steps: [{ label: 'DIO', delta: dio }, { label: 'DPO', delta: -dpo }], end: { label: 'Cash conversion cycle', value: ccc } };
      const given = `Revenue ${revS}, COGS ${cogsS}; year-end receivables ${arS}, inventory ${invS} and payables ${apS}.`;

      if (mode === 'free') {
        const T = Math.max(15, Math.floor(dso) - r.int(4, 15));
        const newAR = r1(rev * T / 365);
        const freed = r1(ar - newAR);
        const ccc2 = rd(T + dio - dpo, 1);
        return {
          q: `${given} What's the cash conversion cycle, and how much cash is freed if DSO falls to [[${T}]] days?`,
          a: `The cycle is ${d1(ccc)}. Cutting DSO to ${T} days frees about ${F(freed)} of cash, once, and shortens the cycle to ${d1(ccc2)}.`,
          why, formula,
          steps: daySteps.concat([
            `Receivables at [[${T}]] days: ${revS} × [[${T}]] ÷ 365 = ${F(newAR)}`,
            `Cash freed: ${arS} − ${F(newAR)} = ${F(freed)}. It's a one-time release as receivables shrink, not a yearly saving`,
            `New cycle: [[${T}]] + ${num(dio, 1)} − ${num(dpo, 1)} = ${d1(ccc2)}`
          ]),
          visual: dayViz,
          values: { mode: 2, ccc, dso, dio, dpo, rev, cogs, ar, inv, ap, T, freed }
        };
      }

      if (mode === 'project') {
        const R1 = Math.round(rev * (1 + r.step(0.03, 0.15, 0.01)) / 10) * 10;
        const C1 = Math.round(R1 * cogs / rev);
        // Plans usually move the days a little, often toward faster collection and slower payment.
        const s1 = Math.max(15, Math.round(dso) + r.int(-6, 4)), i1 = Math.max(10, Math.round(dio) + r.int(-8, 6)), p1 = Math.max(15, Math.round(dpo) + r.int(-4, 8));
        const AR1 = r1(R1 * s1 / 365), INV1 = r1(C1 * i1 / 365), AP1 = r1(C1 * p1 / 365);
        const NWC0 = ar + inv - ap, NWC1 = r1(AR1 + INV1 - AP1), dN = r1(NWC1 - NWC0);
        const up = dN > 0;
        return {
          q: `This year-end: receivables ${arS}, inventory ${invS}, payables ${apS}. Next year's plan: revenue [[${M(R1)}]], COGS [[${M(C1)}]], DSO [[${s1}]], DIO [[${i1}]] and DPO [[${p1}]] days. What's next year's net working capital, and how does its change hit free cash flow?`,
          a: `${F(NWC1)}, ${up ? 'up' : 'down'} ${F(Math.abs(dN))} from ${M(NWC0)}. The ${up ? 'increase is a use of cash that comes off' : 'decrease releases cash into'} next year's free cash flow.`,
          why, formula,
          steps: [
            `Receivables: [[${M(R1)}]] × [[${s1}]] ÷ 365 = ${F(AR1)}`,
            `Inventory: [[${M(C1)}]] × [[${i1}]] ÷ 365 = ${F(INV1)}`,
            `Payables: [[${M(C1)}]] × [[${p1}]] ÷ 365 = ${F(AP1)}`,
            `Net working capital: ${F(AR1)} + ${F(INV1)} − ${F(AP1)} = ${F(NWC1)}, against ${arS} + ${invS} − ${apS} = ${M(NWC0)} this year`,
            `Change: ${F(NWC1)} − ${M(NWC0)} = ${up ? '+' : '−'}${F(Math.abs(dN))}, ${up ? 'an increase that reduces' : 'a decrease that adds to'} free cash flow by the same amount`,
            `Next year's cycle: ${s1} + ${i1} − ${p1} = ${s1 + i1 - p1} days`
          ],
          visual: { kind: 'waterfall', unit: '$M', dp: 1, start: { label: 'Receivables', value: AR1 },
            steps: [{ label: 'Inventory', delta: INV1 }, { label: 'Payables', delta: -AP1 }], end: { label: 'Net working capital', value: NWC1 },
            caption: `Against ${M(NWC0)} this year` },
          values: { mode: 3, ccc: s1 + i1 - p1, dso: s1, R1, C1, s1, i1, p1, NWC0, NWC1, dN }
        };
      }

      const perDay = r1(rev / 365);
      return {
        q: `${given} What are DSO, DIO, DPO and the cash conversion cycle?`,
        a: `DSO ${d1(dso)}, DIO ${d1(dio)} and DPO ${d1(dpo)}, so the cash conversion cycle is ${d1(ccc)}: ${read}.`,
        why, formula,
        steps: daySteps.concat([`Scale: a day of sales is ${revS} ÷ 365 = ${F(perDay)}, so each day cut from DSO frees about that much cash, once`]),
        visual: dayViz,
        values: { mode: 1, ccc, dso, dio, dpo, rev, cogs, ar, inv, ap }
      };
    },
    // Second way: go back from days to balances. Days × daily revenue (or COGS) must rebuild each balance to within the
    // rounding of the days, and the projected change must match the balances built from unrounded figures.
    check(p) {
      const v = p.values;
      if (v.mode === 3) {
        const exact = v.R1 * v.s1 / 365 + v.C1 * (v.i1 - v.p1) / 365 - v.NWC0;
        return Math.abs(exact - v.dN) <= 0.2 && near(v.ccc, v.s1 + v.i1 - v.p1, 1e-9);
      }
      const back = (days, base, bal) => Math.abs(days * base / 365 - bal) <= 0.05 * base / 365 + 1e-9;
      const ok = back(v.dso, v.rev, v.ar) && back(v.dio, v.cogs, v.inv) && back(v.dpo, v.cogs, v.ap) &&
        Math.abs(v.ccc - (v.ar / v.rev + (v.inv - v.ap) / v.cogs) * 365) <= 0.15 + 1e-9;
      return v.mode === 1 ? ok : ok && Math.abs((v.ar / v.rev * 365 - v.T) * v.rev / 365 - v.freed) <= 0.05 + 1e-9;
    }
  });

  // ---------------------------------------------------------------- Leverage and coverage
  Drills.add({
    id: 'drill-ib-leverage',
    track: 'ib',
    module: 'ib-ratios',
    topic: 'Leverage and coverage',
    level: 2,
    ranges: { lev: [0.8, 8], ebitda: [50, 5000] },
    make(r) {
      const mode = r.pick(['ratios', 'ratios', 'headroom', 'headroom']);
      const ebitda = r.step(80, 2000, 5);
      const cash = Math.max(5, Math.round(ebitda * r.step(0.1, 0.6, 0.05) / 5) * 5);
      const eS = `[[${M(ebitda)}]]`, cS = `[[${M(cash)}]]`;
      const why = "Leverage ratios ask how many years of EBITDA the debt represents; net leverage credits the cash that could repay part of it. Coverage ratios ask how comfortably earnings pay the interest. EBITDA ignores capex, which is a real cash need, so (EBITDA − capex) ÷ interest is the tougher test for capital-heavy businesses. Credit agreements turn these ratios into covenants, and the headroom (how far EBITDA can fall before a breach) is what lenders and borrowers watch. Covenants test EBITDA as the agreement defines it, often with add-backs, so read the definitions.";

      if (mode === 'ratios') {
        const debt = Math.round(ebitda * r.step(2, 6.5, 0.1) / 10) * 10;
        const tl = Math.max(10, Math.round(debt * r.step(0.5, 0.75, 0.05) / 10) * 10);
        const notes = debt - tl;
        const rTL = r.step(0.065, 0.095, 0.0025), rN = r.step(0.055, 0.1, 0.0025);
        const iTL = r1(tl * rTL), iN = r1(notes * rN), interest = r1(iTL + iN);
        const capex = Math.round(ebitda * r.step(0.1, 0.35, 0.01));
        const nd = debt - cash;
        const total = debt / ebitda, net = nd / ebitda, cov = ebitda / interest, cov2 = (ebitda - capex) / interest;
        const F = (x) => millions(x, 1);
        return {
          q: `EBITDA ${eS}, capex [[${M(capex)}]], cash ${cS}. Debt: ${an(M(tl))} [[${M(tl)}]] term loan at [[${rate(rTL)}]] and [[${M(notes)}]] of notes at [[${rate(rN)}]]. What are total and net leverage, EBITDA ÷ interest and (EBITDA − capex) ÷ interest?`,
          a: `Total leverage ${mult(total, 1)} and net leverage ${mult(net, 1)}; EBITDA covers interest ${mult(cov, 1)}, and ${mult(cov2, 1)} after capex.`,
          why,
          formula: 'Total leverage = total debt ÷ EBITDA; net leverage = (debt − cash) ÷ EBITDA\nInterest coverage = EBITDA ÷ interest expense\n(EBITDA − capex) ÷ interest: coverage after the capex the business needs',
          steps: [
            `Total debt: [[${M(tl)}]] + [[${M(notes)}]] = ${M(debt)}; interest: [[${M(tl)}]] × [[${rate(rTL)}]] + [[${M(notes)}]] × [[${rate(rN)}]] = ${F(iTL)} + ${F(iN)} = ${F(interest)}`,
            `Total leverage: ${M(debt)} ÷ ${eS} = ${mult(total, 1)}`,
            `Net leverage: (${M(debt)} − ${cS}) ÷ ${eS} = ${M(nd)} ÷ ${eS} = ${mult(net, 1)}`,
            `Interest coverage: ${eS} ÷ ${F(interest)} = ${mult(cov, 1)}`,
            `After capex: (${eS} − [[${M(capex)}]]) ÷ ${F(interest)} = ${M(ebitda - capex)} ÷ ${F(interest)} = ${mult(cov2, 1)}`
          ],
          visual: { kind: 'table', headers: ['Metric', 'Formula', 'Result'], rows: [
            ['Total leverage', 'Debt ÷ EBITDA', mult(total, 1)],
            ['Net leverage', '(Debt − cash) ÷ EBITDA', mult(net, 1)],
            ['Interest coverage', 'EBITDA ÷ interest', mult(cov, 1)],
            ['After capex', '(EBITDA − capex) ÷ interest', mult(cov2, 1)]
          ] },
          values: { mode: 1, lev: total, ebitda, debt, cash, tl, notes, rTL, rN, interest, capex, total, net, cov, cov2 }
        };
      }

      const netTest = r.chance(0.6);
      const cap = r.pick([4, 4.5, 5, 5, 5.5, 6, 6.5]);
      // Debt sized so leverage sits 5–40% inside the covenant.
      const debt0 = Math.round((cap * r.step(0.6, 0.95, 0.01) * ebitda + (netTest ? cash : 0)) / 10) * 10;
      const tested = netTest ? debt0 - cash : debt0;
      const lev = tested / ebitda;
      const floor = r1(tested / cap);
      const cushion = 1 - floor / ebitda;
      const room = r1(cap * ebitda - tested);
      const name = netTest ? 'net leverage' : 'total leverage';
      const Name = netTest ? 'Net leverage' : 'Total leverage';
      const x2 = (x) => mult(x, 2);
      const F = (x) => millions(x, 1);
      const steps = [];
      if (netTest) steps.push(`Net debt: [[${M(debt0)}]] − ${cS} = ${M(tested)}`);
      steps.push(`${Name}: ${netTest ? M(tested) : `[[${M(debt0)}]]`} ÷ ${eS} = ${x2(lev)}, against the [[${x2(cap)}]] cap`);
      steps.push(`EBITDA at the cap: ${netTest ? M(tested) : `[[${M(debt0)}]]`} ÷ [[${x2(cap)}]] = ${F(floor)}`);
      steps.push(`Cushion: 1 − ${F(floor)} ÷ ${eS} = ${pct(cushion, 1)}, or ${F(r1(ebitda - floor))} of EBITDA`);
      steps.push(`Debt capacity at today's EBITDA: [[${x2(cap)}]] × ${eS} − ${netTest ? M(tested) : `[[${M(debt0)}]]`} = ${F(room)}${netTest ? ' of net debt' : ''}`);
      steps.push('Covenants test EBITDA as the credit agreement defines it, often with add-backs, and usually on the last four quarters');
      return {
        q: `EBITDA ${eS}, total debt [[${M(debt0)}]], cash ${cS}. The credit agreement caps ${name} at [[${x2(cap)}]]. What's ${name} today, how far can EBITDA fall before a breach, and how much more debt could the company take on?`,
        a: `${Name} is ${x2(lev)} against the ${x2(cap)} cap. EBITDA can fall about ${pct(cushion, 1)} (${F(r1(ebitda - floor))}) before a breach, or the company could add about ${M(room)} of debt at today's EBITDA.`,
        why,
        formula: `${Name} = ${netTest ? '(debt − cash)' : 'total debt'} ÷ EBITDA\nEBITDA at the cap = ${netTest ? 'net debt' : 'debt'} ÷ covenant multiple\nCushion = 1 − EBITDA at the cap ÷ EBITDA today\nDebt capacity = covenant multiple × EBITDA − ${netTest ? 'net debt' : 'debt'}`,
        steps,
        visual: { kind: 'bars', unit: '$M', dp: 1, caption: `The cap bites when EBITDA falls to ${F(floor)}`, items: [
          { label: 'EBITDA today', value: ebitda },
          { label: `EBITDA at ${x2(cap)}`, value: floor, highlight: true }
        ] },
        values: { mode: 2, lev, ebitda, tested, cap, floor, cushion, room }
      };
    },
    // Second way: rebuild each ratio's numerator from the answer (leverage × EBITDA = debt, coverage × interest = EBITDA)
    // and, for the covenant, test leverage at the stressed EBITDA: it must land on the cap.
    check(p) {
      const v = p.values;
      if (v.mode === 1) {
        const interest = v.tl * v.rTL + v.notes * v.rN;
        return near(v.total * v.ebitda, v.debt, 1e-9) && near(v.net * v.ebitda, v.debt - v.cash, 1e-9) &&
          Math.abs(v.cov * v.interest - v.ebitda) < 1e-6 && Math.abs(interest - v.interest) <= 0.1 + 1e-9 && v.cov2 < v.cov;
      }
      const stressed = v.ebitda * (1 - v.cushion);
      return Math.abs(v.tested / stressed - v.cap) <= v.cap * 0.05 / stressed + 1e-9 && Math.abs(v.room + v.tested - v.cap * v.ebitda) <= 0.05 + 1e-9 && v.lev < v.cap;
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
      q: (A) => `The company sells equipment with ${an(A.bookS)} [[${A.bookS}]] book value for [[${A.proceedsS}]] in cash`,
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
