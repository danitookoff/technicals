/* Technicals: card visuals, drawn with plain HTML and CSS.
   Visuals.render(spec) returns a <figure>. Kinds: table, flow, bars, stack, waterfall, threeStatement. */
(function (root) {
  'use strict';

  const MINUS = '−';
  const { markup } = root.Deck;

  function h(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  const decimals = (x) => {
    const s = String(Math.abs(x));
    return s.includes('.') && !s.includes('e') ? s.split('.')[1].length : 0;
  };
  const autoDp = (values) => Math.min(2, Math.max(0, ...values.map(decimals)));

  function value(v, unit, dp, signed) {
    const s = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
    const sign = v < 0 ? MINUS : signed && v > 0 ? '+' : '';
    if (!unit) return sign + s;
    if (unit[0] === '$') return sign + '$' + s + unit.slice(1);
    if (unit === '%' || unit === 'x') return sign + s + unit;
    return sign + s + ' ' + unit;
  }

  // Right-align cells that read as figures.
  const numeric = (text) => /^[−\-+(]?\$?[\d.,]+(%|x|[KMB])?\)?$/.test(root.Deck.plain(String(text)).trim());

  function table(v) {
    const wrap = h('div', 'viz-scroll');
    const t = h('table', 'viz-table');
    const head = h('thead');
    const hr = h('tr');
    v.headers.forEach((x) => { const th = h('th', null, markup(x)); th.scope = 'col'; hr.append(th); });
    head.append(hr);
    const body = h('tbody');
    const rowHeads = v.headers[0] === '';
    v.rows.forEach((row) => {
      const tr = h('tr');
      row.forEach((cell, i) => {
        const td = h(i === 0 && rowHeads ? 'th' : 'td', numeric(cell) ? 'num' : null, markup(cell));
        if (i === 0 && rowHeads) td.scope = 'row';
        tr.append(td);
      });
      body.append(tr);
    });
    t.append(head, body);
    wrap.append(t);
    return wrap;
  }

  function flow(v) {
    const ol = h('ol', 'viz-flow');
    v.steps.forEach((s) => {
      const li = h('li');
      const step = typeof s === 'string' ? { label: s } : s;
      li.append(h('span', 'flow-label', markup(step.label)));
      if (step.note) li.append(h('span', 'flow-note', markup(step.note)));
      ol.append(li);
    });
    return ol;
  }

  function bars(v) {
    const box = h('div', 'viz-bars');
    const dp = v.dp != null ? v.dp : autoDp(v.items.map((i) => i.value));
    const max = Math.max(...v.items.map((i) => Math.abs(i.value))) || 1;
    v.items.forEach((it) => {
      const row = h('div', 'bar-row' + (it.highlight ? ' is-hi' : '') + (it.value < 0 ? ' is-neg' : ''));
      const track = h('span', 'bar-track');
      const fill = h('span', 'bar-fill');
      fill.style.width = (100 * Math.abs(it.value) / max).toFixed(2) + '%';
      track.append(fill);
      row.append(h('span', 'bar-label', markup(it.label)), track, h('span', 'bar-value', value(it.value, v.unit, dp)));
      box.append(row);
    });
    return box;
  }

  function stack(v) {
    const cols = v.columns || [{ title: '', items: v.items }];
    const all = cols.flatMap((c) => c.items.map((i) => i.value));
    const dp = v.dp != null ? v.dp : autoDp(all);
    const box = h('div', 'viz-stack');
    box.style.setProperty('--cols', cols.length);
    cols.forEach((col) => {
      const c = h('div', 'stack-col');
      if (col.title) c.append(h('div', 'stack-title', markup(col.title)));
      const body = h('div', 'stack-body');
      col.items.forEach((it) => {
        const b = h('div', 'stack-block' + (it.highlight ? ' is-hi' : ''));
        b.style.flexGrow = Math.max(it.value, 0.0001);
        b.append(h('span', 'stack-label', markup(it.label)), h('span', 'stack-value', value(it.value, v.unit, dp)));
        body.append(b);
      });
      c.append(body);
      const total = col.items.reduce((s, i) => s + i.value, 0);
      c.append(h('div', 'stack-total', 'Total ' + value(total, v.unit, dp)));
      box.append(c);
    });
    return box;
  }

  function waterfall(v) {
    const rows = [];
    let run = v.start.value;
    rows.push({ label: v.start.label, from: 0, to: run, kind: 'total', shown: run });
    v.steps.forEach((s) => {
      if (s.subtotal) { rows.push({ label: s.label, from: 0, to: run, kind: 'total sub', shown: run }); return; }
      rows.push({ label: s.label, from: run, to: run + s.delta, kind: s.delta >= 0 ? 'up' : 'down', shown: s.delta, signed: true });
      run += s.delta;
    });
    const end = v.end.value != null ? v.end.value : run;
    rows.push({ label: v.end.label, from: 0, to: end, kind: 'total', shown: end });

    const dp = v.dp != null ? v.dp : autoDp(rows.map((r) => r.shown));
    const lo = Math.min(0, ...rows.map((r) => Math.min(r.from, r.to)));
    const hi = Math.max(...rows.map((r) => Math.max(r.from, r.to)));
    const span = hi - lo || 1;
    const box = h('div', 'viz-wf');
    rows.forEach((r) => {
      const row = h('div', 'wf-row wf-' + r.kind.split(' ').join(' wf-'));
      const track = h('span', 'wf-track');
      const bar = h('span', 'wf-bar');
      bar.style.left = (100 * (Math.min(r.from, r.to) - lo) / span).toFixed(2) + '%';
      bar.style.width = (100 * Math.abs(r.to - r.from) / span).toFixed(2) + '%';
      track.append(bar);
      row.append(h('span', 'wf-label', markup(r.label)), track, h('span', 'wf-value', value(r.shown, v.unit, dp, r.signed)));
      box.append(row);
    });
    return box;
  }

  function threeStatement(v) {
    const all = [].concat(v.is, v.cfs, v.bs.assets, v.bs.le).map((l) => l.value);
    const dp = v.dp != null ? v.dp : autoDp(all);
    const fmt = (x) => value(x, v.unit === '$' ? '' : v.unit, dp, true);
    const lines = (arr) => {
      if (!arr.length) return [h('div', 's3-none', 'No change')];
      return arr.map((l) => {
        const r = h('div', 's3-row' + (l.total ? ' is-total' : ''));
        r.append(h('span', 's3-label', markup(l.label)), h('span', 's3-value', fmt(l.value)));
        return r;
      });
    };
    const section = (title, parts) => {
      const s = h('section', 's3');
      s.append(h('h4', null, title), ...parts);
      return s;
    };
    const sum = (arr) => arr.reduce((t, l) => t + l.value, 0);
    const total = (label, x) => {
      const r = h('div', 's3-row is-total');
      r.append(h('span', 's3-label', label), h('span', 's3-value', fmt(x)));
      return r;
    };
    const assets = sum(v.bs.assets), le = sum(v.bs.le);
    const balanced = Math.abs(assets - le) < 1e-6;
    const grid = h('div', 's3-grid');
    grid.append(
      section('Income statement', lines(v.is)),
      section('Cash flow statement', lines(v.cfs)),
      section('Balance sheet', [
        h('div', 's3-sub', 'Assets'), ...lines(v.bs.assets), total('Total assets', assets),
        h('div', 's3-sub', 'Liabilities and equity'), ...lines(v.bs.le), total('Total liabilities and equity', le),
        h('div', 's3-check' + (balanced ? '' : ' is-off'), balanced ? 'Balances' : 'Does not balance')
      ])
    );
    const box = h('div', 'viz-3s');
    if (v.unit === '$') box.append(h('div', 's3-unit', 'Changes, in $'));
    box.append(grid);
    return box;
  }

  const KINDS = { table, flow, bars, stack, waterfall, threeStatement };

  function render(spec) {
    const fig = h('figure', 'viz viz-' + spec.kind);
    try {
      fig.append(KINDS[spec.kind](spec));
    } catch (e) {
      fig.append(h('p', 'viz-error', 'This visual could not be drawn.'));
      console.warn('Visual failed', spec, e);
    }
    if (spec.caption) fig.append(h('figcaption', null, markup(spec.caption)));
    return fig;
  }

  root.Visuals = { render, kinds: Object.keys(KINDS) };
})(window);
