/* Technicals app: feed, grading, spaced repetition, menus, stats and settings.
   Progress lives in localStorage under STORE_KEY. Never rename the key without migrating the old one. */
(() => {
  'use strict';

  const APP_VERSION = 8;
  const STORE_KEY = 'technicals.progress.v1';
  const INTERVALS = [0, 1, 3, 7, 16, 35, 90]; // days until due, by Leitner box
  const MASTERED_BOX = 4;
  const STREAK_MIN = 20;   // graded cards for a day to count toward the streak
  const CLOSE_SHARE = 0.9; // share of a module's questions mastered to close it
  const CLOSE_MIN = 10;    // a module needs at least this many questions before it can close
  const BEHIND = 2;        // cards kept in the DOM behind the current one
  const AHEAD = 3;         // and ahead of it
  const OPEN_PER_TRACK = 2;                         // modules introduced side by side in each track
  const NEW_PATTERN = ['re', 'hotel', 're', 'ib']; // new-card rotation when every track is on
  const MISSED_KEEP = 100;

  const TRACK_LABEL = { all: 'All tracks', ib: 'IB', re: 'Real estate', hotel: 'Hotels' };
  const TRACK_LONG = { ib: 'Investment banking', re: 'Real estate', hotel: 'Hotels' };
  const TYPE_LABEL = { walk: 'Walk-through', primer: 'Primer', drill: 'Drill' };
  const GRADES = ['Missed it', 'Got it', 'Too easy'];

  // ---------------------------------------------------------------- helpers

  const $ = (sel, root = document) => root.querySelector(sel);

  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      n.append(kid instanceof Node ? kid : String(kid));
    }
    return n;
  }

  const ICON = {
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="save-path" d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.3-6.5 4.3v-16a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    explain: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.75" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.8v5.7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.25" fill="currentColor"/></svg>'
  };

  const media = (q) => window.matchMedia(q).matches;
  const reduced = () => media('(prefers-reduced-motion: reduce)');
  const wide = () => media('(min-width: 1000px)');

  // Local calendar days: dayKey(dayNum()) is today's local date as YYYY-MM-DD.
  const dayNum = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  const dayKey = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
  const longDate = (t) => new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const plain = (t) => Deck.plain(t || '');
  const idNum = (id) => parseInt(id.slice(-3), 10) || 0;

  // ---------------------------------------------------------------- storage

  const Store = {
    data: null,
    ok: true,
    timer: null,
    blank() {
      return {
        schema: 1,
        cards: {},   // id → { b: box, d: due day, s: last seen ms, t: last graded ms, n: times graded, m: misses }
        drills: {},  // drill type → same shape
        saved: {},   // id → saved at (ms)
        flags: {},   // id → { note, t, seed? }
        missed: [],  // [{ id, t }], newest first
        log: {},     // 'YYYY-MM-DD' → cards graded that day
        closed: {},  // module → { t, mastered, total }
        settings: { track: 'all', focus: null, drillEvery: 6, size: 'm', theme: 'system', advance: true }
      };
    },
    load() {
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { this.ok = false; }
      this.data = this.normalize(raw);
    },
    // Fill in anything missing so older or partial saves keep working. Migrations go here.
    normalize(d) {
      const b = this.blank();
      if (!d || typeof d !== 'object') return b;
      const out = { ...b };
      for (const k of Object.keys(b)) {
        if (k === 'settings' || d[k] == null) continue;
        if (typeof d[k] === typeof b[k] && Array.isArray(d[k]) === Array.isArray(b[k])) out[k] = d[k];
      }
      out.settings = { ...b.settings, ...(d.settings && typeof d.settings === 'object' ? d.settings : {}) };
      out.schema = 1;
      return out;
    },
    save() {
      clearTimeout(this.timer);
      this.timer = null;
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
        this.ok = true;
      } catch (e) {
        if (this.ok) toast("Progress can't be saved in this browser. Export it to keep a copy.");
        this.ok = false;
      }
    },
    saveSoon() { if (!this.timer) this.timer = setTimeout(() => this.save(), 800); },
    flush() { if (this.timer) this.save(); }
  };
  const S = () => Store.data;
  const prefs = () => Store.data.settings;

  // ---------------------------------------------------------------- deck indexes

  const byModule = new Map(Deck.modules.map((m) => [m.id, []]));
  Deck.cards.forEach((c) => byModule.get(c.module).push(c));
  // Study order inside a module: primer first, then level 1, 2, 3.
  const studyOrder = (a, b) => (a.type === 'primer' ? 0 : 1) - (b.type === 'primer' ? 0 : 1) || a.level - b.level || idNum(a.id) - idNum(b.id);
  byModule.forEach((list) => list.sort(studyOrder));
  const questions = (moduleId) => byModule.get(moduleId).filter((c) => c.type !== 'primer');
  const drillsIn = (moduleId) => Drills.list.filter((d) => d.module === moduleId);
  const exists = (id) => !!(Deck.card(id) || Drills.get(id));
  const introduced = (id) => { const r = S().cards[id]; return !!r && r.b != null; };

  // ---------------------------------------------------------------- filters

  function focus() {
    const f = prefs().focus;
    return f && ((f.modules && f.modules.length) || f.level || f.classic) ? f : null;
  }
  function inScope(moduleId) {
    const f = focus();
    if (f && f.modules.length) return f.modules.includes(moduleId);
    const t = prefs().track;
    return t === 'all' || Deck.module(moduleId).track === t;
  }
  function matches(c) {
    if (!inScope(c.module)) return false;
    const f = focus();
    if (f && f.level && c.level !== f.level) return false;
    if (f && f.classic && !c.classic) return false;
    return true;
  }
  function drillMatches(d) {
    if (!inScope(d.module)) return false;
    const f = focus();
    return !(f && f.level && d.level !== f.level);
  }
  function focusSummary() {
    const f = focus();
    if (!f) return '';
    const parts = [];
    if (f.modules.length) parts.push(f.modules.length <= 2 ? f.modules.map((id) => Deck.module(id).short).join(', ') : `${f.modules.length} modules`);
    if (f.level) parts.push(`Level ${f.level}`);
    if (f.classic) parts.push('Classics');
    return parts.join(' · ');
  }

  // ---------------------------------------------------------------- queue

  const Q = { entries: [], pos: 0, served: new Set(), sinceDrill: 0, reviewRun: 0, trackTurn: 0, fallback: 0 };
  let uidSeq = 1;
  // Any card placed in the queue (picked, opened from a list, or served as a fallback) counts as served,
  // so dueCards() and headOf() won't hand it out a second time this session.
  const cardEntry = (id, extra) => { Q.served.add(id); return { uid: uidSeq++, kind: 'card', id, ...extra }; };
  const drillEntry = (id, extra) => ({ uid: uidSeq++, kind: 'drill', id, seed: (Math.random() * 4294967296) >>> 0, ...extra });
  const entryByUid = (uid) => Q.entries.find((e) => e.uid === uid);

  // The next new card in a module: its primer comes before the first new question,
  // even when a level or classics filter would hide it.
  function headOf(moduleId) {
    let primer = null;
    let first = null;
    let started = false;
    for (const c of byModule.get(moduleId)) {
      if (c.type === 'primer') {
        if (!primer && !introduced(c.id) && !Q.served.has(c.id)) primer = c;
        continue;
      }
      if (introduced(c.id)) { started = true; continue; }
      if (!first && !Q.served.has(c.id) && matches(c)) first = c;
    }
    if (primer && (matches(primer) || (first && !started))) return primer;
    return first;
  }

  // Lowest level first; the earlier module in study order wins ties.
  function lowest(heads) {
    return heads.reduce((best, c) => (c && (!best || c.level < best.level) ? c : best), null);
  }

  // Which new card comes next. Within a track, two neighboring modules are open at a time, so the
  // order runs roughly: level 1 of module k, level 1 of k+1, then level 2s, then level 3s.
  // Returns { card, commit } so the track rotation only advances when the card is used.
  function pickNew() {
    const f = focus();
    if (f && f.modules.length) {
      const card = lowest(Deck.modules.filter((m) => f.modules.includes(m.id)).map((m) => headOf(m.id)));
      return card && { card, commit() {} };
    }
    const t = prefs().track;
    const pattern = t === 'all' ? NEW_PATTERN : [t];
    for (let k = 0; k < pattern.length; k++) {
      const track = pattern[(Q.trackTurn + k) % pattern.length];
      const open = [];
      for (const m of Deck.modules) {
        if (m.track !== track || !inScope(m.id)) continue;
        const c = headOf(m.id);
        if (c) open.push(c);
        if (open.length === OPEN_PER_TRACK) break;
      }
      const card = lowest(open);
      if (card) return { card, commit: () => { Q.trackTurn = (Q.trackTurn + k + 1) % pattern.length; } };
    }
    return null;
  }

  // Most overdue first, then lowest box; ties are shuffled once per session so tracks mix.
  const tieBreak = new Map();
  const tie = (id) => { if (!tieBreak.has(id)) tieBreak.set(id, Math.random()); return tieBreak.get(id); };

  function dueCards() {
    const today = dayNum();
    const out = [];
    for (const c of Deck.cards) {
      const r = S().cards[c.id];
      if (!r || r.b == null || r.d > today || Q.served.has(c.id) || !matches(c)) continue;
      out.push(c);
    }
    const rc = (c) => S().cards[c.id];
    return out.sort((a, b) => rc(a).d - rc(b).d || rc(a).b - rc(b).b || tie(a.id) - tie(b.id));
  }

  // Drills are scheduled per type: due types first, then the least recently seen.
  function pickDrill(list) {
    const recent = [];
    for (let i = Q.entries.length - 1; i >= 0 && recent.length < 2; i--) if (Q.entries[i].kind === 'drill') recent.push(Q.entries[i].id);
    for (let i = Q.pos + 1; i < Q.entries.length; i++) if (Q.entries[i].kind === 'drill') recent.push(Q.entries[i].id); // e.g. a missed drill's retry
    const fresh = list.filter((d) => !recent.includes(d.id));
    const pool = fresh.length ? fresh : list;
    const today = dayNum();
    const rd = (d) => S().drills[d.id];
    const due = pool.filter((d) => rd(d) && rd(d).b != null && rd(d).d <= today).sort((a, b) => rd(a).d - rd(b).d || rd(a).b - rd(b).b);
    if (due.length) return due[0];
    const seen = (d) => (rd(d) && rd(d).s) || 0;
    const sorted = pool.slice().sort((a, b) => seen(a) - seen(b));
    return sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
  }

  function nextEntry() {
    const drills = Drills.list.filter(drillMatches);
    const every = prefs().drillEvery;
    if (every && drills.length && Q.sinceDrill >= every - 1) {
      Q.sinceDrill = 0;
      return drillEntry(pickDrill(drills).id);
    }
    Q.sinceDrill++;
    const due = dueCards();
    const fresh = pickNew();
    let card = null;
    // Reviews first, with about one new card for every two reviews.
    if (due.length && fresh && Q.reviewRun >= 2) { card = fresh.card; fresh.commit(); Q.reviewRun = 0; }
    else if (due.length) { card = due[0]; Q.reviewRun++; }
    else if (fresh) { card = fresh.card; fresh.commit(); Q.reviewRun = 0; }
    if (card) return cardEntry(card.id);
    return fallbackEntry(drills);
  }

  // Nothing due and nothing new: drills and the least recently seen cards, so the feed never ends.
  function fallbackEntry(drills) {
    Q.fallback++;
    if (drills.length && Q.fallback % 3 === 0) return drillEntry(pickDrill(drills).id);
    const pool = Deck.cards.filter((c) => c.type !== 'primer' && matches(c));
    if (!pool.length) return drills.length ? drillEntry(pickDrill(drills).id) : { uid: uidSeq++, kind: 'empty' };
    const recent = new Set();
    const span = Math.min(20, pool.length - 1);
    for (let i = Q.entries.length - 1; i >= 0 && recent.size < span; i--) if (Q.entries[i].kind === 'card') recent.add(Q.entries[i].id);
    let best = null;
    for (const c of pool) {
      if (recent.has(c.id)) continue;
      const s = (S().cards[c.id] || {}).s || 0;
      if (!best || s < best.s) best = { c, s };
    }
    return cardEntry((best ? best.c : pool[0]).id);
  }

  function ensureAhead(upTo = Q.pos + AHEAD + 2) {
    while (Q.entries.length <= upTo) {
      const last = Q.entries[Q.entries.length - 1];
      if (last && last.kind === 'empty') break;
      Q.entries.push(nextEntry());
    }
  }

  // Drop everything after the current card, e.g. when filters change.
  function resetAhead() {
    const dropped = Q.entries.splice(Q.pos + 1);
    const kept = new Set(Q.entries.filter((e) => e.kind === 'card').map((e) => e.id));
    for (const e of dropped) {
      if (e.kind === 'card' && !kept.has(e.id)) Q.served.delete(e.id);
      const node = rendered.get(e.uid);
      if (node) { node.remove(); rendered.delete(e.uid); }
    }
    Q.sinceDrill = 0;
    Q.reviewRun = 0;
  }

  // A missed card or drill type comes back 4–8 cards later (drills with fresh numbers).
  function requeue(e) {
    const at = Q.pos + 4 + Math.floor(Math.random() * 5);
    ensureAhead(at);
    const again = e.kind === 'drill' ? drillEntry(e.id, { again: true }) : cardEntry(e.id, { again: true });
    Q.entries.splice(at, 0, again);
    layout();
    return again.uid;
  }
  function dropUpcoming(uid) {
    const i = Q.entries.findIndex((x) => x.uid === uid);
    if (i <= Q.pos) return;
    Q.entries.splice(i, 1);
    const node = rendered.get(uid);
    if (node) { node.remove(); rendered.delete(uid); }
    layout();
  }

  // ---------------------------------------------------------------- feed

  const feed = $('#feed');
  const track = $('#track');
  const rendered = new Map(); // uid → element
  let H = 0;

  function measure() {
    H = feed.clientHeight || window.innerHeight;
    document.documentElement.style.setProperty('--h', H + 'px');
  }

  // Keep only a small window of cards in the DOM.
  function layout() {
    track.style.height = Q.entries.length * H + 'px';
    const lo = Math.max(0, Q.pos - BEHIND);
    const hi = Math.min(Q.entries.length - 1, Q.pos + AHEAD);
    const keep = new Set();
    for (let i = lo; i <= hi; i++) {
      const e = Q.entries[i];
      keep.add(e.uid);
      let node = rendered.get(e.uid);
      const fresh = !node;
      if (fresh) {
        node = renderEntry(e);
        rendered.set(e.uid, node);
        track.append(node);
      }
      node.style.top = i * H + 'px';
      node.dataset.index = i;
      node.inert = i !== Q.pos;
      if (fresh) fit(node);
    }
    for (const [uid, node] of rendered) {
      if (!keep.has(uid)) { node.remove(); rendered.delete(uid); }
    }
  }

  const lenClass = (q) => { const n = plain(q).length; return n <= 60 ? 's' : n > 150 ? 'l' : 'm'; };

  function problem(e) {
    if (e.problem === undefined) {
      try { e.problem = Drills.run(e.id, e.seed); } catch (err) { console.warn('Drill failed', e.id, e.seed, err); e.problem = null; }
    }
    return e.problem;
  }

  function gradeBtn(g, e) {
    return h('button', { class: 'btn', type: 'button', 'data-g': g, 'aria-pressed': String(e.grade === g) },
      GRADES[g], h('span', { class: 'kbd', text: String(g + 1) }));
  }

  function renderEntry(e) {
    if (e.kind === 'empty') return renderNote(e);
    const drill = e.kind === 'drill' ? Drills.get(e.id) : null;
    const card = drill ? null : Deck.card(e.id);
    const src = drill ? problem(e) : card;
    if (!src) return renderNote(e, true);
    const meta = drill || card;
    const type = drill ? 'drill' : card.type;
    const mod = Deck.module(meta.module);
    const node = h('article', {
      class: 'card', 'data-uid': e.uid, 'data-type': type,
      'data-state': type === 'primer' || e.revealed ? 'revealed' : 'front',
      'aria-label': `${mod.short}: ${meta.topic}`
    });
    const body = h('div', { class: 'card-body' }, h('h2', { class: 'q', 'data-len': lenClass(src.q), html: Deck.markup(src.q) }));
    if (type === 'primer') body.append(h('div', { class: 'lesson', html: Deck.markup(src.a) }));
    else body.append(h('div', { class: 'answer', 'aria-live': 'polite' }));
    const tags = [meta.topic, `Level ${meta.level}`, TYPE_LABEL[type], card && card.classic && 'Classic', e.again && 'Again'].filter(Boolean);
    const foot = h('div', { class: 'card-foot' },
      h('div', { class: 'caption' },
        h('p', { class: 'cap-mod', text: mod.short }),
        h('p', { class: 'cap-meta', text: tags.join(' · ') })),
      h('div', { class: 'rail' },
        h('button', { class: 'rail-btn', type: 'button', 'data-act': 'save', 'aria-pressed': String(!!S().saved[e.id]), html: ICON.save + '<span>Save</span>' }),
        h('button', { class: 'rail-btn', type: 'button', 'data-act': 'explain', 'aria-haspopup': 'dialog', html: ICON.explain + '<span>Explain</span>' })));
    const bar = h('div', { class: 'grade-bar' });
    if (type === 'primer') {
      bar.append(h('div', { class: 'grades' }, gradeBtn(1, e)));
    } else {
      bar.append(h('button', { class: 'btn btn-block reveal-btn', type: 'button', 'data-act': 'reveal' }, 'Reveal answer', h('span', { class: 'kbd', text: 'Space' })));
      bar.append(h('div', { class: 'grades', role: 'group', 'aria-label': 'Grade yourself' }, [0, 1, 2].map((g) => gradeBtn(g, e))));
    }
    node.append(h('div', { class: 'card-inner' }, body, foot, bar));
    if (e.revealed && type !== 'primer') fillAnswer(node, e);
    return node;
  }

  function renderNote(e, broken) {
    const f = focus();
    const text = broken ? "This card isn't in the deck anymore."
      : !Deck.cards.length ? "The cards didn't load. Reload the page."
        : f ? 'No cards or drills match this focus yet.' : 'No cards match this filter yet.';
    const node = h('article', { class: 'card', 'data-uid': e.uid, 'data-type': 'note', 'data-state': 'revealed' });
    node.append(h('div', { class: 'card-inner' },
      h('div', { class: 'card-body card-note' },
        h('h2', { class: 'q', 'data-len': 's', text: 'Nothing to show' }),
        h('p', { text }),
        h('div', { class: 'actions' },
          f && h('button', { class: 'btn', type: 'button', 'data-act': 'clear-focus' }, 'Clear focus'),
          h('button', { class: 'btn', type: 'button', 'data-act': 'open-menu' }, 'Open menu'))),
      h('div'), h('div')));
    return node;
  }

  function fillAnswer(node, e) {
    const src = e.kind === 'drill' ? problem(e) : Deck.card(e.id);
    const box = node.querySelector('.answer');
    if (!box || !src || box.childElementCount) return;
    box.append(h('p', { class: 'a', html: Deck.markup(src.a) }));
    if (src.formula) box.append(h('div', { class: 'formula' }, src.formula.split('\n').map((l) => h('div', { html: Deck.markup(l) }))));
  }

  // Shrink type in steps until the card fits; scrolling inside the card is the last resort.
  function fit(node) {
    const body = node.querySelector('.card-body');
    if (!body) return;
    node.classList.remove('fit-1', 'fit-2', 'fit-3', 'scrolls');
    const over = () => body.scrollHeight > body.clientHeight + 1;
    for (const cls of ['fit-1', 'fit-2', 'fit-3']) {
      if (!over()) return;
      node.classList.add(cls);
    }
    if (over()) node.classList.add('scrolls');
  }

  let pending = null;
  let pendingTimer = null;
  let ticking = false;

  feed.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sync(); });
  }, { passive: true });

  function sync() {
    if (!H) return;
    const i = Math.max(0, Math.min(Q.entries.length - 1, Math.round(feed.scrollTop / H)));
    if (i !== Q.pos) setPos(i);
    if (pending === i) pending = null;
  }

  function setPos(i) {
    Q.pos = i;
    ensureAhead();
    layout();
    markSeen(Q.entries[i]);
  }

  // Swiping onto a card counts as seen; nothing else changes until it's graded.
  function markSeen(e) {
    if (!e || e.kind === 'empty' || !exists(e.id)) return;
    const bucket = e.kind === 'drill' ? S().drills : S().cards;
    bucket[e.id] = { ...(bucket[e.id] || {}), s: Date.now() };
    Store.saveSoon();
  }

  function go(delta) {
    ensureAhead((pending != null ? pending : Q.pos) + Math.max(delta, 0) + AHEAD + 2);
    const from = pending != null ? pending : Q.pos;
    const i = Math.max(0, Math.min(from + delta, Q.entries.length - 1));
    if (i === from) return;
    pending = i;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => { pending = null; }, 800);
    feed.scrollTo({ top: i * H, behavior: reduced() ? 'auto' : 'smooth' });
  }

  const current = () => Q.entries[Q.pos];

  // ---------------------------------------------------------------- reveal, grade, save

  function reveal(e) {
    if (!e || e.kind === 'empty' || e.revealed) return;
    e.revealed = true;
    const node = rendered.get(e.uid);
    if (!node || node.dataset.type === 'primer') return;
    fillAnswer(node, e);
    node.dataset.state = 'revealed';
    fit(node);
  }

  let advanceTimer = null;

  function grade(e, g) {
    if (!e || e.kind === 'empty' || !exists(e.id)) return;
    const drill = e.kind === 'drill';
    const card = drill ? null : Deck.card(e.id);
    const primer = !!card && card.type === 'primer';
    if (!primer && !e.revealed) { reveal(e); return; }
    if (primer) { if (g === 0) return; g = 1; }

    const bucket = drill ? S().drills : S().cards;
    const now = Date.now();
    const today = dayNum();
    const first = e.grade == null;
    if (first) {
      e.base = bucket[e.id] && bucket[e.id].b != null ? { ...bucket[e.id] } : null;
      const k = dayKey(today);
      S().log[k] = (S().log[k] || 0) + 1;
    } else if ((bucket[e.id] || {}).t !== e.gradedAt) {
      e.base = { ...bucket[e.id] }; // graded again later in the session: build on the latest
    }
    // Leitner: Missed it → box 0; Got it → up one box; Too easy → box 4 (or up one if already there).
    // A primer is a lesson, so reading it parks it in box 6 as a refresher in about three months.
    const base = e.base || {};
    const from = base.b == null ? 0 : base.b;
    const box = primer ? 6 : g === 0 ? 0 : g === 1 ? Math.min(6, from + 1) : Math.max(4, Math.min(6, from + 1));
    bucket[e.id] = { b: box, d: today + INTERVALS[box], s: now, t: now, n: (base.n || 0) + 1, m: (base.m || 0) + (g === 0 ? 1 : 0) };
    e.grade = g;
    e.gradedAt = now;

    S().missed = S().missed.filter((x) => !(x.id === e.id && x.t === e.missedAt));
    e.missedAt = null;
    if (e.againUid) { dropUpcoming(e.againUid); e.againUid = null; }
    if (g === 0) {
      e.missedAt = now;
      S().missed.unshift({ id: e.id, t: now });
      S().missed.length = Math.min(S().missed.length, MISSED_KEEP);
      e.againUid = requeue(e);
    }
    Store.save();

    const node = rendered.get(e.uid);
    if (node) node.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.g) === g)));
    updateToday();
    const closedNow = card && !primer && g !== 0 && checkClose(card.module);
    if (prefs().advance && !closedNow) {
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => { if (current() === e && !openSheetId) go(1); }, reduced() ? 120 : 280);
    }
  }

  function toggleSave(e) {
    if (!e || e.kind === 'empty' || !exists(e.id)) return;
    const on = !S().saved[e.id];
    if (on) S().saved[e.id] = Date.now();
    else delete S().saved[e.id];
    Store.save();
    rendered.forEach((node, uid) => {
      const x = entryByUid(uid);
      if (x && x.id === e.id) node.querySelector('[data-act="save"]').setAttribute('aria-pressed', String(on));
    });
  }

  track.addEventListener('click', (ev) => {
    const node = ev.target.closest('.card');
    if (!node || Number(node.dataset.index) !== Q.pos) return;
    const e = current();
    const btn = ev.target.closest('button');
    if (btn) {
      if (btn.dataset.g != null) { grade(e, Number(btn.dataset.g)); return; }
      const act = btn.dataset.act;
      if (act === 'reveal') reveal(e);
      else if (act === 'save') toggleSave(e);
      else if (act === 'explain') openExplain(e);
      else if (act === 'clear-focus') setFocus(null);
      else if (act === 'open-menu') openMenu('main');
      return;
    }
    if (ev.target.closest('a, input, textarea, select, label')) return;
    if (String(window.getSelection ? window.getSelection() : '').length) return;
    reveal(e);
  });

  // ---------------------------------------------------------------- modules: mastery and closing

  function moduleStats(id) {
    const qs = questions(id);
    const mastered = qs.filter((c) => { const r = S().cards[c.id]; return r && r.b >= MASTERED_BOX; }).length;
    return { total: qs.length, mastered };
  }

  function checkClose(id) {
    if (S().closed[id]) return false;
    const s = moduleStats(id);
    if (s.total < CLOSE_MIN || s.mastered < CLOSE_SHARE * s.total) return false;
    S().closed[id] = { t: Date.now(), mastered: s.mastered, total: s.total };
    Store.save();
    setTimeout(() => showClosing(id), 320);
    return true;
  }

  function tombstone(m, c, extra = '') {
    return h('div', { class: 'tombstone ' + extra, role: 'img', 'aria-label': `${m.name}: ${c.mastered} cards mastered, closed ${longDate(c.t)}` },
      h('div', { class: 'ts-track', text: TRACK_LONG[m.track] }),
      h('div', { class: 'ts-figure', text: String(c.mastered) }),
      h('div', { class: 'ts-unit', text: 'cards mastered' }),
      h('div', { class: 'ts-rule' }),
      h('div', { class: 'ts-name', text: m.name }),
      h('div', { class: 'ts-rule' }),
      h('div', { class: 'ts-date', text: `Closed ${longDate(c.t)}` }));
  }

  function showClosing(moduleId, preview) {
    const m = Deck.module(moduleId);
    const c = preview || S().closed[moduleId];
    if (!m || !c) return;
    const box = $('#closing');
    box.replaceChildren(h('div', { class: 'closing-inner' },
      h('p', { class: 'closing-kicker', id: 'closing-title', text: preview ? 'Preview: deal closed' : 'Deal closed' }),
      tombstone(m, c),
      h('p', { class: 'closing-note', text: preview ? 'This is what closing a module looks like. Nothing was saved.' : `${m.name} now sits on your Closed deals shelf in Stats.` }),
      h('div', { class: 'btn-row' },
        !preview && h('button', { class: 'btn', type: 'button', onclick: () => { hideClosing(); openMenu('stats'); } }, 'View shelf'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: hideClosing }, 'Continue'))));
    box.hidden = false;
    $('#app').inert = true;
    box.querySelector('.btn-primary').focus();
  }

  function hideClosing() {
    $('#closing').hidden = true;
    if (!openSheetId) $('#app').inert = false;
  }

  function streak() {
    const count = (d) => S().log[dayKey(d)] || 0;
    let d = dayNum();
    let n = 0;
    if (count(d) < STREAK_MIN) d--; // today is still in progress
    while (count(d) >= STREAK_MIN) { n++; d--; }
    return n;
  }

  function updateToday() {
    const n = S().log[dayKey(dayNum())] || 0;
    $('#today-n').textContent = n;
    const ring = $('#today-ring');
    ring.setAttribute('stroke-dasharray', `${Math.min(100, (100 * n) / STREAK_MIN)} 100`);
    ring.style.opacity = n ? 1 : 0;
    $('#today-btn').setAttribute('aria-label', n >= STREAK_MIN
      ? `${n} graded today; today counts toward your streak. Open stats`
      : `${n} graded today, ${STREAK_MIN - n} more for your streak. Open stats`);
  }

  function updateTopbar() {
    const label = focus() ? `Focus: ${focusSummary()}` : TRACK_LABEL[prefs().track];
    const btn = $('#filter-btn');
    btn.textContent = label;
    btn.setAttribute('aria-label', `Filter: ${label}. Change filter`);
  }

  function setFocus(f) {
    prefs().focus = f && (f.modules.length || f.level || f.classic) ? { modules: f.modules.slice(), level: f.level || 0, classic: !!f.classic } : null;
    Store.save();
    applyFilters();
  }

  function applyFilters() {
    resetAhead();
    ensureAhead();
    layout();
    updateTopbar();
    go(1);
  }

  // ---------------------------------------------------------------- sheets

  const scrim = $('#scrim');
  let openSheetId = null;
  let lastFocus = null;

  function openSheet(id) {
    if (openSheetId && openSheetId !== id) closeSheet({ swap: true });
    const sheet = document.getElementById(id);
    if (openSheetId !== id) lastFocus = document.activeElement;
    openSheetId = id;
    sheet.hidden = false;
    scrim.hidden = false;
    feed.classList.add('is-locked'); // the feed doesn't scroll while a sheet is open
    $('#app').inert = true;
    document.body.classList.toggle('panel-right', id === 'explain');
    document.body.classList.toggle('panel-left', id === 'menu');
    sheet.getBoundingClientRect(); // start the transition from the closed position
    sheet.classList.add('is-open');
    scrim.classList.add('is-open');
  }

  function closeSheet(opts = {}) {
    if (!openSheetId) return;
    const sheet = document.getElementById(openSheetId);
    openSheetId = null;
    sheet.classList.remove('is-open', 'is-dragging');
    sheet.style.transform = '';
    const hide = () => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; };
    if (opts.swap) { hide(); return; }
    scrim.classList.remove('is-open');
    document.body.classList.remove('panel-right', 'panel-left');
    feed.classList.remove('is-locked');
    $('#app').inert = !$('#closing').hidden;
    setTimeout(() => { hide(); if (!openSheetId) scrim.hidden = true; }, reduced() ? 0 : 260);
    if (lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    else feed.focus({ preventScroll: true });
  }

  scrim.addEventListener('click', () => closeSheet());
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeSheet()));

  // Drag a bottom sheet down by its header to dismiss it.
  document.querySelectorAll('.sheet').forEach((sheet) => {
    const head = sheet.querySelector('.sheet-head');
    let startY = null;
    let dy = 0;
    head.addEventListener('pointerdown', (ev) => {
      if (wide() || ev.target.closest('button') || ev.button !== 0) return;
      startY = ev.clientY;
      dy = 0;
      head.setPointerCapture(ev.pointerId);
      sheet.classList.add('is-dragging');
    });
    head.addEventListener('pointermove', (ev) => {
      if (startY == null) return;
      dy = Math.max(0, ev.clientY - startY);
      sheet.style.transform = `translateY(${dy}px)`;
    });
    const end = () => {
      if (startY == null) return;
      startY = null;
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
      if (dy > 90) closeSheet();
    };
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  });

  // ---------------------------------------------------------------- explain

  function openExplain(e, opts = {}) {
    if (!e || e.kind === 'empty' || !exists(e.id)) return;
    reveal(e);
    const drill = e.kind === 'drill' ? Drills.get(e.id) : null;
    const src = drill ? problem(e) : Deck.card(e.id);
    if (!src) return;
    const meta = drill || src;
    $('#explain-title').textContent = meta.topic;
    const body = $('#explain-body');
    const sec = (title, ...content) => h('section', { class: 'ex-sec' }, h('h3', { text: title }), ...content);
    const paras = (t) => t.split('\n').map((line) => h('p', { html: Deck.markup(line) }));
    body.replaceChildren(h('p', { class: 'ex-q', html: Deck.markup(src.q) }));
    if (src.why) body.append(sec(src.type === 'primer' ? 'Key terms' : 'Why it works', paras(src.why)));
    if (drill) body.append(sec('Working', h('ol', { class: 'ex-steps' }, src.steps.map((s) => h('li', { html: Deck.markup(s) })))));
    if (src.example) body.append(sec('Worked example', paras(src.example)));
    if (src.trap) body.append(sec('Trap or follow-up', paras(src.trap)));
    if (src.visual) body.append(sec('Visual', Visuals.render(src.visual)));
    const flag = flagSection(e);
    body.append(flag.el);
    body.scrollTop = 0;
    openSheet('explain');
    if (opts.flag) flag.start();
    else $('#explain').focus({ preventScroll: true });
  }

  function flagSection(e) {
    const flagged = () => !!S().flags[e.id];
    const btn = h('button', { class: 'btn btn-small', type: 'button', 'aria-pressed': String(flagged()) }, 'Flag');
    const area = h('textarea', { id: 'flag-note', rows: '3', placeholder: 'What looks wrong or unclear? (optional)' });
    area.value = flagged() ? S().flags[e.id].note || '' : '';
    const field = h('label', { class: 'field', for: 'flag-note' }, 'Note', area);
    field.hidden = !flagged();
    const set = (on) => {
      if (on) S().flags[e.id] = { note: area.value, t: Date.now(), ...(e.kind === 'drill' ? { seed: e.seed } : {}) };
      else delete S().flags[e.id];
      Store.save();
      btn.setAttribute('aria-pressed', String(on));
      field.hidden = !on;
      if (on) area.focus();
    };
    btn.addEventListener('click', () => set(!flagged()));
    area.addEventListener('input', () => {
      if (!S().flags[e.id]) return;
      S().flags[e.id].note = area.value;
      Store.saveSoon();
    });
    const el = h('section', { class: 'flag-sec' },
      h('div', { class: 'flag-row' }, btn, h('p', { text: 'Flag anything wrong or unclear. Flags and notes are listed in the menu.' })),
      field);
    return { el, start: () => { if (!flagged()) set(true); else area.focus(); } };
  }

  // ---------------------------------------------------------------- menu

  const VIEW_TITLES = { main: 'Menu', focus: 'Focus', saved: 'Saved', missed: 'Recently missed', search: 'Search', stats: 'Stats', flagged: 'Flagged', settings: 'Settings' };
  let menuView = 'main';
  const menuStack = [];

  function openMenu(view = 'main', opts) {
    menuStack.length = 0;
    if (view !== 'main') menuStack.push('main');
    showView(view, opts);
    openSheet('menu');
    const input = $('#search-input');
    if (view === 'search' && input) input.focus();
    else $('#menu').focus({ preventScroll: true });
  }

  function showView(view, opts) {
    menuView = view;
    $('#menu-title').textContent = VIEW_TITLES[view];
    $('#menu-back').hidden = view === 'main';
    const body = $('#menu-body');
    body.replaceChildren(VIEWS[view](opts || {}));
    body.scrollTop = 0;
  }

  function pushView(view, opts) {
    menuStack.push(menuView);
    showView(view, opts);
  }

  $('#menu-back').addEventListener('click', () => {
    showView(menuStack.pop() || 'main');
    if ($('#menu-back').hidden) $('#menu').focus();
    else $('#menu-back').focus();
  });

  function seg(name, options, value, onChange) {
    const box = h('div', { class: 'seg', role: 'radiogroup' });
    for (const [v, label] of options) {
      const input = h('input', { type: 'radio', name, value: String(v), checked: String(v) === String(value) });
      input.addEventListener('change', () => onChange(v));
      box.append(h('label', {}, input, h('span', { text: label })));
    }
    return box;
  }

  function switchRow(label, on, onChange) {
    const input = h('input', { type: 'checkbox', role: 'switch', checked: !!on });
    input.addEventListener('change', () => onChange(input.checked));
    return h('label', { class: 'switch-row' }, h('span', { text: label }), h('span', { class: 'switch' }, input, h('span')));
  }

  const section = (title, ...content) => h('section', { class: 'm-sec' }, title && h('h3', { text: title }), ...content);
  const note = (text) => h('p', { class: 'm-note', text });

  function row(label, count, onclick) {
    return h('button', { class: 'row-btn', type: 'button', onclick }, h('span', { text: label }), count != null && h('span', { class: 'count', text: String(count) }));
  }

  function itemButton(id) {
    const d = Drills.get(id);
    const c = Deck.card(id);
    const src = d || c;
    const r = (d ? S().drills : S().cards)[id];
    const meta = [Deck.module(src.module).short, `Level ${src.level}`, r && r.b != null ? `Box ${r.b}` : 'New'].join(' · ');
    return h('button', { class: 'list-item', type: 'button', onclick: () => openCards([id]) },
      h('span', { class: 'li-q', text: d ? `${d.topic} (drill)` : plain(c.q) }),
      h('span', { class: 'li-meta', text: meta }));
  }

  // Open one or more cards right after the current one. A copy already waiting further down the
  // queue is removed, so the card isn't shown twice.
  function openCards(ids) {
    closeSheet();
    const entries = ids.filter(exists).map((id) => (Drills.get(id) ? drillEntry(id) : cardEntry(id)));
    if (!entries.length) return;
    const opening = new Set(entries.map((e) => e.id));
    for (let i = Q.entries.length - 1; i > Q.pos; i--) {
      const x = Q.entries[i];
      if (!opening.has(x.id)) continue;
      Q.entries.splice(i, 1);
      const node = rendered.get(x.uid);
      if (node) { node.remove(); rendered.delete(x.uid); }
    }
    Q.entries.splice(Q.pos + 1, 0, ...entries);
    layout();
    go(1);
  }

  function listView(ids, emptyText) {
    const wrap = h('div');
    if (!ids.length) { wrap.append(h('p', { class: 'empty', text: emptyText })); return wrap; }
    wrap.append(h('div', { class: 'btn-row', style: 'margin-bottom:16px' },
      h('button', { class: 'btn', type: 'button', onclick: () => openCards(ids) }, ids.length === 1 ? 'Study it' : `Study all ${ids.length}`)));
    wrap.append(h('div', { class: 'list' }, ids.map(itemButton)));
    return wrap;
  }

  const savedIds = () => Object.entries(S().saved).filter(([id]) => exists(id)).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  function missedIds() {
    const seen = new Set();
    const out = [];
    for (const m of S().missed) if (!seen.has(m.id) && exists(m.id)) { seen.add(m.id); out.push(m.id); }
    return out.slice(0, 50);
  }

  let searchIndex = null;
  let lastQuery = '';
  const norm = (t) => plain(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%$&.+-]+/g, ' ').trim();

  function searchCards(query) {
    const terms = norm(query).split(' ').filter(Boolean);
    if (!terms.length) return [];
    if (!searchIndex) {
      searchIndex = Deck.cards.map((c) => {
        const m = Deck.module(c.module);
        return { id: c.id, all: norm([c.q, c.a, c.topic, m.name, m.short, c.why, c.example, c.trap, c.formula].join(' ')), q: norm(c.q), topic: norm(c.topic), classic: !!c.classic };
      }).concat(Drills.list.map((d) => ({ id: d.id, all: norm([d.topic, Deck.module(d.module).name, 'drill'].join(' ')), q: norm(d.topic), topic: norm(d.topic), classic: false })));
    }
    return searchIndex
      .filter((x) => terms.every((t) => x.all.includes(t)))
      .map((x) => ({ id: x.id, score: terms.reduce((s, t) => s + (x.q.includes(t) ? 3 : 0) + (x.topic.includes(t) ? 2 : 0), 0) + (x.classic ? 0.5 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }

  function flagText() {
    const list = Object.entries(S().flags).sort((a, b) => b[1].t - a[1].t);
    const lines = [`Flagged cards (${list.length})`, ''];
    for (const [id, f] of list) {
      const c = Deck.card(id);
      const d = Drills.get(id);
      lines.push(`${id}${f.seed != null ? ` (seed ${f.seed})` : ''}: ${c ? plain(c.q) : d ? `${d.topic} drill` : 'no longer in the deck'}`);
      if (f.note && f.note.trim()) lines.push(`Note: ${f.note.trim()}`);
      lines.push('');
    }
    return lines.join('\n').trim();
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = h('textarea', { style: 'position:fixed;top:0;opacity:0' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (x) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  const figure = (n, label) => h('div', { class: 'figure' }, h('b', { text: String(n) }), h('span', { text: label }));

  const VIEWS = {
    main() {
      const p = prefs();
      const f = focus();
      return h('div', {},
        section('Track',
          seg('track', [['all', 'All'], ['ib', 'IB'], ['re', 'Real estate'], ['hotel', 'Hotels']], p.track, (v) => {
            p.track = v;
            Store.save();
            applyFilters();
          }),
          f && f.modules.length && note('Focus is on, so its modules decide what you see. Clear focus to use the track filter.')),
        section('Focus',
          note(f ? `On: ${focusSummary()}` : 'Off. Narrow the feed to a few modules, a level or interview classics.'),
          h('div', { class: 'btn-row', style: 'margin-top:8px' },
            h('button', { class: 'btn', type: 'button', onclick: () => pushView('focus') }, f ? 'Change focus' : 'Set focus'),
            f && h('button', { class: 'btn', type: 'button', onclick: () => { setFocus(null); closeSheet(); } }, 'Clear focus'))),
        section(null, h('div', { class: 'rows' },
          row('Search', null, () => { pushView('search'); $('#search-input').focus(); }),
          row('Saved', savedIds().length, () => pushView('saved')),
          row('Recently missed', missedIds().length, () => pushView('missed')),
          row('Stats', null, () => pushView('stats')),
          row('Flagged', Object.keys(S().flags).length, () => pushView('flagged')),
          row('Settings', null, () => pushView('settings')))),
        note(`${Deck.cards.length} cards · ${Drills.list.length} drill types · version ${APP_VERSION}`));
    },

    focus() {
      const f = prefs().focus || {};
      const draft = { modules: (f.modules || []).slice(), level: f.level || 0, classic: !!f.classic };
      const mods = section('Modules', note('Pick none to use every module in the current track.'));
      for (const t of Deck.tracks) {
        mods.append(h('p', { class: 'track-label', text: TRACK_LONG[t.id] }));
        for (const m of Deck.modules.filter((x) => x.track === t.id)) {
          const cards = byModule.get(m.id).length;
          const drills = drillsIn(m.id).length;
          const input = h('input', { type: 'checkbox', value: m.id, checked: draft.modules.includes(m.id), disabled: !cards && !drills });
          input.addEventListener('change', () => {
            draft.modules = input.checked ? draft.modules.concat(m.id) : draft.modules.filter((x) => x !== m.id);
          });
          const st = moduleStats(m.id);
          const meta = cards || drills ? [st.total && `${st.mastered}/${st.total} mastered`, drills && `${drills} drill${drills > 1 ? 's' : ''}`].filter(Boolean).join(' · ') : 'No cards yet';
          mods.append(h('label', { class: 'check-row' + (cards || drills ? '' : ' is-empty') }, input, h('span', { text: m.name }), h('span', { class: 'meta', text: meta })));
        }
      }
      return h('div', {},
        section('Level', seg('focus-level', [[0, 'Any'], [1, '1'], [2, '2'], [3, '3']], draft.level, (v) => { draft.level = Number(v); })),
        section(null, switchRow('Interview classics only', draft.classic, (on) => { draft.classic = on; })),
        mods,
        h('div', { class: 'btn-row sticky-actions' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { setFocus(draft); closeSheet(); } }, 'Start focus'),
          h('button', { class: 'btn', type: 'button', onclick: () => { setFocus(null); closeSheet(); } }, 'Clear focus')));
    },

    saved: () => listView(savedIds(), 'Nothing saved yet. Tap Save on any card to keep it here.'),
    missed: () => listView(missedIds(), 'Nothing missed recently.'),

    search() {
      const input = h('input', { type: 'search', id: 'search-input', placeholder: 'Search every card', autocomplete: 'off', enterkeyhint: 'search', 'aria-label': 'Search every card' });
      const results = h('div', { class: 'list' });
      const status = h('p', { class: 'm-note', role: 'status' });
      let timer = null;
      const run = () => {
        lastQuery = input.value;
        const found = searchCards(input.value);
        results.replaceChildren(...found.map((x) => itemButton(x.id)));
        status.textContent = input.value.trim() ? (found.length ? `${found.length}${found.length === 50 ? '+' : ''} ${found.length === 1 ? 'match' : 'matches'}` : 'No matches.') : '';
      };
      input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 120); });
      input.value = lastQuery;
      if (lastQuery) run();
      return h('div', {}, h('div', { class: 'field' }, input), status, results);
    },

    stats() {
      const today = S().log[dayKey(dayNum())] || 0;
      const qs = Deck.cards.filter((c) => c.type !== 'primer');
      const mastered = qs.filter((c) => { const r = S().cards[c.id]; return r && r.b >= MASTERED_BOX; }).length;
      const st = streak();
      const wrap = h('div', {},
        section(null,
          h('div', { class: 'figures' }, figure(today, 'graded today'), figure(st, st === 1 ? 'day in a row' : 'days in a row'), figure(mastered, `of ${qs.length} mastered`)),
          note(today >= STREAK_MIN ? 'Today counts toward your streak.' : `${STREAK_MIN - today} more today to count toward your streak (${STREAK_MIN} a day).`)));

      const weak = Deck.modules.map((m) => {
        const graded = questions(m.id).filter((c) => introduced(c.id));
        const shaky = graded.filter((c) => S().cards[c.id].b <= 1).length;
        return { m, graded: graded.length, shaky, share: graded.length ? shaky / graded.length : 0 };
      }).filter((x) => x.graded >= 3 && x.shaky > 0).sort((a, b) => b.share - a.share || b.shaky - a.shaky).slice(0, 3);
      wrap.append(section('Weakest modules', weak.length
        ? weak.map((x) => h('div', { class: 'weak-row' },
          h('div', {}, h('b', { text: x.m.short }), h('span', { text: `${x.shaky} of ${x.graded} graded cards still shaky (box 0 or 1)` })),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => { setFocus({ modules: [x.m.id], level: 0, classic: false }); closeSheet(); } }, 'Drill this')))
        : note('Grade a few cards in a module and the shakiest ones will show up here.')));

      const shelf = h('div', { class: 'shelf' });
      const closed = Object.entries(S().closed).filter(([id]) => Deck.module(id)).sort((a, b) => a[1].t - b[1].t);
      if (closed.length) {
        closed.forEach(([id, c]) => {
          const m = Deck.module(id);
          const when = new Date(c.t).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          shelf.append(h('div', { class: 'shelf-item' }, tombstone(m, c), h('p', { class: 'ts-meta', text: `${m.short} · ${when}` })));
        });
      } else {
        shelf.append(h('div', { class: 'shelf-item' },
          h('div', { class: 'tombstone is-ghost', 'aria-hidden': 'true' }, h('div', { class: 'ts-figure', text: '–' })),
          h('p', { class: 'ts-meta', text: 'Your first close' })));
      }
      wrap.append(section('Closed deals', closed.length ? null : note(`A module closes when 90% of its cards are mastered (box ${MASTERED_BOX} or higher) and it has at least ${CLOSE_MIN} cards. Each close adds a tombstone here.`), shelf));

      const mastery = section('Mastery by module');
      for (const t of Deck.tracks) {
        const mods = Deck.modules.filter((m) => m.track === t.id && questions(m.id).length);
        if (!mods.length) continue;
        mastery.append(h('p', { class: 'track-label', text: TRACK_LONG[t.id] }));
        mastery.append(h('div', { class: 'mastery' }, mods.map((m) => {
          const s = moduleStats(m.id);
          const pct = s.total ? Math.round((100 * s.mastered) / s.total) : 0;
          return h('div', { class: 'mastery-row' },
            h('span', {}, m.short, S().closed[m.id] && h('span', { class: 'tag', text: 'Closed' })),
            h('span', { class: 'num', text: `${s.mastered}/${s.total}` }),
            h('span', { class: 'meter', role: 'img', 'aria-label': `${pct}% mastered` }, h('i', { style: `width:${pct}%` })));
        })));
      }
      wrap.append(mastery);

      const drills = section('Drill types', h('div', { class: 'mastery' }, Drills.list.map((d) => {
        const r = S().drills[d.id];
        return h('div', { class: 'mastery-row' }, h('span', { text: d.topic }), h('span', { class: 'num', text: r && r.b != null ? `Box ${r.b}` : 'Not tried' }));
      })));
      wrap.append(drills);
      return wrap;
    },

    flagged() {
      const list = Object.entries(S().flags).sort((a, b) => b[1].t - a[1].t);
      if (!list.length) return h('div', {}, h('p', { class: 'empty', text: 'No flags. Use Flag in Explain on any card that looks wrong or unclear.' }));
      const status = h('p', { class: 'm-note', role: 'status' });
      const copy = h('button', { class: 'btn', type: 'button' }, 'Copy');
      copy.addEventListener('click', async () => {
        const ok = await copyText(flagText());
        status.textContent = ok ? 'Copied. Paste it into a message to Claude to get the cards fixed.' : "Couldn't copy. Select the text below instead.";
        if (!ok) wrap.append(h('pre', { style: 'white-space:pre-wrap;font-size:13px;user-select:text', text: flagText() }));
      });
      const wrap = h('div', {}, h('div', { class: 'btn-row' }, copy), status, h('div', { class: 'list' }, list.map(([id, f]) => {
        const c = Deck.card(id);
        const d = Drills.get(id);
        const item = h('div', { class: 'flag-item' },
          h('span', { class: 'li-id', text: `${id}${f.seed != null ? ` · seed ${f.seed}` : ''}` }),
          h('span', { class: 'li-q', text: c ? plain(c.q) : d ? `${d.topic} drill` : 'No longer in the deck' }),
          f.note && f.note.trim() && h('span', { class: 'li-note', text: f.note.trim() }),
          h('button', { class: 'text-btn', type: 'button', onclick: () => { delete S().flags[id]; Store.save(); showView('flagged'); } }, 'Remove flag'));
        return item;
      })));
      return wrap;
    },

    settings(opts) {
      const p = prefs();
      const wrap = h('div', {},
        section('Drills in the feed',
          seg('drill-every', [[0, 'Off'], [4, 'Every 4'], [6, 'Every 6'], [10, 'Every 10']], p.drillEvery, (v) => {
            p.drillEvery = Number(v);
            Store.save();
            resetAhead();
            ensureAhead();
            layout();
          }),
          note('Drills generate new numbers every time they appear.')),
        section('Text size', seg('text-size', [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']], p.size, (v) => {
          p.size = v;
          Store.save();
          applySize();
        })),
        section('Theme', seg('theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], p.theme || 'system', (v) => {
          p.theme = v;
          Store.save();
          applyTheme();
        })),
        section(null, switchRow('Go to the next card after grading', p.advance, (on) => { p.advance = on; Store.save(); })));

      const progress = section('Progress',
        note('Progress is saved in this browser, on this device only. Export a backup to keep it safe or move it to another device, then import it there.'),
        h('div', { class: 'btn-row', style: 'margin-top:12px' },
          h('button', { class: 'btn', type: 'button', onclick: exportProgress }, 'Export'),
          h('button', { class: 'btn', type: 'button', onclick: () => $('#import-file').click() }, 'Import'),
          h('button', { class: 'btn', type: 'button', onclick: resetProgress }, 'Reset')));
      if (opts.pending) {
        const { data, exported } = opts.pending;
        const graded = Object.values(data.cards).filter((r) => r.b != null).length;
        progress.append(h('div', { class: 'm-sec', style: 'margin-top:16px' },
          note(`Backup${exported ? ` from ${longDate(exported)}` : ''}: ${graded} cards graded. Merge keeps the most recent grade for each card from either device. Replace swaps this device's progress for the backup.`),
          h('div', { class: 'btn-row', style: 'margin-top:12px' },
            h('button', { class: 'btn btn-primary', type: 'button', onclick: () => finishImport(mergeProgress(S(), data)) }, 'Merge'),
            h('button', { class: 'btn', type: 'button', onclick: () => finishImport({ ...data, settings: S().settings }) }, 'Replace'),
            h('button', { class: 'btn', type: 'button', onclick: () => showView('settings') }, 'Cancel'))));
      }
      wrap.append(progress);

      const keys = [['J or ↓', 'Next card'], ['K or ↑', 'Previous card'], ['Space', 'Reveal'], ['1, 2, 3', 'Missed it, Got it, Too easy'], ['E', 'Explain'], ['S', 'Save'], ['F', 'Flag'], ['/', 'Search'], ['Esc', 'Close a sheet']];
      wrap.append(section('Keyboard shortcuts', h('table', { class: 'keys' }, h('tbody', {}, keys.map(([k, v]) => h('tr', {}, h('td', { text: k }), h('td', { text: v })))))));
      wrap.append(section('About', note(`Version ${APP_VERSION}. ${Deck.cards.length} cards and ${Drills.list.length} drill types. Leitner boxes 0–6 come back after 0, 1, 3, 7, 16, 35 and 90 days; box ${MASTERED_BOX} and up counts as mastered.`)));
      return wrap;
    }
  };

  // ---------------------------------------------------------------- export, import, reset

  function exportProgress() {
    Store.flush();
    const payload = { app: 'technicals', schema: 1, version: APP_VERSION, exported: new Date().toISOString(), progress: S() };
    const name = `technicals-progress-${dayKey(dayNum())}.json`;
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    let file = null;
    try { file = new File([blob], name, { type: 'application/json' }); } catch (e) { file = null; }
    // On phones the share sheet is the reliable way to save a file (Save to Files, AirDrop).
    if (media('(pointer: coarse)') && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Technicals progress' }).catch((err) => { if (!err || err.name !== 'AbortError') download(blob, name); });
    } else {
      download(blob, name);
    }
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('Progress exported');
  }

  $('#import-file').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    let payload = null;
    try { payload = JSON.parse(await file.text()); } catch (e) { payload = null; }
    if (!payload || payload.app !== 'technicals' || !payload.progress || typeof payload.progress !== 'object') {
      toast("That file isn't a Technicals backup.");
      return;
    }
    if (openSheetId !== 'menu') openMenu('settings', { pending: { data: Store.normalize(payload.progress), exported: payload.exported } });
    else showView('settings', { pending: { data: Store.normalize(payload.progress), exported: payload.exported } });
  });

  // For each card keep whichever device graded it last; union everything else.
  function mergeProgress(a, b) {
    const out = JSON.parse(JSON.stringify(a));
    for (const k of ['cards', 'drills']) {
      for (const [id, r] of Object.entries(b[k])) {
        const l = out[k][id];
        const newer = !l || (r.t || 0) > (l.t || 0) ? r : l;
        out[k][id] = { ...newer, s: Math.max((l && l.s) || 0, r.s || 0) };
      }
    }
    for (const [id, t] of Object.entries(b.saved)) out.saved[id] = Math.min(out.saved[id] || Infinity, t);
    for (const [id, f] of Object.entries(b.flags)) if (!out.flags[id] || (f.t || 0) > (out.flags[id].t || 0)) out.flags[id] = f;
    const seen = new Set();
    out.missed = out.missed.concat(b.missed).sort((x, y) => y.t - x.t)
      .filter((m) => { const k = m.id + '|' + m.t; if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, MISSED_KEEP);
    for (const [d, n] of Object.entries(b.log)) out.log[d] = Math.max(out.log[d] || 0, n);
    for (const [m, c] of Object.entries(b.closed)) if (!out.closed[m] || c.t < out.closed[m].t) out.closed[m] = c;
    return out;
  }

  function finishImport(data) {
    Store.data = Store.normalize(data);
    Store.save();
    restartFeed();
    showView('settings');
    toast('Progress imported');
  }

  function resetProgress() {
    if (!window.confirm("Reset all progress on this device? This can't be undone. Export first if you want a copy.")) return;
    const keep = prefs();
    Store.data = Store.blank();
    Store.data.settings = keep;
    Store.save();
    restartFeed();
    showView('settings');
    toast('Progress reset');
  }

  function restartFeed() {
    applyTheme();
    applySize();
    resetAhead();
    Q.served = new Set(Q.entries.filter((e) => e.kind === 'card').map((e) => e.id));
    ensureAhead();
    layout();
    updateToday();
    updateTopbar();
  }

  // ---------------------------------------------------------------- toast, settings, service worker

  let toastTimer = null;
  function toast(text, action) {
    const t = $('#toast');
    clearTimeout(toastTimer);
    t.replaceChildren(h('span', { text }));
    if (action) t.append(h('button', { class: 'text-btn', type: 'button', onclick: action.run }, action.label));
    t.hidden = false;
    if (!action) toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function applySize() {
    document.documentElement.dataset.size = prefs().size || 'm';
    rendered.forEach((node) => fit(node));
  }

  // System follows the device; Light or Dark overrides it (index.html applies it before first paint too).
  const THEME_COLORS = { light: '#F7F7F4', dark: '#17191C' };
  function applyTheme() {
    const t = prefs().theme;
    const forced = t === 'light' || t === 'dark' ? t : null;
    const root = document.documentElement;
    if (forced) root.dataset.theme = forced;
    else delete root.dataset.theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.content = THEME_COLORS[forced || (m.media.includes('dark') ? 'dark' : 'light')];
    });
  }

  function registerSW() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) location.reload(); });
    navigator.serviceWorker.register('sw.js').then((reg) => {
      const ready = (worker) => toast('Update ready', {
        label: 'Reload',
        run: () => {
          reloading = true;
          Store.flush();
          worker.postMessage('skipWaiting');
          setTimeout(() => location.reload(), 3000);
        }
      });
      if (reg.waiting && navigator.serviceWorker.controller) ready(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ready(w); });
      });
      // Installed apps can stay open for days; check for a new version when brought back.
      let last = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - last > 60000) {
          last = Date.now();
          reg.update().catch(() => {});
        }
      });
    }).catch((err) => console.warn('Service worker registration failed', err));
  }

  // ---------------------------------------------------------------- keyboard

  document.addEventListener('keydown', (ev) => {
    if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const target = ev.target;
    if (ev.key === 'Escape') {
      if (!$('#closing').hidden) { hideClosing(); ev.preventDefault(); return; }
      if (openSheetId) { closeSheet(); ev.preventDefault(); }
      return;
    }
    if (target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return;
    // Enter activates any focused button. Space does too inside sheets, but in the feed and top bar
    // Space always means Reveal, so a button left focused by a click can't be triggered by accident.
    const onControl = target.closest && target.closest('button, a, label');
    if (onControl && (ev.key === 'Enter' || (ev.key === ' ' && target.closest('.sheet, .closing')))) return;
    if (!$('#closing').hidden) return;
    const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;

    if (openSheetId) {
      if (key === 'e' && openSheetId === 'explain') { closeSheet(); ev.preventDefault(); }
      else if (['j', 'k', 'ArrowDown', 'ArrowUp'].includes(key) && openSheetId === 'explain') {
        closeSheet();
        go(key === 'j' || key === 'ArrowDown' ? 1 : -1);
        ev.preventDefault();
      }
      return;
    }

    const e = current();
    switch (key) {
      case 'j': case 'ArrowDown': go(1); break;
      case 'k': case 'ArrowUp': go(-1); break;
      case ' ': reveal(e); break;
      case '1': case '2': case '3': grade(e, Number(key) - 1); break;
      case 'e': openExplain(e); break;
      case 's': toggleSave(e); break;
      case 'f': openExplain(e, { flag: true }); break;
      case '/': openMenu('search'); break;
      default: return;
    }
    ev.preventDefault();
  });

  // ---------------------------------------------------------------- start

  $('#menu-btn').addEventListener('click', () => openMenu('main'));
  $('#filter-btn').addEventListener('click', () => openMenu('main'));
  $('#today-btn').addEventListener('click', () => openMenu('stats'));
  $('#search-btn').addEventListener('click', () => openMenu('search'));

  new ResizeObserver(() => {
    const before = H;
    measure();
    if (H && H !== before) {
      layout();
      feed.scrollTop = Q.pos * H;
      rendered.forEach((node) => fit(node));
    }
  }).observe(feed);

  window.addEventListener('pagehide', () => Store.flush());
  // Another tab saved progress: adopt it so the two tabs don't overwrite each other.
  window.addEventListener('storage', (ev) => {
    if (ev.key !== STORE_KEY || !ev.newValue) return;
    let incoming;
    try { incoming = Store.normalize(JSON.parse(ev.newValue)); } catch (e) { return; }
    if (Store.timer) {
      // This tab has unsaved changes (a note being typed, seen times): combine both, then save.
      Store.data = mergeProgress(S(), incoming);
      Store.save();
    } else {
      Store.data = incoming;
    }
    updateToday();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') Store.flush();
    else updateToday();
  });

  Store.load();
  applyTheme();
  applySize();
  measure();
  ensureAhead();
  layout();
  markSeen(current());
  updateTopbar();
  updateToday();
  registerSW();

  if (location.hash === '#preview-close') showClosing('re-debt', { t: Date.now(), mastered: 52, total: 55 });
  const problems = Deck.problems.concat(Drills.problems);
  if (problems.length) console.warn('Deck problems:', problems);
})();
