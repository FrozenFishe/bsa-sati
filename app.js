/* Sati — Meditate & Study. Buddhist Society of Australia.
   Everything is stored on the device (localStorage); there is no server. */
(() => {
  'use strict';

  // Native (iOS app) bridge; every call is optional so the web build keeps working.
  const CAP = window.Capacitor;
  const NATIVE = !!CAP?.isNativePlatform?.();
  const plug = (name) => (NATIVE ? CAP.Plugins?.[name] || CAP.registerPlugin?.(name) : null);
  // In the iOS app, stop pinch and double-tap zoom so the layout can't be pushed off-screen.
  if (NATIVE) document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  const haptic = (kind) => { try { const H = plug('Haptics'); if (H) kind === 'success' ? H.notification({ type: 'SUCCESS' }) : H.impact({ style: 'LIGHT' }); } catch { /* no haptics */ } };
  const SCREEN_SRC = NATIVE ? 'Settings \u203a Screen Time' : 'Settings \u203a Screen Time (iPhone) or Digital Wellbeing (Android)';

  const ORG = {
    name: 'Buddhist Society of Australia',
    abn: '35 892 665 974',
    site: 'https://buddhistsocietiesofaustralia.org/',
    give: 'https://buddhistsocietiesofaustralia.org/#give',
    contact: 'https://buddhistsocietiesofaustralia.org/contact/',
    email: 'info@buddhistsocietiesofaustralia.org',
    acnc: 'https://www.acnc.gov.au/charity/charities?search=35892665974',
    abr: 'https://abr.business.gov.au/ABN/View?abn=35892665974'
  };

  // Apps the doorway can stand in front of. Tiles are generic letters, not brand logos.
  const APPS = [
    { id: 'instagram', name: 'Instagram', scheme: 'instagram://', tile: '#d6249f' },
    { id: 'tiktok', name: 'TikTok', scheme: 'snssdk1233://', tile: '#161616' },
    { id: 'youtube', name: 'YouTube', scheme: 'youtube://', tile: '#e62117' },
    { id: 'x', name: 'X', scheme: 'twitter://', tile: '#161616' },
    { id: 'facebook', name: 'Facebook', scheme: 'fb://', tile: '#1877f2' },
    { id: 'reddit', name: 'Reddit', scheme: 'reddit://', tile: '#ff4500' },
    { id: 'snapchat', name: 'Snapchat', scheme: 'snapchat://', tile: '#e8c900' },
    { id: 'games', name: 'Games', scheme: '', tile: '#7b5cd6' },
    { id: 'news', name: 'News', scheme: '', tile: '#4b6584' },
    { id: 'other', name: 'Other', scheme: '', tile: '#8a8a8a' }
  ];
  // Line icons in the same style as the tab bar.
  const svg = (d, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    lotus: '<path d="M12 20c-4.5 0-8-2.2-9-5.5 3 0 5.5 1 7 2.6M12 20c4.5 0 8-2.2 9-5.5-3 0-5.5 1-7 2.6M12 20c-2.6-2-3.5-5-3.2-8.5C10 12.6 11.3 14 12 16c.7-2 2-3.4 3.2-4.5.3 3.5-.6 6.5-3.2 8.5M12 16c-1-3-1-6.5 0-10 1 3.5 1 7 0 10"/>',
    pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>',
    play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.6A1 1 0 0 0 8 5.5z"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9.5 6l6 6-6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    check: '<path d="M5.5 12.5l4 4L18.5 7.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    book: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    person: '<circle cx="12" cy="6" r="2.5"/><path d="M12 9.5c-2 0-3.5 1.5-3.5 3.5V16h7v-3c0-2-1.5-3.5-3.5-3.5zM5.5 20c1.2-1.6 3.6-2.5 6.5-2.5s5.3.9 6.5 2.5"/>',
    people: '<circle cx="12" cy="8" r="2.5"/><circle cx="5.5" cy="10" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M8 18.5a4 4 0 0 1 8 0M2.5 18.5a3.5 3.5 0 0 1 5-2.8M21.5 18.5a3.5 3.5 0 0 0-5-2.8"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/>',
    moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    plus: '<path d="M12 5.5v13M5.5 12h13"/>',
    seed: '<path d="M12 4c4 4 5 8.5 2.5 12.5S7 19 7.5 14 10 7 12 4z"/>',
    drop: '<path d="M12 3.5c3.5 4.3 6 7.6 6 10.5a6 6 0 0 1-12 0c0-2.9 2.5-6.2 6-10.5z"/>',
    sprout: '<path d="M12 20v-8M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 12c0-4 3-6 7-6 0 4-3 6-7 6z"/>',
    leaf: '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8-8"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4m6-4v4"/>',
    chart: '<path d="M6 20v-6M12 20V9M18 20V4"/>',
    sparkle: '<path d="M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7z"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
    wheel: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2"/><path d="M12 4.5v15M4.5 12h15M6.7 6.7l10.6 10.6M17.3 6.7 6.7 17.3"/>',
    stones: '<ellipse cx="12" cy="18" rx="7" ry="2.5"/><ellipse cx="12" cy="12.5" rx="5" ry="2.2"/><ellipse cx="12" cy="7.5" rx="3" ry="1.8"/>'
  };
  const icon = (n, cls = 'i') => svg(ICON[n], cls);
  const ico = (n, tone = '') => `<i class="ico ${tone}">${icon(n)}</i>`;
  // Clay artwork of Padma, made on the studio GPUs (see art/).
  const img = (name) => `<img src="art/${name}.webp" alt="" decoding="async">`;
  const appById = (id) => APPS.find((a) => a.id === id);
  const tile = (id, size = 30) => { const a = appById(id) || APPS.at(-1); return `<span class="apptile" style="--t:${a.tile};width:${size}px;height:${size}px;font-size:${size * 0.5}px" title="${a.name}">${a.name[0]}</span>`; };

  const PRESETS = [
    { preset: 'morning', name: 'Morning Sit', sub: 'Sit before you scroll', ic: 'lotus', tone: '', start: '05:00', end: '09:00', days: [0, 1, 2, 3, 4, 5, 6], untilSit: true },
    { preset: 'study', name: 'Study Hall', sub: 'Space for focused work', ic: 'book', tone: 'soft-sage', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
    { preset: 'night', name: 'Night Rest', sub: 'Let the day settle', ic: 'moon', tone: 'soft-rose', start: '21:30', end: '06:30', days: [0, 1, 2, 3, 4, 5, 6] },
    { preset: 'retreat', name: 'Weekend Retreat', sub: 'A day of practice', ic: 'sun', tone: '', start: '00:00', end: '23:59', days: [0, 6] }
  ];

  const PROFILES = {
    morning: { name: 'The Dawn Reacher', hindrance: 'Sloth and torpor', text: 'The phone is the first thing you touch. Before the mind has even woken, it is already being filled. A few breaths before the screen can change the tone of the whole day.' },
    study: { name: 'The Wandering Student', hindrance: 'Restlessness and worry', text: 'Focus slips the moment study gets hard, and the feed is always one tap away. Short, timed sessions with an honest count of each wander will train the mind to return.' },
    evening: { name: 'The Restless Evening', hindrance: 'Sensual desire', text: 'After the day ends, the scroll fills the space where rest could be. An evening sit, even a short one, gives the mind somewhere kinder to land.' },
    night: { name: 'The Night Scroller', hindrance: 'Restlessness and worry', text: 'Late-night scrolling borrows from tomorrow’s clarity. A loving-kindness practice in bed and a mindful pause before opening the apps can return the night to sleep.' }
  };

  /* ---------- storage ---------- */
  const KEY = 'sati.v1';
  const defaults = () => ({
    onboarded: false,
    profile: { hours: 4, age: 30, scroll: 'evening', why: 'calm' },
    goals: { meditate: 10, study: 25, screen: 3 },
    days: {},
    lessons: {},
    theme: 'auto',
    bell: true,
    apps: ['instagram', 'tiktok', 'youtube', 'x'],
    guards: [],
    reminders: { morning: '07:00', evening: '19:30' },
    notify: false,
    health: false,
    lotus: { stage: 0, planted: null, checked: null, grownOn: null, missed: 0, bloomed: 0, news: null, seen: null },
    created: Date.now()
  });
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = defaults(); }
  S.lotus = Object.assign(defaults().lotus, S.lotus);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };

  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const blankDay = () => ({ med: 0, study: 0, present: 0, mindful: 0, wanders: 0, lessons: 0, sessions: 0, screen: null, pickups: null, apps: {}, checks: {} });
  const day = (k = dayKey()) => (S.days[k] = Object.assign(blankDay(), S.days[k]));
  const peek = (k) => S.days[k] && Object.assign(blankDay(), S.days[k]);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`);
  const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const practised = (k) => { const d = peek(k); return !!d && (d.med > 0 || d.study > 0 || d.lessons > 0); };

  /* ---------- daily lotus: a 5-minute sit waters it, missed days wilt it ---------- */
  const LOTUS_MIN = 5;
  const LOTUS_NAMES = ['Seed', 'Planted', 'Waking', 'Sprout', 'First leaf', 'Leaves', 'Stem', 'Bud', 'Blushing bud', 'Opening', 'Bloom'];
  const watered = (k) => (peek(k)?.med || 0) >= LOTUS_MIN;
  const nextKey = (k) => { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + 1)); };
  function streak() {
    let n = 0, d = new Date();
    if (!watered(dayKey(d))) d = addDays(d, -1);
    while (watered(dayKey(d))) { n++; d = addDays(d, -1); }
    return n;
  }
  // Settles every day since the last check, so the result doesn't depend on when the app was open.
  function tendLotus() {
    const L = S.lotus, today = dayKey(), yest = dayKey(addDays(new Date(), -1)), growing = () => L.stage > 0 && L.stage < 10;
    const grow = (k) => { L.stage++; L.grownOn = k; L.missed = 0; if (L.stage === 10) { L.bloomed++; L.news = 'bloomed'; } };
    // Day keys are zero-padded, so comparing strings compares dates.
    let k = [L.checked && nextKey(L.checked), L.planted].filter(Boolean).sort().at(-1);
    for (; growing() && k && k <= yest; k = nextKey(k)) {
      if (watered(k)) { if (L.grownOn !== k) grow(k); else L.missed = 0; }
      else if (++L.missed >= 3) { L.stage = 0; L.news = 'withered'; }
      else { L.stage = Math.max(1, L.stage - 1); L.news = 'wilted'; }
    }
    if (growing() && watered(today) && L.grownOn !== today && today > L.checked) grow(today); // a date already settled can't grow again
    if (!L.checked || L.checked < yest) L.checked = yest;
    save();
  }
  function plantLotus() {
    Object.assign(S.lotus, { stage: 1, planted: dayKey(), grownOn: null, missed: 0, news: null, checked: dayKey(addDays(new Date(), -1)) });
    tendLotus();
  }

  /* ---------- guards (scheduled doorways) ---------- */
  const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  function guardActive(g, now = new Date()) {
    if (!g.on) return false;
    if (g.untilSit && day().med >= S.goals.meditate) return false;
    const t = now.getHours() * 60 + now.getMinutes(), s = mins(g.start), e = mins(g.end), dow = now.getDay();
    if (s <= e) return g.days.includes(dow) && t >= s && t <= e;
    return (g.days.includes(dow) && t >= s) || (g.days.includes((dow + 6) % 7) && t <= e); // overnight
  }
  const guardFor = (appId) => S.guards.find((g) => guardActive(g) && (!g.apps?.length || g.apps.includes(appId)));
  function daysText(ds) {
    const k = [...ds].sort().join('');
    if (k === '0123456') return 'Every day';
    if (k === '12345') return 'Weekdays';
    if (k === '06') return 'Weekends';
    return [...ds].sort().map((d) => DAYN[d]).join(', ');
  }

  /* ---------- sound ---------- */
  let ac;
  function bell(strength = 1) {
    if (!S.bell) return;
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const now = ac.currentTime, f0 = 262;
      const master = ac.createGain(); master.gain.value = 0.22 * strength; master.connect(ac.destination);
      [[1, 1, 7], [1.003, 0.5, 7], [2.71, 0.45, 4], [5.15, 0.22, 2.2], [8.43, 0.1, 1.2]].forEach(([r, a, dec]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f0 * r;
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(a, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dec);
        o.connect(g); g.connect(master); o.start(now); o.stop(now + dec + 0.1);
      });
    } catch { /* audio unavailable */ }
  }
  let wake;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator) wake = await navigator.wakeLock.request('screen');
      else if (!on && wake) { await wake.release(); wake = null; }
    } catch { /* not permitted */ }
  }

  function toast(msg) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2800);
  }

  function sheet(html, onReady) {
    const d = document.createElement('dialog'); d.className = 'sheet'; d.innerHTML = `<form method="dialog" class="stack">${html}</form>`;
    document.body.appendChild(d); d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.showModal(); onReady?.(d); return d;
  }
  // A sheet of chips; calls done(number) with the one picked.
  function pickSheet(title, opts, cur, done) {
    sheet(`<h2>${title}</h2><div class="chips">${opts.map(([v, l]) => `<button class="chip" value="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>
      <button class="btn ghost block" value="cancel">Cancel</button>`, (dlg) => dlg.addEventListener('close', () => {
      if (dlg.returnValue && dlg.returnValue !== 'cancel') done(Number(dlg.returnValue));
    }));
  }

  function applyTheme() {
    const r = document.documentElement;
    if (S.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = S.theme;
  }

  /* ---------- shared pieces ---------- */
  let view = $('#view');
  let cleanup = null;
  const orgFooter = () => `<footer class="org">${ORG.name}<br>ACNC registered charity · ABN ${ORG.abn}</footer>`;
  const nextLesson = () => LESSONS.find((l) => !S.lessons[l.id]) || LESSONS[0];
  const wordmark = `<a class="wordmark" href="#today" aria-label="Sati, home">sati${icon('lotus')}</a>`;
  const gearBtn = `<a class="iconbtn" href="#settings" aria-label="Settings">${icon('gear')}</a>`;
  const header = (right = gearBtn) => `<div class="top">${wordmark}${right}</div>`;
  const titleBar = (back, label, title, right = '<span></span>') => `<div class="top"><a class="iconbtn bare" href="${back}" aria-label="${label}">${icon('back')}</a><span class="title">${title}</span>${right}</div>`;
  const doneMark = `<span class="donecheck" role="img" aria-label="Done">${icon('check')}</span>`;
  // A list row: a link (href) or a button (act), with an icon circle, a title, a subtitle and a chevron.
  const row = (o) => {
    const open = o.href ? `<a class="item ${o.cls || ''}" href="${o.href}">` : `<button type="button" class="item ${o.cls || ''}" data-act="${o.act}"${o.v ? ` data-v="${o.v}"` : ''}${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}>`;
    return `${open}${ico(o.ic, o.tone)}<span class="t"><b>${o.title}</b>${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</span>${o.end ?? icon('chev')}${o.href ? '</a>' : '</button>'}`;
  };
  const LESSON_ICON = { refuges: 'people', truths: 'lotus', path: 'wheel', precepts: 'stones', marks: 'circle', brahmaviharas: 'heart', anapanasati: 'leaf', hindrances: 'shield' };
  const TERM_ICON = { Buddha: 'person', Dhamma: 'wheel', Sangha: 'people' };
  const TECH_ICON = { breath: ['lotus', ''], metta: ['heart', 'soft-rose'], body: ['person', 'soft-sage'], silent: ['circle', ''] };

  const V = {};

  /* ----- Home: the daily lotus ----- */
  const LOTUS_NEWS = { wilted: 'Your lotus missed its water and lost a stage.', withered: 'Your lotus withered after three dry days. Plant a new seed when you’re ready.', bloomed: 'Your lotus has bloomed. Sādhu!' };
  V.today = () => {
    const L = S.lotus, d = day(), st = streak(), today = dayKey(), left = Math.max(0, Math.ceil(LOTUS_MIN - d.med));
    const growing = L.stage > 0 && L.stage < 10;
    const status = growing ? (left ? `Needs water: ${left} more minute${left === 1 ? '' : 's'} today` : 'Watered today')
      : L.stage ? 'Fully bloomed. Plant a new seed to begin again.' : 'Plant it, then sit 5 minutes a day to help it grow.';
    const week = [...Array(7)].map((_, i) => {
      const dt = addDays(new Date(), i - 6), k = dayKey(dt), p = peek(k);
      const s = watered(k) ? 'wet' : L.planted && k >= L.planted && k < today ? 'dry' : '';
      const care = p && (p.study > 0 || p.lessons > 0);
      return `<li class="${s}" aria-label="${DAYN[dt.getDay()]}: ${s === 'wet' ? 'watered' : s === 'dry' ? 'missed' : 'no sit'}${care ? ', extra care' : ''}"><span>${DAYN[dt.getDay()][0]}</span><i></i>${care ? icon('drop', 'i care') : ''}</li>`;
    }).join('');
    return `<div class="stack lotushome">
      ${header()}
      <figure class="lotus ${L.missed ? 'wilt' : ''} ${L.grownOn === today && L.seen !== today ? 'grow' : ''}">${img('lotus-' + L.stage)}</figure>
      <div class="center">
        <h1>${L.stage ? `Stage ${L.stage} of 10 · ${LOTUS_NAMES[L.stage]}` : 'A seed in your hand'}</h1>
        <div class="lotusbar" role="img" aria-label="${L.stage} of 10 stages">${[...Array(10)].map((_, i) => `<i class="${i < L.stage ? 'on' : ''}"></i>`).join('')}</div>
        ${L.news ? `<p class="news">${LOTUS_NEWS[L.news]}</p>` : ''}
        <p class="lead">${status}</p>
        ${st > 1 ? `<p class="small muted">${st} days in a row</p>` : ''}
      </div>
      ${growing ? `<button class="btn block" data-act="quick" data-v="${LOTUS_MIN}">${icon('drop')}${left ? `Water your lotus · ${LOTUS_MIN} min` : 'Sit again'}</button>`
        : `<button class="btn block" data-act="plant">${icon('seed')}${L.stage ? 'Plant a new seed' : 'Plant your seed'}</button>`}
      <ol class="lotusweek">${week}</ol>
      ${L.bloomed ? `<p class="small center muted">${icon('lotus')} ${L.bloomed} lotus${L.bloomed === 1 ? '' : 'es'} bloomed</p>` : ''}
      ${orgFooter()}
    </div>`;
  };
  V.today.bind = () => {
    const L = S.lotus;
    if (L.news || L.grownOn === dayKey()) { L.news = null; L.seen = dayKey(); save(); } // news and the grow animation show once
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'quick') runSession({ kind: 'med', minutes: Number(b.dataset.v), tech: TECHNIQUES[0], interval: 0 });
      if (b.dataset.act === 'plant') { haptic('success'); plantLotus(); render(); }
    });
  };

  function checkIn() {
    const d = day(), list = [...new Set([...S.apps, ...Object.keys(d.apps)])];
    const hrs = d.screen == null ? '' : Math.floor(d.screen), mn = d.screen == null ? '' : Math.round((d.screen % 1) * 60);
    sheet(`<h2>From Screen Time</h2><p class="small muted">Open ${SCREEN_SRC} and copy today\u2019s numbers.</p>
      <div class="grid3"><label class="field"><span>Hours</span><input type="number" inputmode="numeric" min="0" max="24" name="h" value="${hrs}"></label>
      <label class="field"><span>Minutes</span><input type="number" inputmode="numeric" min="0" max="59" name="m" value="${mn}"></label>
      <label class="field"><span>Pickups</span><input type="number" inputmode="numeric" min="0" max="999" name="p" value="${d.pickups ?? ''}"></label></div>
      <h3>Most used (minutes)</h3>
      ${list.map((id) => `<label class="row approw">${tile(id, 28)}<span style="flex:1">${esc(appById(id)?.name || id)}</span><input type="number" inputmode="numeric" min="0" max="1440" name="a-${id}" value="${d.apps[id] || ''}" style="width:90px"></label>`).join('')}
      <div class="row"><button class="btn ghost" style="flex:1" value="cancel">Cancel</button><button class="btn" style="flex:1" value="save">Save</button></div>`, (dlg) => {
      dlg.addEventListener('close', () => {
        if (dlg.returnValue !== 'save') return;
        const f = new FormData(dlg.querySelector('form')), n = (k) => { const v = f.get(k); return v === '' || v == null ? null : Math.max(0, Number(v)); };
        const h = n('h'), m = n('m');
        d.screen = h == null && m == null ? null : Math.round(((h || 0) + (m || 0) / 60) * 100) / 100;
        d.pickups = n('p');
        list.forEach((id) => { const v = n(`a-${id}`); if (v) d.apps[id] = v; else delete d.apps[id]; });
        save(); render(); toast('Saved. Padma is listening.');
      });
    });
  }

  /* ----- Sit (meditation) ----- */
  let medPick = { tech: 'breath', min: null, interval: 0 };
  V.sit = () => {
    medPick.min ??= S.goals.meditate;
    const quick = [5, 10, 15, 20], custom = !quick.includes(medPick.min);
    return `<div class="stack">
      ${header('')}
      <div class="hero split"><div class="headline"><h1>Come back to your breath.</h1><p class="lead">A calmer mind. A kinder day.</p></div>${img('sit')}</div>
      <h2>Choose a practice</h2>
      <div class="grid2">${TECHNIQUES.map((t) => `<button class="opt" data-act="tech" data-v="${t.id}" aria-pressed="${medPick.tech === t.id}">${ico(...TECH_ICON[t.id])}<span class="t"><b>${t.name}</b><span>${t.line}</span></span></button>`).join('')}</div>
      <h2 class="sect">How long?</h2>
      <div class="chips">${quick.map((m) => `<button class="chip" data-act="dur" data-v="${m}" aria-pressed="${medPick.min === m}">${m} min</button>`).join('')}</div>
      <button class="setrow" data-act="custom">${icon('clock')}<span class="t">Custom duration</span><span class="v">${custom ? (medPick.min ? `${medPick.min} min` : 'Open') : ''}</span>${icon('chev')}</button>
      <button class="setrow line" data-act="interval">${icon('bell')}<span class="t">Interval bell</span><span class="v">${medPick.interval ? `Every ${medPick.interval} minute${medPick.interval > 1 ? 's' : ''}` : 'Off'}</span>${icon('chev')}</button>
      <button class="btn block" data-act="start">${medPick.min ? `Begin · ${medPick.min} min` : 'Begin open sit'}${icon('chev')}</button>
      <p class="small muted center">A bell marks the beginning and end. Your screen stays on while you sit.</p>
    </div>`;
  };
  V.sit.bind = () => {
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act, v = b.dataset.v;
      if (a === 'tech') medPick.tech = v;
      if (a === 'dur') medPick.min = Number(v);
      if (a === 'custom') return pickSheet('Custom duration', [[0, 'Open'], [30, '30 min'], [45, '45 min'], [60, '60 min']], medPick.min, (m) => { medPick.min = m; render(); });
      if (a === 'interval') return pickSheet('Interval bell', [[0, 'Off'], [1, '1 min'], [5, '5 min'], [10, '10 min']], medPick.interval, (m) => { medPick.interval = m; render(); });
      if (a === 'start') return runSession({ kind: 'med', minutes: medPick.min, tech: TECHNIQUES.find((t) => t.id === medPick.tech), interval: medPick.interval });
      render();
    });
  };

  /* ----- immersive session: big timer, a cue in the glow, then the "You made space" screen ----- */
  const mmss = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
  function runSession(o) {
    // o: { kind: 'med'|'study', minutes (0 = open), tech?, interval?, task?, breakMin? }
    const began = dayKey(); // a sit past midnight counts for the day it began
    bell(); keepAwake(true);
    document.body.classList.add('immersive');
    const open = !o.minutes, total = o.minutes * 60, startedAt = Date.now();
    let pausedAt = null, pausedFor = 0, lastInt = 0, cueIdx = -1, done = false, away = false, wanders = 0;
    const cues = o.tech?.cues || [];
    view.innerHTML = `<div class="session">
      <div class="session-art">${img('session')}</div>
      <div class="session-top">
        <button class="iconbtn close" id="x" aria-label="End session">${icon('close')}</button>
        <div class="eyebrow">${o.kind === 'med' ? `${esc(o.tech.name)} meditation` : 'Focus study'}</div>
        <div class="bigtimer" id="tm">0:00</div>
        <div class="remain">${open ? 'Elapsed' : 'Remaining'}</div>
        ${o.kind === 'study' ? `<div class="pill" style="margin-top:12px">${o.task ? `${esc(o.task)} · ` : ''}Wanders: <span id="wan">0</span></div>` : ''}
      </div>
      <div class="glow"><p class="cue" id="cue" aria-live="polite">${o.kind === 'study' ? 'One thing at a time. Leaving Sati counts as a wander.' : ''}</p></div>
      <div class="session-bottom">
        <button class="pausebtn" id="pp" aria-label="Pause">${icon('pause')}</button>
        ${o.interval ? `<span class="bellnote">${icon('bell')}Bell every ${o.interval} min</span>` : ''}
        <button class="finish" id="end">Finish session</button>
      </div>
    </div>`;
    const elapsed = () => ((pausedAt || Date.now()) - startedAt - pausedFor) / 1000;
    const onVis = () => {
      if (o.kind !== 'study' || done) return;
      if (document.hidden) away = true;
      else if (away) { away = false; wanders++; $('#wan') && ($('#wan').textContent = wanders); toast('Welcome back. Notice where the mind went, and return.'); }
    };
    document.addEventListener('visibilitychange', onVis);
    const tick = () => {
      const el = open ? elapsed() : Math.min(elapsed(), total), left = total - el;
      const label = open ? mmss(el) : mmss(Math.ceil(left));
      $('#tm').textContent = label; document.title = `${label} · Sati`;
      if (cues.length) {
        const span = open ? 120 : total / cues.length, i = open ? Math.floor(el / span) % cues.length : Math.min(cues.length - 1, Math.floor(el / span));
        if (i !== cueIdx) { cueIdx = i; const c = $('#cue'); c.style.opacity = 0; setTimeout(() => { c.textContent = cues[i]; c.style.opacity = 1; }, 400); }
      }
      if (o.interval && !pausedAt) { const k = Math.floor(el / (o.interval * 60)); if (k > lastInt && (open || left > 2)) { lastInt = k; bell(0.5); } }
      if (!open && left <= 0) finish(true);
    };
    const iv = setInterval(tick, 250); tick();
    if (!open) endAlert(o.kind, total);
    function finish(complete) {
      if (done) return; done = true;
      clearInterval(iv); document.removeEventListener('visibilitychange', onVis);
      keepAwake(false); endAlert(); if (complete || open) bell();
      const m = Math.round((open ? elapsed() : Math.min(elapsed(), total)) / 60 * 10) / 10;
      const d = day(began), good = m >= 1, was = watered(began);
      if (good) { if (o.kind === 'med') d.med += m; else d.study += m; d.sessions++; }
      d.wanders += wanders; save();
      tendLotus();
      const wet = !was && S.lotus.grownOn === began;
      haptic('success');
      if (good && o.kind === 'med' && S.health) plug('SatiHealth')?.saveMindfulSession({ start: Date.now() - m * 60000, end: Date.now() }).catch(() => {});
      document.body.classList.remove('immersive');
      const brk = o.kind === 'study' && complete && o.breakMin, st = streak();
      const stats = o.kind === 'med'
        ? [['clock', fmtMin(m), 'Meditation'], ['leaf', `${st} day${st === 1 ? '' : 's'}`, 'Streak'], ['chart', d.sessions, d.sessions === 1 ? 'Session today' : 'Sessions today']]
        : [['clock', fmtMin(m), 'Focus'], ['leaf', o.breakMin ? `${o.breakMin} min` : '—', 'Rest next'], ['chart', wanders, wanders === 1 ? 'Wander' : 'Wanders']];
      view.innerHTML = `<div class="stack">
        ${header(`<a class="iconbtn" href="#today" aria-label="Close">${icon('close')}</a>`)}
        <div class="hero">${img('complete')}</div>
        <div class="center"><div class="eyebrow">${good ? 'Sādhu, sādhu, sādhu' : 'Every return counts'}</div><h1>${good ? 'You made space.' : 'Short and sweet.'}</h1>
          <p class="lead">${good ? `${fmtMin(m)} of ${o.kind === 'med' ? 'meditation' : 'focused study'}.` : 'Sessions under a minute aren’t counted. Every return still matters.'}</p></div>
        ${wet ? `<a class="watered" href="#today">${icon('drop')}<span>Your lotus is watered · Stage ${S.lotus.stage}</span><b>See your lotus${icon('arrow')}</b></a>` : ''}
        ${good ? `<div class="statrow">${stats.map(([ic, b, s]) => `<div>${icon(ic)}<b>${b}</b><span>${s}</span></div>`).join('')}</div>` : ''}
        <div class="reflect"><label for="note">${icon('sparkle')}What will you carry forward?</label><textarea id="note" maxlength="200" placeholder="A thought, a feeling, or nothing at all…">${esc(d.note || '')}</textarea></div>
        ${brk ? `<button class="btn block" id="brk">Take a ${o.breakMin}-minute break${icon('arrow')}</button><p class="center"><a class="textlink" href="#today">Back to today</a></p>` : '<a class="btn block" href="#today">Back to today</a>'}
        <div class="endnote">${icon('lotus')}<span>Every return is part of the practice.</span></div>
      </div>`;
      document.title = 'Sati — Meditate & Study';
      $('#note').oninput = (e) => { day().note = e.target.value; save(); };
      $('#brk')?.addEventListener('click', () => runSession({ kind: 'med', minutes: o.breakMin, tech: TECHNIQUES[0], interval: 0 }));
    }
    $('#pp').onclick = () => {
      const b = $('#pp');
      if (pausedAt) { pausedFor += Date.now() - pausedAt; pausedAt = null; b.innerHTML = icon('pause'); b.setAttribute('aria-label', 'Pause'); if (!open) endAlert(o.kind, total - elapsed()); }
      else { pausedAt = Date.now(); b.innerHTML = icon('play'); b.setAttribute('aria-label', 'Resume'); endAlert(); }
    };
    $('#end').onclick = () => finish(false);
    $('#x').onclick = () => finish(false);
    cleanup = () => { if (!done) { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); keepAwake(false); endAlert(); document.body.classList.remove('immersive'); } };
  }
  // iOS app: JS stops while the phone is locked, so a local notification marks the end of a timed session.
  async function endAlert(kind, secs) {
    const LN = plug('LocalNotifications'); if (!LN) return;
    try {
      await LN.cancel({ notifications: [{ id: 103 }] });
      if (!secs || (await LN.checkPermissions()).display !== 'granted') return;
      await LN.schedule({ notifications: [{ id: 103, title: kind === 'med' ? 'Sit complete \u{1FAB7}' : 'Focus session complete', body: kind === 'med' ? 'Sādhu. Gently open your eyes.' : 'Time for a mindful break.', schedule: { at: new Date(Date.now() + secs * 1000) } }] });
    } catch { /* notifications unavailable */ }
  }

  /* ----- Learn: Dharma library and focus study ----- */
  const learnSeg = (on) => `<div class="seg"><a href="#learn" ${on === 'dharma' ? 'aria-current="page"' : ''}>Dharma</a><a href="#learn/focus" ${on === 'focus' ? 'aria-current="page"' : ''}>Focus study</a></div>`;
  V.learn = (tab) => (tab === 'focus' ? focusView() : libraryView());
  V.learn.bind = (tab) => {
    if (tab !== 'focus') return;
    const task = $('#task');
    task.oninput = () => { studyPick.task = task.value; };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'clear') { studyPick.task = ''; task.value = ''; task.focus(); }
      if (b.dataset.act === 'pre') { studyPick.focus = +b.dataset.f; studyPick.brk = +b.dataset.b; render(); }
      if (b.dataset.act === 'go') runSession({ kind: 'study', minutes: studyPick.focus, breakMin: studyPick.brk, task: studyPick.task.trim() });
    });
  };
  function libraryView() {
    const read = Object.keys(S.lessons).length, next = nextLesson();
    return `<div class="stack">
      ${header('')}
      <h1>Wisdom for<br>everyday life.</h1>
      ${learnSeg('dharma')}
      <a class="feature" href="#lesson/${next.id}">${img('learn')}<div><div class="eyebrow">${read ? 'Continue reading' : 'A good place to begin'}</div><h2>${esc(next.title)}</h2><span class="muted">${next.minutes} min read</span><i class="goarrow">${icon('arrow')}</i></div></a>
      <div class="sect-head sect"><h2>Explore the teachings</h2><span>${read} of ${LESSONS.length} read</span></div>
      <div class="list">${LESSONS.filter((l) => l !== next).map((l) => row({ href: `#lesson/${l.id}`, ic: LESSON_ICON[l.id] || 'lotus', title: esc(l.title), sub: `${esc(l.pali)} · ${l.minutes} min`, end: S.lessons[l.id] ? doneMark : undefined })).join('')}</div>
      <a class="promo" href="#learn/focus"><span class="t"><h3>Continue at your own pace.</h3><p>Pair a lesson with a calm, timed focus session.</p></span><span class="go">${icon('chev')}</span></a>
      ${orgFooter()}
    </div>`;
  }
  let studyPick = null;
  function focusView() {
    studyPick ??= { focus: S.goals.study >= 50 ? 50 : 25, brk: S.goals.study >= 50 ? 10 : 5, task: '' };
    return `<div class="stack">
      ${header()}
      ${learnSeg('focus')}
      <div class="hero split"><div class="headline"><h1>One thing at a time.</h1><p class="lead">A calmer mind for deeper learning.</p></div>${img('focus')}</div>
      <label class="field"><span>What are you working on?</span><span class="inputwrap"><input type="text" id="task" maxlength="60" placeholder="e.g. Read one chapter" value="${esc(studyPick.task)}"><button type="button" class="iconbtn bare clear" data-act="clear" aria-label="Clear">${icon('close')}</button></span></label>
      <div><div style="font-weight:500;font-size:15px;margin-bottom:6px">Focus / rest duration</div>
        <div class="chips c3">${[[25, 5], [50, 10], [90, 15]].map(([f, b]) => `<button class="chip" data-act="pre" data-f="${f}" data-b="${b}" aria-pressed="${studyPick.focus === f}">${f} / ${b} min</button>`).join('')}</div></div>
      <div class="summary">${icon('clock')}<span>${studyPick.focus} min focus · ${studyPick.brk} min rest</span></div>
      <p class="small muted center">When your attention wanders, gently return. Leaving Sati counts as a wander.</p>
      <button class="btn block" data-act="go">Start focus${icon('arrow')}</button>
      <a class="promo rose" href="#guard">${ico('shield', 'rose')}<span class="t"><h3>Make space for your attention</h3><p>Try a Guard rhythm before you begin.</p></span><span class="go">${icon('chev')}</span></a>
    </div>`;
  }

  V.lesson = (id) => {
    const l = LESSONS.find((x) => x.id === id) || LESSONS[0];
    return `<div class="stack lesson">
      <div class="readbar" id="rb"></div>
      ${titleBar('#learn', 'Library', '<span class="eyebrow">Dharma library</span>')}
      <div><h1>${esc(l.title)}</h1><p class="lead">${esc(l.pali)}</p><p class="small muted">${l.minutes} min read</p></div>
      <div class="hero">${img(l.id === 'refuges' ? 'stones' : 'garden')}</div>
      <div class="body">${l.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="group">${l.terms.map(([t, m]) => `<div class="item">${ico(TERM_ICON[t] || 'lotus')}<span class="t"><b>${esc(t)}</b><span class="sub">${esc(m)}</span></span></div>`).join('')}</div>
      <div class="card stack"><div class="row spread"><h3>Practice cards</h3><span class="small muted" id="fc-n">1 / ${l.quiz.length}</span></div>
        <div class="flash" id="flash" role="button" tabindex="0" aria-live="polite"></div>
        <div class="row"><button class="btn ghost" style="flex:1" id="fc-flip">Show answer</button><button class="btn quiet" style="flex:1" id="fc-next">Next</button></div>
      </div>
      ${S.lessons[l.id] ? `<p class="row check" style="justify-content:center">${doneMark}Read</p>` : `<button class="btn block" id="done">Mark as read${icon('arrow')}</button>`}
    </div>`;
  };
  V.lesson.bind = (id) => {
    const l = LESSONS.find((x) => x.id === id) || LESSONS[0];
    let i = 0, flipped = false;
    const show = () => {
      const f = $('#flash');
      f.textContent = flipped ? l.quiz[i].a : l.quiz[i].q;
      f.classList.toggle('ans', flipped);
      f.classList.remove('turn'); void f.offsetWidth; f.classList.add('turn'); // restart the flip animation
      $('#fc-n').textContent = `${i + 1} / ${l.quiz.length}`;
      $('#fc-flip').textContent = flipped ? 'Show question' : 'Show answer';
    };
    const flip = () => { flipped = !flipped; show(); };
    $('#flash').onclick = flip; $('#fc-flip').onclick = flip;
    $('#flash').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    $('#fc-next').onclick = () => { i = (i + 1) % l.quiz.length; flipped = false; show(); };
    show();
    const onScroll = () => { const h = document.documentElement; $('#rb').style.width = `${h.scrollTop / Math.max(1, h.scrollHeight - innerHeight) * 100}%`; };
    addEventListener('scroll', onScroll, { passive: true });
    cleanup = () => removeEventListener('scroll', onScroll);
    const done = $('#done');
    if (done) done.onclick = () => {
      S.lessons[l.id] = dayKey(); const d = day(); d.lessons++; d.study += l.minutes; save();
      toast('Sādhu! Lesson added to today’s practice.'); render();
    };
  };

  /* ----- Guard: rhythms (scheduled guards) and doorways ----- */
  V.guard = () => {
    const sw = (act, v, on, label) => `<button class="switch" role="switch" data-act="${act}" data-v="${v}" aria-checked="${on}" aria-label="${label}"></button>`;
    const status = (g, fallback) => (g && guardActive(g) ? '<span class="sub on">Guarding now</span>' : `<span class="sub">${fallback}</span>`);
    return `<div class="stack">
      ${header()}
      <div><h1>Make room<br>for what matters.</h1><p class="lead">A gentle pause before you scroll.</p></div>
      <div class="hero">${img('guard')}</div>
      <div><div class="cardhead"><h2>Your rhythms</h2><span>Help me stay balanced.</span></div>
        <div class="group">
          ${PRESETS.map((p) => { const g = S.guards.find((x) => x.preset === p.preset); return `<div class="item rhythm">${ico(p.ic, p.tone)}<span class="t"><b>${p.name}</b>${status(g, p.sub)}</span>${sw('preset', p.preset, !!g, p.name)}</div>`; }).join('')}
          ${S.guards.filter((g) => !g.preset).map((g) => `<div class="item rhythm">${ico('shield', 'soft-sage')}<span class="t"><b>${esc(g.name)}</b>${status(g, `${daysText(g.days)} · ${g.start}–${g.end}`)}</span>
            <button class="iconbtn bare" data-act="del" data-v="${g.id}" aria-label="Remove ${esc(g.name)}">${icon('close')}</button>${sw('toggle', g.id, g.on, esc(g.name))}</div>`).join('')}
        </div>
        <button class="btn quiet addrow" data-act="add">${icon('plus')}Add a rhythm</button>
      </div>
      <p class="small muted">While a rhythm is guarding, doorways ask for five breaths instead of three.</p>
      <div class="sect"><div class="cardhead"><h2>Your doorways</h2><span>Pause before opening.</span></div>
        <div class="doors" role="group" aria-label="App">${S.apps.map((a, i) => `<button class="door" data-act="door" data-v="${a}" aria-pressed="${i === 0}">${tile(a, 26)}${esc(appById(a)?.name || a)}</button>`).join('')}<button class="door add" data-act="list">${icon('plus')}Edit</button></div>
      </div>
      <p class="small muted center">Doorway shortcuts invite a pause before opening an app.</p>
      <details class="setup"><summary class="btn ghost block">Set up a doorway${icon('arrow')}</summary>
        <div class="stack" style="margin-top:14px">
          <p class="small muted">${NATIVE ? 'Sati stands at the door' : 'A web app can\u2019t lock other apps, so Sati stands at the door instead'}. Swap a distracting app’s icon for its doorway: a few breaths, then a choice.</p>
          <input type="text" id="applink" class="linkbox" readonly aria-label="Doorway link">
          <div class="row"><button class="btn quiet" style="flex:1" id="copy">Copy link</button><a class="btn ghost" style="flex:1" id="try">Try it</a></div>
          <details><summary>iPhone steps</summary><ol class="steps small">
            <li>Open <b>Shortcuts</b>, tap <b>+</b>, add <b>Open URLs</b> and paste the link.</li>
            <li>Tap share › <b>Add to Home Screen</b>; name it after the app.</li>
            <li>Long-press the real app › <b>Remove App</b> › <b>Remove from Home Screen</b> (it stays in the App Library).</li>
            <li>Put the doorway where the app used to be.</li></ol></details>
          ${NATIVE ? '' : `<details><summary>Android steps</summary><ol class="steps small">
            <li>Open the link in Chrome › <b>⋮</b> › <b>Add to Home screen</b>.</li>
            <li>Move the real app off your home screen into the app drawer.</li></ol></details>`}
          <details><summary>Want hard limits too?</summary><p class="small muted">Pair Sati with Settings \u203a Screen Time \u203a App Limits${NATIVE ? '' : ', or Android Digital Wellbeing \u203a App timers'}. Sati adds the reflective pause; the system enforces the limit.</p></details>
        </div>
      </details>
      ${orgFooter()}
    </div>`;
  };
  V.guard.bind = () => {
    const link = $('#applink'), tryA = $('#try'), base = NATIVE ? 'sati://' : location.href.split('#')[0] + '#';
    const upd = (id) => {
      link.value = `${base}pause/${id}`; tryA.href = `#pause/${id}`;
      view.querySelectorAll('[data-act=door]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === id));
    };
    upd(S.apps[0]);
    $('#copy').onclick = async () => { try { await navigator.clipboard.writeText(link.value); toast('Link copied'); } catch { link.select(); toast('Select and copy the link'); } };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act, v = b.dataset.v;
      if (a === 'preset') {
        const ex = S.guards.find((g) => g.preset === v);
        if (ex) S.guards = S.guards.filter((g) => g !== ex);
        else { const p = PRESETS.find((x) => x.preset === v); S.guards.push({ id: 'g' + Date.now(), preset: p.preset, name: p.name, start: p.start, end: p.end, days: p.days, untilSit: !!p.untilSit, apps: [], on: true }); toast(`${p.name} is on`); }
        save(); render();
      }
      if (a === 'toggle') { const g = S.guards.find((x) => x.id === v); g.on = !g.on; save(); render(); }
      if (a === 'del') { S.guards = S.guards.filter((x) => x.id !== v); save(); render(); }
      if (a === 'door') upd(v);
      if (a === 'list') editList();
      if (a === 'add') addGuard();
    });
  };
  function editList() {
    sheet(`<h2>Your distracting apps</h2><p class="small muted">These appear in check-ins, guards and doorways.</p>
      ${APPS.map((a) => `<label class="row approw">${tile(a.id, 28)}<span style="flex:1">${a.name}</span><input type="checkbox" name="${a.id}" ${S.apps.includes(a.id) ? 'checked' : ''}></label>`).join('')}
      <div class="row"><button class="btn ghost" style="flex:1" value="cancel">Cancel</button><button class="btn" style="flex:1" value="save">Save</button></div>`, (dlg) => {
      dlg.addEventListener('close', () => {
        if (dlg.returnValue !== 'save') return;
        const f = new FormData(dlg.querySelector('form')), picked = APPS.filter((a) => f.get(a.id)).map((a) => a.id);
        if (picked.length) { S.apps = picked; save(); render(); } else toast('Keep at least one app');
      });
    });
  }
  function addGuard() {
    sheet(`<h2>New rhythm</h2>
      <label class="field"><span>Name</span><input type="text" name="name" maxlength="30" placeholder="e.g. Exam week" required></label>
      <div class="grid2"><label class="field"><span>From</span><input type="time" name="start" value="09:00"></label><label class="field"><span>To</span><input type="time" name="end" value="12:00"></label></div>
      <div><span class="small muted">Days</span><div class="row" style="margin-top:6px;flex-wrap:wrap">${DAYN.map((n, i) => `<label class="chip"><input type="checkbox" name="d${i}" ${i > 0 && i < 6 ? 'checked' : ''} style="margin:0 6px 0 0">${n}</label>`).join('')}</div></div>
      <div class="row"><button class="btn ghost" style="flex:1" value="cancel" formnovalidate>Cancel</button><button class="btn" style="flex:1" value="save">Add</button></div>`, (dlg) => {
      dlg.addEventListener('close', () => {
        if (dlg.returnValue !== 'save') return;
        const f = new FormData(dlg.querySelector('form')), days = DAYN.map((_, i) => i).filter((i) => f.get('d' + i));
        if (!days.length) return toast('Pick at least one day');
        S.guards.push({ id: 'g' + Date.now(), name: String(f.get('name')).trim() || 'Guard', start: f.get('start') || '09:00', end: f.get('end') || '12:00', days, apps: [], on: true });
        save(); render(); toast('Rhythm added');
      });
    });
  }

  /* ----- the doorway (intervention screen) ----- */
  V.pause = (appId) => {
    const app = appById(appId);
    if (!app) { location.replace('#guard'); return ''; }
    const g = guardFor(app.id), n = g ? 5 : 3, word = g ? 'five' : 'three';
    return `<div class="stack pausev">
      <div class="top"><a class="iconbtn bare" href="#today" aria-label="Not now">${icon('back')}</a>${wordmark}<span style="width:44px"></span></div>
      <div class="eyebrow">${g ? `${esc(g.name)} is guarding until ${g.end}` : 'A moment of choice'}</div>
      <h1 id="ph">Before you open ${esc(app.name)}…</h1>
      <div class="arcs" id="arcs"><div class="in-text"><h2 id="pc">Take ${word} breaths</h2><div class="dots3">${'<i></i>'.repeat(n)}</div><p class="phase" id="phase"></p></div>${img('pause')}</div>
      <div id="choice" class="stack">
        <h2>What are you here to do?</h2>
        <div class="inputwrap"><span class="lead-i">${icon('pencil')}</span><input type="text" id="intent" maxlength="60" placeholder="Set a small intention (optional)" aria-label="Intention"></div>
        <button class="btn block" data-act="present">Stay with this moment${icon('arrow')}</button>
        <button class="btn ghost block" data-act="use" id="cont" disabled>Continue to ${esc(app.name)}</button>
      </div>
      <div id="after" class="stack hidden"></div>
      <div class="endnote">${icon('lotus')}<span>Your attention is yours to choose.</span></div>
    </div>`;
  };
  V.pause.bind = (appId) => {
    const app = appById(appId); if (!app) return;
    const breaths = guardFor(app.id) ? 5 : 3;
    document.body.classList.add('immersive');
    const arcs = $('#arcs'), phase = $('#phase'), dots = [...view.querySelectorAll('.dots3 i')];
    let n = 0, t, stopped = false;
    const cycle = () => {
      if (stopped) return;
      if (n >= breaths) { $('#pc').textContent = 'Now, choose.'; phase.textContent = ''; $('#cont').disabled = false; return; }
      phase.textContent = 'Breathe in…'; arcs.classList.add('in');
      t = setTimeout(() => { phase.textContent = 'Breathe out…'; arcs.classList.remove('in'); t = setTimeout(() => { dots[n].classList.add('on'); n++; cycle(); }, 4000); }, 4000);
    };
    t = setTimeout(cycle, 300);
    cleanup = () => { stopped = true; clearTimeout(t); document.body.classList.remove('immersive'); };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const d = day(), after = $('#after'), intent = $('#intent').value.trim();
      stopped = true; clearTimeout(t);
      $('#choice').classList.add('hidden'); arcs.classList.add('hidden'); after.classList.remove('hidden');
      if (b.dataset.act === 'present') {
        d.present++; save();
        $('#ph').textContent = 'Sādhu.';
        after.innerHTML = `<div class="hero">${img('complete')}</div><p class="lead">You chose presence. Padma brightens.</p><a class="btn block" href="#sit">Sit for a minute</a><a class="btn ghost block" href="#today">Back to today</a>`;
      } else {
        d.mindful++; save();
        $('#ph').textContent = 'Go gently.';
        after.innerHTML = `<p class="lead">${intent ? `Your intention: ${esc(intent)}.` : 'Open it with intention.'} Notice the urge to keep going when you’re done.</p>
          ${app.scheme ? `<a class="btn block" href="${app.scheme}">Open ${esc(app.name)}</a>` : ''}<a class="btn ghost block" href="#today">Back to today</a>`;
      }
    });
  };

  /* ----- Stats ----- */
  let range = 'week';
  V.stats = () => {
    const now = new Date(), sum = (ks, f) => ks.reduce((a, k) => a + f(peek(k) || blankDay()), 0);
    const cols = range === 'year'
      ? [...Array(12)].map((_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1), dim = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
        return { l: m.toLocaleDateString('en-AU', { month: 'narrow' }), ks: [...Array(dim)].map((_, j) => dayKey(new Date(m.getFullYear(), m.getMonth(), j + 1))), today: i === 11 };
      })
      : [...Array(range === 'week' ? 7 : 30)].map((_, i, a) => {
        const dt = addDays(now, i - a.length + 1);
        return { l: range === 'week' ? dt.toLocaleDateString('en-AU', { weekday: 'narrow' }) : (a.length - 1 - i) % 5 ? '' : String(dt.getDate()), ks: [dayKey(dt)], today: i === a.length - 1 };
      });
    cols.forEach((c) => { c.v = sum(c.ks, (d) => d.med + d.study); });
    const keys = cols.flatMap((c) => c.ks), total = sum(keys, (d) => d.med + d.study), max = Math.max(1, ...cols.map((c) => c.v)), dense = range !== 'week';
    const scr = keys.map((k) => peek(k)?.screen).filter((x) => x != null);
    const appTot = {}; keys.forEach((k) => Object.entries(peek(k)?.apps || {}).forEach(([a, m]) => { appTot[a] = (appTot[a] || 0) + m; }));
    const tops = Object.entries(appTot).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const moments = [...Array(14)].map((_, i) => ({ i, dt: addDays(now, -i), d: peek(dayKey(addDays(now, -i))) })).filter((x) => x.d && (x.d.med || x.d.study)).slice(0, 3);
    const tileH = (ic, b, s) => `<div class="tile">${ico(ic)}<div><b>${b}</b><span>${s}</span></div></div>`;
    return `<div class="stack">
      ${header()}
      <div class="hero split"><div class="headline"><h1>Your practice, over time.</h1></div>${img('stats')}</div>
      <div class="seg" role="group" aria-label="Range">${['week', 'month', 'year'].map((r) => `<button data-act="range" data-v="${r}" aria-pressed="${range === r}">${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</div>
      <div class="bignum"><b>${Math.round(total)}</b><span>mindful minutes<small>${{ week: 'This week', month: 'Last 30 days', year: 'Last 12 months' }[range]}</small></span></div>
      <div>
        <div class="chart ${dense ? 'dense' : ''}">${cols.map((c) => `<div class="col ${c.today ? 'today' : ''}" title="${c.ks[0]}: ${fmtMin(c.v)}">${dense ? '' : `<span class="val">${c.v ? fmtMin(c.v) : ''}</span>`}<div class="bar" style="height:${c.v / max * 82}%"></div></div>`).join('')}
          ${total ? '' : '<p class="small muted chart-empty">Your sits and study sessions will show here.</p>'}</div>
        <div class="chart-labels ${dense ? 'dense' : ''}">${cols.map((c) => `<span>${c.l}</span>`).join('')}</div>
      </div>
      <div class="grid2">
        ${tileH('calendar', keys.filter(practised).length, 'Days practised')}
        ${tileH('book', sum(keys, (d) => d.lessons), 'Lessons read')}
        ${tileH('leaf', sum(keys, (d) => d.present + d.mindful), 'Mindful pauses')}
        ${tileH('phone', scr.length ? fmtMin(scr.reduce((a, b) => a + b) / scr.length * 60) : '—', 'Avg screen time')}
      </div>
      ${moments.length ? `<h2 class="sect">Moments that mattered</h2><div class="group">${moments.map(({ i, dt, d }) => { const sat = d.med >= d.study; return `<div class="item">${ico(sat ? 'sprout' : 'book', sat ? 'soft-sage' : '')}<span class="t"><b>${d.note ? `“${esc(d.note)}”` : sat ? 'A quiet sit' : 'Learning with intention'}</b><span class="sub">${[d.med && `${fmtMin(d.med)} meditation`, d.study && `${fmtMin(d.study)} study`].filter(Boolean).join(' · ')}</span></span><span class="small muted">${i ? DAYN[dt.getDay()] : 'Today'}</span></div>`; }).join('')}</div>` : ''}
      ${tops.length ? `<h2 class="sect">Top distractions</h2><div class="group">${tops.map(([id, m]) => `<div class="offender">${tile(id)}<b>${esc(appById(id)?.name || id)}</b><em>${fmtMin(m)}</em></div>`).join('')}</div>` : ''}
      <div class="list">${row({ act: 'checkin', ic: 'phone', tone: 'soft-rose', title: 'Screen Time check-in', sub: day().screen == null ? `Copy today’s numbers · aim for under ${S.goals.screen}h` : `${fmtMin(day().screen * 60)} today${day().pickups != null ? ` · ${day().pickups} pickups` : ''}` })}</div>
      <div class="promo">${img('garden')}<span class="t"><h3>Progress is returning,<br>again and again.</h3></span></div>
      ${orgFooter()}
    </div>`;
  };
  V.stats.bind = () => view.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act=range]'); if (b) { range = b.dataset.v; render(); }
    if (e.target.closest('[data-act=checkin]')) checkIn();
  });

  /* ----- settings ----- */
  V.settings = () => `<div class="stack">
    ${titleBar('#today', 'Home', 'Settings')}
    <div class="card stack"><h3>Daily goals</h3>
      <label class="field"><span>Meditation (minutes)</span><input type="number" min="1" max="240" id="g-med" value="${S.goals.meditate}"></label>
      <label class="field"><span>Study (minutes)</span><input type="number" min="5" max="600" id="g-study" value="${S.goals.study}"></label>
      <label class="field"><span>Screen time limit (hours)</span><input type="number" min="0.5" max="16" step="0.5" id="g-scr" value="${S.goals.screen}"></label>
    </div>
    <div class="card stack"><h3>Appearance & sound</h3>
      <div class="chips c3">${['auto', 'light', 'dark'].map((t) => `<button class="chip" data-act="theme" data-v="${t}" aria-pressed="${S.theme === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
      <div class="row spread"><span>Meditation bell</span><div class="row"><button class="chip" data-act="testbell">Test</button><button class="switch" role="switch" data-act="bell" aria-checked="${S.bell}" aria-label="Meditation bell"></button></div></div>
    </div>
    <div class="card stack"><h3>Practice reminders</h3>
      <p class="small muted">${NATIVE ? 'A gentle notification each day at these times.' : 'Adds two daily events, with alerts, to your phone\u2019s calendar.'}</p>
      <div class="grid2"><label class="field"><span>Morning sit</span><input type="time" id="r-am" value="${S.reminders.morning}"></label>
      <label class="field"><span>Evening study</span><input type="time" id="r-pm" value="${S.reminders.evening}"></label></div>
      ${NATIVE ? `<div class="row spread"><span>Daily reminders</span><button class="switch" role="switch" data-act="notify" aria-checked="${S.notify}" aria-label="Daily reminders"></button></div>` : '<button class="btn quiet block" data-act="ics">Add to calendar (.ics)</button>'}
    </div>
    ${NATIVE ? `<div class="card stack"><h3>Apple Health</h3>
      <p class="small muted">Save each completed meditation to Apple Health as Mindful Minutes. Sati never reads your health data.</p>
      <div class="row spread"><span>Log Mindful Minutes</span><button class="switch" role="switch" data-act="health" aria-checked="${S.health}" aria-label="Log Mindful Minutes"></button></div>
    </div>` : `<div class="card stack"><h3>Install Sati</h3>
      <p class="small muted"><b>iPhone:</b> in Safari, tap Share › Add to Home Screen. <b>Android:</b> in Chrome, tap ⋮ › Install app. It then works offline like a normal app. Long-press the icon on Android for Sit, Learn and Guard shortcuts.</p>
    </div>`}
    <div class="card stack"><h3>Your data</h3>
      <p class="small muted">Everything stays on this device. Nothing is sent to the Society or anyone else.</p>
      <div class="row"><button class="btn ghost" style="flex:1" data-act="export">Back up</button><button class="btn ghost" style="flex:1" data-act="restore">Restore</button></div>
      <button class="btn ghost block" data-act="onb">Redo intro</button>
      <button class="btn ghost block" data-act="reset" style="color:var(--warn);border-color:var(--warn)">Erase all data</button>
    </div>
    <div class="card stack"><h3>About</h3>
      <p class="small">Sati is offered freely by the <b>${ORG.name}</b>, a volunteer-run charity in Sydney helping keep the teachings of the Buddha open to all who seek them.</p>
      <p class="small muted">Registered with the Australian Charities and Not-for-profits Commission (ACNC). ABN ${ORG.abn}. <a href="${ORG.acnc}" target="_blank" rel="noopener">ACNC register</a> · <a href="${ORG.abr}" target="_blank" rel="noopener">ABN Lookup</a></p>
      ${NATIVE ? `<a class="btn block" href="${ORG.site}" target="_blank" rel="noopener">Visit the Society\u2019s website</a>` : `<a class="btn block" href="${ORG.give}" target="_blank" rel="noopener">Become a Dharma Friend</a>`}
      <p class="small muted">${NATIVE ? '' : 'Gifts support the Society\u2019s work but are not tax-deductible. '}Join a meditation evening in Sydney: <a href="${ORG.contact}" target="_blank" rel="noopener">contact us</a> or email <a href="mailto:${ORG.email}">${ORG.email}</a>.</p>
      <p class="small muted"><a href="privacy.html">Privacy Policy</a> · <a href="support.html">Support</a></p>
      <p class="small muted">Sati supports wellbeing but is not a substitute for professional care. If you are struggling, call Lifeline on <a href="tel:131114">13 11 14</a>.</p>
    </div>
    ${orgFooter()}
  </div>`;
  V.settings.bind = () => {
    const num = (id, key, min, max) => $(id).addEventListener('change', (e) => {
      const v = Number(e.target.value); if (v >= min && v <= max) { S.goals[key] = v; save(); toast('Goal saved'); } else e.target.value = S.goals[key];
    });
    num('#g-med', 'meditate', 1, 240); num('#g-study', 'study', 5, 600); num('#g-scr', 'screen', 0.5, 16);
    $('#r-am').onchange = (e) => { S.reminders.morning = e.target.value; save(); if (S.notify) scheduleReminders(); };
    $('#r-pm').onchange = (e) => { S.reminders.evening = e.target.value; save(); if (S.notify) scheduleReminders(); };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'theme') { S.theme = b.dataset.v; save(); applyTheme(); render(); }
      if (a === 'bell') { S.bell = !S.bell; save(); render(); }
      if (a === 'notify') {
        (S.notify ? cancelReminders() : scheduleReminders()).then((on) => { S.notify = on; save(); render(); toast(on ? 'Reminders on' : 'Reminders off'); });
      }
      if (a === 'health') {
        if (S.health) { S.health = false; save(); render(); return; }
        plug('SatiHealth')?.requestAuthorization().then(({ granted }) => {
          S.health = !!granted; save(); render(); toast(granted ? 'Mindful Minutes will be saved to Health' : 'Allow Sati in the Health app to turn this on');
        }).catch(() => toast('Apple Health is not available'));
      }
      if (a === 'testbell') { const was = S.bell; S.bell = true; bell(); S.bell = was; }
      if (a === 'ics') download('sati-reminders.ics', ics(), 'text/calendar');
      if (a === 'export') backup();
      if (a === 'restore') pickBackup();
      if (a === 'onb') { S.onboarded = false; save(); location.hash = '#welcome'; }
      if (a === 'reset' && confirm('Erase all your practice history on this device?')) { cancelReminders(); localStorage.removeItem(KEY); S = defaults(); applyTheme(); location.hash = '#welcome'; }
    });
  };

  async function scheduleReminders() {
    const LN = plug('LocalNotifications'); if (!LN) return false;
    try {
      const perm = await LN.requestPermissions();
      if (perm.display !== 'granted') { toast('Allow notifications for Sati in Settings'); return false; }
      await LN.cancel({ notifications: [{ id: 101 }, { id: 102 }] }).catch(() => {});
      const on = (t) => { const [hour, minute] = t.split(':').map(Number); return { hour, minute }; };
      await LN.schedule({ notifications: [
        { id: 101, title: 'Time to sit \u{1FAB7}', body: 'Your lotus needs water: 5 minutes of stillness.', schedule: { on: on(S.reminders.morning), allowWhileIdle: true }, extra: { hash: '#sit' } },
        { id: 102, title: 'Evening study \u{1F4D6}', body: 'One focused session, one gentle return at a time.', schedule: { on: on(S.reminders.evening), allowWhileIdle: true }, extra: { hash: '#learn/focus' } }
      ] });
      return true;
    } catch { return false; }
  }
  async function cancelReminders() {
    try { await plug('LocalNotifications')?.cancel({ notifications: [{ id: 101 }, { id: 102 }] }); } catch { /* none scheduled */ }
    return false;
  }

  // Backups are the whole state as JSON. The iOS app can't download files, so it hands the file to the share sheet.
  async function backup() {
    const name = `sati-backup-${dayKey()}.json`, text = JSON.stringify(S, null, 2);
    if (!NATIVE) return download(name, text, 'application/json');
    const file = new File([text], name, { type: 'application/json' });
    try { if (!navigator.canShare?.({ files: [file] })) throw new Error('no share'); await navigator.share({ files: [file] }); }
    catch (e) { if (e.name !== 'AbortError') toast('Sharing isn\u2019t available on this device'); }
  }
  function pickBackup() {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = 'application/json,.json';
    i.onchange = () => i.files[0]?.text().then(restore);
    i.click();
  }
  function restore(text) {
    let d;
    try { d = JSON.parse(text); } catch { d = null; }
    if (!d || typeof d !== 'object' || !d.days || typeof d.days !== 'object' || Array.isArray(d.days)) return toast('That file isn\u2019t a Sati backup');
    if (!confirm('Replace the practice history on this device with this backup?')) return;
    cancelReminders();
    // Reminders and Health need this device's permission again, so they start off.
    S = Object.assign(defaults(), d, { notify: false, health: false, onboarded: true });
    S.lotus = Object.assign(defaults().lotus, S.lotus);
    S.apps = (Array.isArray(S.apps) ? S.apps : []).filter(appById);
    if (!S.apps.length) S.apps = defaults().apps;
    const hm = /^\d\d:\d\d$/;
    S.guards = (Array.isArray(S.guards) ? S.guards : []).filter((g) => g && Array.isArray(g.days) && hm.test(g.start) && hm.test(g.end));
    save(); applyTheme(); toast('Backup restored');
    if (location.hash === '#today') render(); else location.hash = '#today';
  }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function ics() {
    const url = location.href.split('#')[0];
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const today = dayKey().replace(/-/g, '');
    const ev = (uid, time, summary, hash) => [
      'BEGIN:VEVENT', `UID:${uid}-${S.created}@sati`, `DTSTAMP:${stamp}`,
      `DTSTART:${today}T${time.replace(':', '')}00`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',
      `SUMMARY:${summary}`, `URL:${url}${hash}`, `DESCRIPTION:Open Sati: ${url}${hash}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${summary}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'
    ];
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Buddhist Society of Australia//Sati//EN', 'CALSCALE:GREGORIAN',
      ...ev('am', S.reminders.morning, '\u{1FAB7} Morning sit', '#sit'),
      ...ev('pm', S.reminders.evening, '\u{1F4D6} Evening study', '#learn/focus'),
      'END:VCALENDAR'].join('\r\n');
  }

  /* ----- onboarding ----- */
  let ob = 0;
  const OB_STEPS = 6;
  V.welcome = () => {
    const P = S.profile, dots = `<div class="dots">${[...Array(OB_STEPS)].map((_, i) => `<i class="${i === ob ? 'on' : ''}"></i>`).join('')}</div>`;
    const q = (key, opts) => opts.map(([v, l]) => `<button class="opt wide" data-act="ans" data-k="${key}" data-v="${v}" aria-pressed="${P[key] === v}">${l}</button>`).join('');
    const steps = [
      () => `<div class="center stack"><div class="hero">${img('home')}</div>
        <div class="eyebrow">${ORG.name}</div><h1>Meet Padma.</h1>
        <p class="lead">Padma grows when you meditate, study with focus and meet your phone with a pause instead of a reflex.</p></div>`,
      () => `<div class="stack center"><h2>See for yourself</h2><p class="muted" style="margin-top:6px">How many hours a day are you on your phone?</p>
        <div class="hours" id="ob-h">${P.hours}<small>h</small></div>
        <input type="range" id="hours" min="0" max="12" step="0.5" value="${P.hours}" aria-label="Hours per day">
        <p class="small muted">Not sure? Check Settings › Screen Time.</p></div>`,
      () => `<div class="stack"><h2>When does the scroll pull hardest?</h2>${q('scroll', [['morning', 'First thing in the morning'], ['study', 'While I’m studying or working'], ['evening', 'In the evening'], ['night', 'Late at night, in bed']])}
        <h2 style="margin-top:22px">What brings you here?</h2>${q('why', [['calm', 'A calmer mind'], ['focus', 'Better focus for study'], ['dharma', 'Learning the Dharma'], ['sleep', 'Better sleep']])}</div>`,
      () => { const pr = PROFILES[P.scroll]; return `<div class="stack center"><div class="eyebrow">Your pattern</div><h1>${pr.name}</h1>
        <div class="hero">${img(P.scroll === 'night' ? 'evening' : 'pause')}</div>
        <p>${pr.text}</p><div class="card small" style="text-align:left"><b>In the Buddha’s terms:</b> this pull often looks like <i>${pr.hindrance.toLowerCase()}</i>, one of the five hindrances. Recognising it is the first step. You’ll find a lesson on it in Learn.</div></div>`; },
      () => { const remain = Math.max(5, 85 - P.age), lost = Math.round(P.hours / 16 * remain * 10) / 10, back = Math.round(lost / 2 * 10) / 10;
        const cells = Math.min(80, remain), red = Math.round(P.hours / 16 * cells);
        return `<div class="stack center"><h2>At ${P.hours}h a day, that’s about <span style="color:var(--warn)">${lost} years</span> of your waking life on a screen.</h2>
        <label class="field" style="text-align:left"><span>Your age: <b id="agev">${P.age}</b></span><input type="range" id="age" min="12" max="80" value="${P.age}"></label>
        <div class="life" id="life">${[...Array(cells)].map((_, i) => `<i class="${i < red ? 'phone' : ''}"></i>`).join('')}</div>
        <p class="small muted">Each square is one year until 85. Coloured squares are years on the phone (of 16 waking hours a day).</p>
        <p><b>Halve it and you get back ${back} years</b>, enough for more than ${Math.round(back * 365 * 0.5 * 60 / 20).toLocaleString('en-AU')} twenty-minute sits.</p></div>`; },
      () => `<div class="stack"><h2>Set a gentle daily intention</h2>
        <h3>Meditate</h3><div class="chips">${[5, 10, 20, 30].map((m) => `<button class="chip" data-act="goal" data-k="meditate" data-v="${m}" aria-pressed="${S.goals.meditate === m}">${m} min</button>`).join('')}</div>
        <h3>Study</h3><div class="chips">${[25, 50, 90, 120].map((m) => `<button class="chip" data-act="goal" data-k="study" data-v="${m}" aria-pressed="${S.goals.study === m}">${m} min</button>`).join('')}</div>
        <h3>Screen time, at most</h3><div class="chips">${[1, 2, 3, 4].map((m) => `<button class="chip" data-act="goal" data-k="screen" data-v="${m}" aria-pressed="${S.goals.screen === m}">${m}h</button>`).join('')}</div>
        <p class="small muted">Free, no account, no ads. Your practice stays on your device.</p></div>`
    ];
    return `<div class="onb">${dots}<div>${steps[ob]()}</div>
      <div class="stack"><button class="btn block" data-act="next">${ob === 0 ? 'Begin' : ob === OB_STEPS - 1 ? 'Start practising' : 'Continue'}</button>
      ${ob === 0 ? '<button class="btn ghost block" data-act="skip">Skip intro</button><p class="center"><button class="textlink" data-act="restore">Restore a backup</button></p>' : '<button class="btn ghost block" data-act="back">Back</button>'}</div></div>`;
  };
  V.welcome.bind = () => {
    document.body.classList.add('immersive');
    cleanup = () => document.body.classList.remove('immersive');
    const P = S.profile;
    const hr = $('#hours');
    if (hr) hr.oninput = () => { P.hours = Number(hr.value); $('#ob-h').innerHTML = `${P.hours}<small>h</small>`; save(); };
    const age = $('#age');
    if (age) { age.onchange = () => { P.age = Number(age.value); save(); render(); }; age.oninput = () => { $('#agev').textContent = age.value; }; }
    if (ob === 4) setTimeout(() => {
      const red = [...document.querySelectorAll('.life i.phone')];
      red.slice(Math.ceil(red.length / 2)).forEach((c, i) => setTimeout(() => { c.classList.remove('phone'); c.classList.add('back'); }, 900 + i * 60));
    }, 50);
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'ans') { P[b.dataset.k] = b.dataset.v; save(); return render(); }
      if (a === 'goal') { S.goals[b.dataset.k] = Number(b.dataset.v); save(); return render(); }
      if (a === 'back') { ob = Math.max(0, ob - 1); return render(); }
      if (a === 'restore') return pickBackup();
      if (a === 'next' && ob < OB_STEPS - 1) { if (ob === 0) bell(0.6); ob++; window.scrollTo(0, 0); return render(); }
      if (a === 'next' || a === 'skip') {
        if (a === 'next' && S.goals.screen === defaults().goals.screen && P.hours <= 3) S.goals.screen = Math.max(1, P.hours - 1);
        S.onboarded = true; ob = 0; save(); location.hash = '#today';
      }
    });
  };

  /* ---------- router ---------- */
  const ALIAS = { meditate: 'sit', insights: 'stats', garden: 'today' };
  const fill = (r) => r.style.setProperty('--fill', `${(r.value - r.min) / (r.max - r.min) * 100}%`);
  document.addEventListener('input', (e) => { if (e.target.type === 'range') fill(e.target); });
  let shown = '';
  function render() {
    cleanup?.(); cleanup = null;
    const fresh = view.cloneNode(false); view.replaceWith(fresh); view = fresh; // drop old delegated listeners
    let [name, arg] = location.hash.replace(/^#/, '').split('/');
    if (name === 'study') [name, arg] = ['learn', 'focus'];
    name = ALIAS[name] || name;
    if (name === 'pause' && !arg) name = 'guard';
    if (!S.onboarded && name !== 'pause') name = 'welcome';
    if (!V[name]) name = 'today';
    if (S.onboarded) tendLotus();
    view.innerHTML = V[name](arg && decodeURIComponent(arg));
    V[name].bind?.(arg && decodeURIComponent(arg));
    view.querySelectorAll('input[type=range]').forEach(fill);
    if (location.hash !== shown) { shown = location.hash; view.classList.add('enter'); } // fade in new screens, not re-renders
    const tab = { lesson: 'learn', pause: 'guard', garden: 'today' }[name] || name;
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
    const t = { today: 'Sati', garden: 'Padma’s garden', sit: 'Sit', learn: 'Learn', lesson: 'Learn', guard: 'Guard', pause: 'Pause', stats: 'Stats', settings: 'Settings', welcome: 'Welcome' }[name];
    document.title = t === 'Sati' ? 'Sati — Meditate & Study' : `${t} · Sati`;
  }

  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  if (NATIVE) {
    // sati://pause/instagram (doorways) and reminder taps route into the app.
    plug('App')?.addListener('appUrlOpen', ({ url }) => { location.hash = '#' + url.replace(/^sati:\/\//, ''); });
    plug('LocalNotifications')?.addListener('localNotificationActionPerformed', ({ notification }) => { if (notification?.extra?.hash) location.hash = notification.extra.hash; });
  }
  applyTheme();
  render();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
