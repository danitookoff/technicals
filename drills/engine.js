/* Technicals: drill engine.
   Drills.add({ id, track, module, topic, level, make(rng), check(problem), ranges? })
   make(rng) returns { q, a, why, formula, steps, visual?, values } built from seeded random inputs.
   check(problem) re-derives the answer a different way and returns true when it agrees.
   ranges maps names in problem.values to [min, max]; tools/validate.js enforces them. */
(function (root) {
  'use strict';

  const list = [];
  const byId = Object.create(null);
  const problems = [];

  function add(def) {
    if (!def || typeof def.id !== 'string' || typeof def.make !== 'function' || typeof def.check !== 'function') {
      problems.push('Drill needs an id, make() and check(): ' + (def && def.id));
      return;
    }
    if (byId[def.id]) { problems.push('Duplicate drill ' + def.id); return; }
    list.push(def);
    byId[def.id] = def;
  }

  // mulberry32. Same seed, same numbers, so a flagged drill can be reproduced.
  function rng(seed) {
    let a = seed >>> 0;
    function next() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    const r = {
      seed: seed >>> 0,
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      // A value on a grid from lo to hi, inclusive: step(0.05, 0.075, 0.0025) gives 5.00%, 5.25%, ... 7.50%.
      step: (lo, hi, step) => round(lo + r.int(0, Math.round((hi - lo) / step)) * step, 10),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      chance: (p) => next() < p,
      shuffle: (arr) => {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
      }
    };
    return r;
  }

  // Half-up rounding that survives binary floats (1.005 → 1.01).
  function round(x, dp) {
    dp = dp || 0;
    const ax = Math.abs(x);
    if (!isFinite(x) || ax >= 1e15) return x;
    if (ax < 1e-9) return 0;
    const s = String(ax);
    // Tiny values print in exponent form (7.45e-9), which the string trick can't shift.
    const r = s.includes('e') ? Math.round(ax * Math.pow(10, dp)) / Math.pow(10, dp) : Number(Math.round(Number(s + 'e' + dp)) + 'e-' + dp);
    return x < 0 ? -r : r;
  }

  // The article before a figure follows how it's spoken: "an 8.5% cap rate", "an $11.2M loan",
  // "a $180K fee". Words fall back to a vowel test.
  function an(text) {
    const t = String(text).replace(/\[\[|\]\]/g, '').trim();
    if (/^[$€£]?\d/.test(t)) {
      const whole = t.replace(/^[$€£]/, '').replace(/,/g, '').split('.')[0].replace(/\D.*$/, '');
      return /^8/.test(whole) || /^1[18](\d{3})*$/.test(whole) ? 'an' : 'a';
    }
    return /^[aeiou]/i.test(t) && !/^(uni|use|usu|one|eu)/i.test(t) ? 'an' : 'a';
  }

  const MINUS = '−';

  function num(x, dp) {
    dp = dp || 0;
    const r = round(x, dp);
    const s = Math.abs(r).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
    return (r < 0 ? MINUS : '') + s;
  }

  // Dollars scaled the way a memo would write them: $850K, $4.45M, $19.5M, $142M, $1.25B.
  // dp fixes the decimals for $M and $B amounts; smaller amounts use K or whole dollars.
  function money(x, dp) {
    const neg = x < 0;
    const a = Math.abs(x);
    // [show from, divide by, suffix]. Amounts under $10K stay in whole dollars ($9,450).
    const scales = [[1e9, 1e9, 'B'], [1e6, 1e6, 'M'], [1e4, 1e3, 'K'], [0, 1, '']];
    let i = scales.findIndex(([from]) => a >= from);
    const pickDp = (v, suffix) => {
      if (suffix === 'M' || suffix === 'B') return dp != null ? dp : v < 10 ? 2 : v < 100 ? 1 : 0;
      return suffix === 'K' && v < 100 ? 1 : 0;
    };
    // Pick decimals from the rounded value, so 9.999 shows as 10.0 rather than 10.00.
    const decimals = (v, suffix) => pickDp(round(v, pickDp(v, suffix)), suffix);
    let [, div, suffix] = scales[i];
    let v = a / div;
    let d = decimals(v, suffix);
    // Rounding can carry into the next unit: $999.6K → $1.00M.
    if (i > 0 && suffix !== '' && round(v, d) >= 1000) {
      [, div, suffix] = scales[i - 1];
      v = a / div;
      d = decimals(v, suffix);
    }
    return (neg ? MINUS : '') + '$' + num(v, d) + suffix;
  }

  const dollars = (x, dp) => (x < 0 ? MINUS : '') + '$' + num(Math.abs(x), dp || 0);
  // x already in millions: 9230 → "$9,230M" (banker style).
  const millions = (x, dp) => (x < 0 ? MINUS : '') + '$' + num(Math.abs(x), dp || 0) + 'M';
  // x in dollars, always shown in millions: 520000 → "$0.52M".
  const inM = (x, dp) => millions(x / 1e6, dp == null ? 2 : dp);

  // 0.065 → "6.5%", 0.0625 → "6.25%". Pass dp to force precision.
  function pct(x, dp) {
    const v = x * 100;
    if (dp == null) dp = Math.abs(v - round(v, 1)) < 1e-9 ? 1 : 2;
    return num(v, dp) + '%';
  }

  const mult = (x, dp) => num(x, dp == null ? 1 : dp) + 'x';
  const bps = (x) => num(x * 10000, 0) + ' bps';
  const signed = (x, dp) => (round(x, dp || 0) > 0 ? '+' : '') + num(x, dp || 0);

  function npv(rate, cfs) {
    let s = 0;
    for (let t = 0; t < cfs.length; t++) s += cfs[t] / Math.pow(1 + rate, t);
    return s;
  }

  // Bisection with bracketing. cfs[0] is time 0; one period per entry.
  function irr(cfs) {
    let lo = -0.99, hi = 1;
    let flo = npv(lo, cfs), fhi = npv(hi, cfs);
    for (let k = 0; flo * fhi > 0 && k < 40; k++) { hi = hi * 2 + 1; fhi = npv(hi, cfs); }
    if (!(flo * fhi <= 0)) return NaN;
    for (let k = 0; k < 300; k++) {
      const mid = (lo + hi) / 2;
      const fm = npv(mid, cfs);
      if (fm === 0 || (hi - lo) / 2 < 1e-12) return mid;
      if (fm * flo > 0) { lo = mid; flo = fm; } else { hi = mid; }
    }
    return (lo + hi) / 2;
  }

  // Annual debt service per $1 of loan with monthly payments.
  function constant(annualRate, years) {
    const i = annualRate / 12, n = years * 12;
    return 12 * i / (1 - Math.pow(1 + i, -n));
  }

  // Relative closeness, for check().
  const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-9) * Math.max(1, Math.abs(a), Math.abs(b));

  function run(id, seed) {
    const def = byId[id];
    if (!def) throw new Error('Unknown drill ' + id);
    const p = def.make(rng(seed));
    p.id = id;
    p.seed = seed >>> 0;
    return p;
  }

  root.Drills = {
    list,
    byId,
    problems,
    add,
    get: (id) => byId[id],
    run,
    rng,
    round,
    near,
    npv,
    irr,
    constant,
    fmt: { num, money, dollars, millions, inM, pct, mult, bps, signed, an }
  };
})(typeof window !== 'undefined' ? window : globalThis);
