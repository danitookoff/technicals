/* Technicals: deck registry and card helpers.
   Loaded first. Every data/<module>.js file calls Deck.add([...]).
   Module order inside each track is the study order the feed uses for new cards. */
(function (root) {
  'use strict';

  const TRACKS = [
    { id: 'ib', name: 'IB' },
    { id: 're', name: 'Real estate' },
    { id: 'hotel', name: 'Hotels' }
  ];

  // name: full title (matches COVERAGE.md). short: caption label.
  const MODULES = [
    { id: 'ib-acct', track: 'ib', name: 'Accounting and the three statements', short: 'Accounting' },
    { id: 'ib-walk', track: 'ib', name: 'Walk-throughs', short: 'Walk-throughs' },
    { id: 'ib-ev', track: 'ib', name: 'Enterprise and equity value', short: 'Enterprise value' },
    { id: 'ib-val', track: 'ib', name: 'Valuation overview', short: 'Valuation' },
    { id: 'ib-comps', track: 'ib', name: 'Trading comps', short: 'Trading comps' },
    { id: 'ib-precedents', track: 'ib', name: 'Precedent transactions', short: 'Precedents' },
    { id: 'ib-dcf', track: 'ib', name: 'DCF', short: 'DCF' },
    { id: 'ib-wacc', track: 'ib', name: 'Cost of capital', short: 'Cost of capital' },
    { id: 'ib-lbo', track: 'ib', name: 'LBO', short: 'LBO' },
    { id: 'ib-ma', track: 'ib', name: 'M&A and merger models', short: 'M&A' },
    { id: 'ib-acct-adv', track: 'ib', name: 'Advanced accounting', short: 'Advanced accounting' },
    { id: 'ib-ratios', track: 'ib', name: 'Financial statement analysis', short: 'Ratios' },
    { id: 'ib-credit', track: 'ib', name: 'Debt and leveraged finance', short: 'Leveraged finance' },
    { id: 'ib-process', track: 'ib', name: 'Deal process and ECM', short: 'Deal process' },
    { id: 'ib-rx', track: 'ib', name: 'Restructuring basics', short: 'Restructuring' },
    { id: 'ib-sectors', track: 'ib', name: 'Sector-specific valuation', short: 'Sectors' },
    { id: 'ib-model', track: 'ib', name: 'Modeling mechanics and Excel', short: 'Modeling' },

    { id: 're-basics', track: 're', name: 'Foundations', short: 'Real estate foundations' },
    { id: 're-noi', track: 're', name: 'Operating statement and NOI', short: 'NOI' },
    { id: 're-val', track: 're', name: 'Valuation', short: 'Real estate valuation' },
    { id: 're-returns', track: 're', name: 'Returns', short: 'Returns' },
    { id: 're-debt', track: 're', name: 'Debt, capital markets and credit', short: 'Real estate debt' },
    { id: 're-leases', track: 're', name: 'Leases and rent rolls', short: 'Leases' },
    { id: 're-deals', track: 're', name: 'Deal structures and waterfalls', short: 'Waterfalls' },
    { id: 're-acq', track: 're', name: 'Acquisitions process', short: 'Acquisitions' },
    { id: 're-dev', track: 're', name: 'Development and feasibility', short: 'Development' },
    { id: 're-am', track: 're', name: 'Asset management on the job', short: 'Asset management' },
    { id: 're-market', track: 're', name: 'Market analysis', short: 'Market analysis' },
    { id: 're-acct', track: 're', name: 'Real estate accounting', short: 'Real estate accounting' },
    { id: 're-model', track: 're', name: 'Building a real estate model', short: 'Real estate modeling' },

    { id: 'hotel-basics', track: 'hotel', name: 'Hotel fundamentals', short: 'Hotel basics' },
    { id: 'hotel-metrics', track: 'hotel', name: 'Performance metrics', short: 'Hotel metrics' },
    { id: 'hotel-usali', track: 'hotel', name: 'USALI and the hotel P&L', short: 'Hotel P&L' },
    { id: 'hotel-val', track: 'hotel', name: 'Valuation and investment', short: 'Hotel valuation' },
    { id: 'hotel-agreements', track: 'hotel', name: 'Management and franchise agreements', short: 'Hotel agreements' },
    { id: 'hotel-capex', track: 'hotel', name: 'Capex, PIPs and reserves', short: 'Capex and PIPs' },
    { id: 'hotel-debt', track: 'hotel', name: 'Hotel financing', short: 'Hotel debt' },
    { id: 'hotel-rm', track: 'hotel', name: 'Demand and revenue management', short: 'Revenue management' },
    { id: 'hotel-am', track: 'hotel', name: 'Hotel asset management and development', short: 'Hotel asset management' }
  ];

  const moduleIndex = Object.create(null);
  MODULES.forEach((m, i) => { m.order = i; moduleIndex[m.id] = m; });
  const trackIndex = Object.create(null);
  TRACKS.forEach((t) => { trackIndex[t.id] = t; });

  const cards = [];
  const byId = Object.create(null);
  const problems = [];

  // Light checks only; tools/validate.js does the thorough ones.
  function add(list) {
    if (!Array.isArray(list)) { problems.push('Deck.add expects an array'); return; }
    for (const c of list) {
      if (!c || typeof c.id !== 'string') { problems.push('Card without an id'); continue; }
      if (byId[c.id]) { problems.push('Duplicate id ' + c.id); continue; }
      if (!moduleIndex[c.module]) { problems.push('Unknown module on ' + c.id); continue; }
      if (typeof c.q !== 'string' || typeof c.a !== 'string') { problems.push('Missing q or a on ' + c.id); continue; }
      cards.push(c);
      byId[c.id] = c;
    }
  }

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function escape(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, (ch) => ESC[ch]);
  }

  // [[...]] marks a given input; it renders blue, like a hard-coded input in a model.
  function markup(text) {
    return escape(text)
      .replace(/\[\[([\s\S]*?)\]\]/g, '<span class="in">$1</span>')
      .replace(/\n/g, '<br>');
  }

  function plain(text) {
    return String(text == null ? '' : text).replace(/\[\[|\]\]/g, '');
  }

  root.Deck = {
    tracks: TRACKS,
    modules: MODULES,
    cards,
    byId,
    problems,
    add,
    module: (id) => moduleIndex[id],
    track: (id) => trackIndex[id],
    card: (id) => byId[id],
    escape,
    markup,
    plain
  };
})(typeof window !== 'undefined' ? window : globalThis);
