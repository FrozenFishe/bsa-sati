/* Sati — Meditate & Study. Buddhist Society of Australia.
   Everything is stored on the device (localStorage); there is no server. */
(() => {
  'use strict';
  const { SCENES, scene, colors, padma, landscape, zen } = window.ART;

  // Native (iOS app) bridge; every call is optional so the web build keeps working.
  const CAP = window.Capacitor;
  const NATIVE = !!CAP?.isNativePlatform?.();
  const plug = (name) => (NATIVE ? CAP.Plugins?.[name] || CAP.registerPlugin?.(name) : null);
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
  const appById = (id) => APPS.find((a) => a.id === id);
  const tile = (id, size = 30) => { const a = appById(id) || APPS.at(-1); return `<span class="apptile" style="--t:${a.tile};width:${size}px;height:${size}px;font-size:${size * 0.5}px" title="${a.name}">${a.name[0]}</span>`; };

  const PRESETS = [
    { preset: 'study', name: 'Study Hall', sub: 'Weekdays 9–5, deep work', mood: 'study', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5], bg: '#dcefd2' },
    { preset: 'morning', name: 'Morning Sit', sub: 'Sit before you scroll', mood: 'sit', start: '05:00', end: '09:00', days: [0, 1, 2, 3, 4, 5, 6], untilSit: true, bg: '#fbe3c9' },
    { preset: 'night', name: 'Night Rest', sub: 'Phone down, mind settles', mood: 'sleep', start: '21:30', end: '06:30', days: [0, 1, 2, 3, 4, 5, 6], bg: '#dfe2f6' },
    { preset: 'retreat', name: 'Weekend Retreat', sub: 'A day of practice', mood: 'happy', start: '00:00', end: '23:59', days: [0, 6], bg: '#f7dbe3' }
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
    scene: 'pond',
    theme: 'auto',
    bell: true,
    apps: ['instagram', 'tiktok', 'youtube', 'x'],
    guards: [],
    reminders: { morning: '07:00', evening: '19:30' },
    notify: false,
    health: false,
    created: Date.now()
  });
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = defaults(); }
  if (S.palette) { S.scene = { saffron: 'temple', forest: 'forest', moon: 'night', gold: 'gold' }[S.palette] || 'pond'; delete S.palette; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };

  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const blankDay = () => ({ med: 0, study: 0, present: 0, mindful: 0, wanders: 0, lessons: 0, screen: null, pickups: null, apps: {}, checks: {} });
  const day = (k = dayKey()) => (S.days[k] = Object.assign(blankDay(), S.days[k]));
  const peek = (k) => S.days[k] && Object.assign(blankDay(), S.days[k]);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`);
  const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ---------- scoring: the clarity % drives Padma and the scene ---------- */
  function score(k) {
    const d = peek(k);
    if (!d) return null;
    const checks = Object.values(d.checks).filter(Boolean).length;
    const active = d.med || d.study || d.present || d.mindful || d.lessons || checks || d.screen != null || d.pickups != null;
    if (!active) return null;
    const g = S.goals;
    let s = 40;
    s += Math.min(d.med / g.meditate, 1) * 25;
    s += Math.min(d.study / g.study, 1) * 15;
    s += Math.min(d.present * 3 + d.mindful, 12);
    s += Math.min(d.lessons * 4, 8);
    s += Math.min(checks * 2, 4);
    if (d.screen != null) { const over = d.screen - g.screen; s += over > 0 ? -over * 8 : Math.min(-over * 4, 10); }
    if (d.pickups != null && d.pickups > 60) s -= Math.min((d.pickups - 60) / 10, 8);
    s -= Math.min(d.wanders * 2, 10);
    return Math.max(0, Math.min(100, Math.round(s)));
  }
  function health() {
    const t = score(dayKey());
    if (t != null) return t;
    const prev = [1, 2, 3].map((i) => score(dayKey(addDays(new Date(), -i)))).filter((x) => x != null);
    if (prev.length) return Math.round(prev.reduce((a, b) => a + b) / prev.length * 0.9);
    return Math.max(15, Math.round(100 - S.profile.hours * 8));
  }
  const moodOf = (h) => (h >= 70 ? 'happy' : h >= 40 ? 'ok' : 'sad');
  const moodWord = (h) => (h >= 85 ? 'Blooming' : h >= 70 ? 'Bright' : h >= 40 ? 'Clouded' : h >= 20 ? 'Wilting' : 'Needs care');
  const emoji = (s) => (s == null ? '·' : s >= 80 ? '\u{1FAB7}' : s >= 60 ? '\u{1F338}' : s >= 40 ? '\u{1F331}' : '\u{1F940}');
  const practised = (k) => { const d = peek(k); return !!d && (d.med > 0 || d.study > 0 || d.lessons > 0); };
  function streak() {
    let n = 0, d = new Date();
    if (!practised(dayKey(d))) d = addDays(d, -1);
    while (practised(dayKey(d))) { n++; d = addDays(d, -1); }
    return n;
  }
  function bestStreak() {
    const keys = Object.keys(S.days).filter(practised).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      run = prev && dayKey(addDays(new Date(prev + 'T12:00'), 1)) === k ? run + 1 : 1;
      best = Math.max(best, run); prev = k;
    }
    return best;
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

  function applyTheme() {
    const r = document.documentElement, pal = scene(S.scene).palette;
    if (pal !== 'lotus') r.dataset.palette = pal; else delete r.dataset.palette;
    if (S.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = S.theme;
  }

  /* ---------- views ---------- */
  let view = $('#view');
  let cleanup = null;
  const orgFooter = () => `<footer class="org">${ORG.name}<br>ACNC registered charity · ABN ${ORG.abn}</footer>`;
  const nextLesson = () => LESSONS.find((l) => !S.lessons[l.id]) || LESSONS[0];
  function weekStrip() {
    const start = addDays(new Date(), -6), names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return `<div class="week">${[...Array(7)].map((_, i) => {
      const d = addDays(start, i), k = dayKey(d);
      return `<div class="${i === 6 ? 'today' : ''}"><div class="d">${names[d.getDay()]}</div><div class="e" title="${k}">${emoji(score(k))}</div></div>`;
    }).join('')}</div>`;
  }
  function checklist(d) {
    const g = S.goals;
    return [
      ['sit', `Meditate ${g.meditate} min`, d.med >= g.meditate, '#sit'],
      ['study', `Study ${g.study} min`, d.study >= g.study, '#learn'],
      ['lesson', 'Read a Dharma lesson', d.lessons > 0, `#lesson/${nextLesson().id}`],
      ['refuge', 'Recite the Three Refuges', !!d.checks.refuge, null],
      ['kind', 'One act of kindness', !!d.checks.kind, null],
      ['screen', `Screen time under ${g.screen}h`, d.screen != null && d.screen <= g.screen, null]
    ];
  }

  const V = {};

  V.today = () => {
    const d = day(), h = health(), st = streak(), c = colors(S.scene, h);
    const tops = Object.entries(d.apps).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const cl = checklist(d), doneN = cl.filter((x) => x[2]).length;
    const total = d.med + d.study;
    return `<section class="home" style="--ground:${c.ground};--deep:${c.deep}">
      <div class="hero">${landscape(S.scene, h, moodOf(h))}
        <div class="hero-top">
          <a href="#settings" class="roundbtn" aria-label="Settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></a>
          <div class="wordmark">SATI</div>
          <a href="#stats" class="streak" aria-label="${st}-day streak"><span>\u{1FA94}</span><b>${st}</b></a>
        </div>
      </div>
      <div class="home-body">
        <div class="center"><div class="bignum">${h}<small>%</small></div><div class="hb-sub">${moodWord(h)}${score(dayKey()) == null ? ' · practise today to tend Padma' : ''}</div></div>
        <div class="pbar"><i style="width:${h}%;background:${h >= 70 ? '#7be07f' : h >= 40 ? '#f2c14e' : '#e9806e'}"></i></div>
        <div class="tiles">
          <button class="tl" data-act="checkin"><span class="ic">\u{1F4F1}</span><b>${d.screen == null ? '—' : fmtMin(d.screen * 60)}</b><span>Screen time</span></button>
          <button class="tl" data-act="checkin"><span class="ic">\u{1F446}</span><b>${d.pickups ?? '—'}</b><span>Pickups</span></button>
          <a class="tl" href="#sit"><span class="ic">\u{1FAB7}</span><b>${fmtMin(total)}</b><span>Practice</span></a>
        </div>
        <div class="panel">
          <div class="row spread"><h3>Today’s practice</h3><span class="count">${doneN}/${cl.length}</span></div>
          ${cl.map(([id, label, done, href]) => `<div class="ck ${done ? 'done' : ''}">
            <button class="ckbox" data-act="check" data-v="${id}" ${href || id === 'screen' ? 'disabled' : ''} aria-pressed="${done}" aria-label="${esc(label)}">${done ? '✓' : ''}</button>
            ${href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`}</div>`).join('')}
        </div>
        <div class="panel">
          <div class="row spread"><h3>Top distractions</h3><button class="linkbtn" data-act="checkin">Update</button></div>
          ${tops.length ? tops.map(([id, m]) => `<div class="offender">${tile(id)}<div><b>${esc(appById(id)?.name || id)}</b><span>${['games', 'news', 'other'].includes(id) ? '' : 'Social'}</span></div><em>${fmtMin(m)}</em></div>`).join('')
            : `<p class="hb-sub">Copy today\u2019s numbers from ${SCREEN_SRC}.</p>` + '<button class="btn light block" data-act="checkin">Add from Screen Time</button>'}
        </div>
        <div class="panel"><div class="row spread" style="margin-bottom:8px"><h3>This week</h3><a class="linkbtn" href="#stats">Stats</a></div>${weekStrip()}</div>
        ${orgFooter()}
      </div>
    </section>`;
  };
  V.today.bind = () => {
    document.body.classList.add('homebg');
    cleanup = () => document.body.classList.remove('homebg');
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'check') { haptic(); const d = day(); d.checks[b.dataset.v] = !d.checks[b.dataset.v]; save(); render(); }
      if (b.dataset.act === 'checkin') checkIn();
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
    const durs = [0, 3, 5, 10, 15, 20, 30, 45, 60];
    return `<div class="stack">
      <div class="sit-hero">${zen(S.scene, 'sit', 'xMidYMid')}</div>
      <div><div class="eyebrow">Sit</div><h1>Heal the mind with stillness</h1></div>
      <div class="grid2">${TECHNIQUES.map((t) => `<button class="opt" data-act="tech" data-v="${t.id}" aria-pressed="${medPick.tech === t.id}"><b>${t.name}</b><br><span class="small muted">${t.sub}</span></button>`).join('')}</div>
      <div class="card stack"><h3>Duration</h3>
        <div class="row wrap">${durs.map((m) => `<button class="chip" data-act="dur" data-v="${m}" aria-pressed="${medPick.min === m}">${m ? m + ' min' : 'Open'}</button>`).join('')}</div>
        <h3>Interval bell</h3>
        <div class="row wrap">${[[0, 'Off'], [1, 'Every min'], [5, 'Every 5 min'], [10, 'Every 10 min']].map(([v, l]) => `<button class="chip" data-act="int" data-v="${v}" aria-pressed="${medPick.interval === v}">${l}</button>`).join('')}</div>
      </div>
      <button class="btn block" data-act="start">${medPick.min ? `Begin · ${medPick.min} min` : 'Begin open sit'}</button>
      <p class="small muted center">The bell sounds at the start and end. Your screen stays on while you sit.</p>
    </div>`;
  };
  V.sit.bind = () => {
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act, v = b.dataset.v;
      if (a === 'tech') medPick.tech = v;
      if (a === 'dur') medPick.min = Number(v);
      if (a === 'int') medPick.interval = Number(v);
      if (a === 'start') return runSession({ kind: 'med', minutes: medPick.min, tech: TECHNIQUES.find((t) => t.id === medPick.tech), interval: medPick.interval });
      render();
    });
  };

  /* ----- immersive session: zen garden, big timer, keep going ----- */
  const mmss = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
  function runSession(o) {
    // o: { kind: 'med'|'study', minutes (0 = open), tech?, interval?, task?, breakMin? }
    bell(); keepAwake(true);
    document.body.classList.add('immersive');
    const open = !o.minutes, total = o.minutes * 60, startedAt = Date.now();
    let pausedAt = null, pausedFor = 0, lastInt = 0, cueIdx = -1, done = false, away = false, wanders = 0;
    const cues = o.tech?.cues || [];
    const title = o.kind === 'med' ? o.tech.name : (o.task ? esc(o.task) : 'Focus');
    const cheer = ['Keep going!', 'Breathe and return.', 'Right here.', 'Gently, gently.', 'Nearly there!'];
    view.innerHTML = `<div class="session">
      <div class="session-bg">${zen(S.scene, o.kind === 'med' ? 'sit' : 'study')}</div>
      <div class="session-top">
        <div class="pill">${o.kind === 'med' ? 'Sitting' : 'Studying'} · ${title}</div>
        <div class="bigtimer" id="tm">0:00</div>
        ${open ? '' : '<div class="kg"><div class="pbar"><i id="pb" style="width:0%"></i></div><span id="kgt">Keep going!</span></div>'}
        <p class="cue" id="cue">${o.kind === 'study' ? 'One thing at a time. Leaving Sati counts as a wander.' : ''}</p>
        ${o.kind === 'study' ? '<div class="pill small" id="wan">Wanders: 0</div>' : ''}
      </div>
      <div class="session-bottom"><button class="pausebtn" id="pp">Pause</button><button class="stopbtn" id="end" aria-label="End session"><i></i></button></div>
    </div>`;
    const elapsed = () => ((pausedAt || Date.now()) - startedAt - pausedFor) / 1000;
    const onVis = () => {
      if (o.kind !== 'study' || done) return;
      if (document.hidden) away = true;
      else if (away) { away = false; wanders++; $('#wan') && ($('#wan').textContent = `Wanders: ${wanders}`); toast('Welcome back. Notice where the mind went, and return.'); }
    };
    document.addEventListener('visibilitychange', onVis);
    const tick = () => {
      const el = open ? elapsed() : Math.min(elapsed(), total), left = total - el;
      const label = open ? mmss(el) : mmss(Math.ceil(left));
      $('#tm').textContent = label; document.title = `${label} · Sati`;
      if (!open) { $('#pb').style.width = `${el / total * 100}%`; $('#kgt').textContent = cheer[Math.min(cheer.length - 1, Math.floor(el / total * cheer.length))]; }
      if (cues.length) {
        const span = open ? 120 : total / cues.length, i = open ? Math.floor(el / span) % cues.length : Math.min(cues.length - 1, Math.floor(el / span));
        if (i !== cueIdx) { cueIdx = i; const c = $('#cue'); c.style.opacity = 0; setTimeout(() => { c.textContent = cues[i]; c.style.opacity = 1; }, 400); }
      }
      if (o.interval && !pausedAt) { const k = Math.floor(el / (o.interval * 60)); if (k > lastInt && (open || left > 2)) { lastInt = k; bell(0.5); } }
      if (!open && left <= 0) finish(true);
    };
    const iv = setInterval(tick, 250); tick();
    function finish(complete) {
      if (done) return; done = true;
      clearInterval(iv); document.removeEventListener('visibilitychange', onVis);
      keepAwake(false); if (complete || open) bell();
      const m = Math.round((open ? elapsed() : Math.min(elapsed(), total)) / 60 * 10) / 10;
      const d = day();
      if (m >= 1) { if (o.kind === 'med') d.med += m; else d.study += m; }
      d.wanders += wanders; save();
      haptic('success');
      if (m >= 1 && o.kind === 'med' && S.health) plug('SatiHealth')?.saveMindfulSession({ start: Date.now() - m * 60000, end: Date.now() }).catch(() => {});
      document.body.classList.remove('immersive');
      const h = health(), good = m >= 1;
      view.innerHTML = `<div class="stack center">
        <div class="mini-scene">${landscape(S.scene, h, good ? 'happy' : moodOf(h))}</div>
        <h1>${good ? (complete || open ? 'Sādhu, sādhu, sādhu' : 'Well practised') : 'Short and sweet'}</h1>
        <p class="muted">${good ? `${fmtMin(m)} of ${o.kind === 'med' ? 'meditation' : 'focused study'} added.` : 'Sessions under a minute aren’t counted — every return still matters.'}${o.kind === 'study' ? ` ${wanders === 0 ? 'Not a single wander.' : `${wanders} wander${wanders > 1 ? 's' : ''} noticed.`}` : ''}</p>
        <div class="bignum dark">${h}<small>%</small></div>
        ${o.kind === 'study' && complete && o.breakMin ? `<button class="btn block" id="brk">Take a ${o.breakMin}-min mindful break</button>` : ''}
        <a class="btn ${o.kind === 'study' && complete && o.breakMin ? 'ghost' : ''} block" href="#today">Done</a>
        <p class="small muted">May the merit of this practice be shared with all beings.</p>
      </div>`;
      document.title = 'Sati — Meditate & Study';
      $('#brk')?.addEventListener('click', () => runSession({ kind: 'med', minutes: o.breakMin, tech: TECHNIQUES[0], interval: 0 }));
    }
    $('#pp').onclick = (e) => {
      if (pausedAt) { pausedFor += Date.now() - pausedAt; pausedAt = null; e.target.textContent = 'Pause'; }
      else { pausedAt = Date.now(); e.target.textContent = 'Resume'; }
    };
    $('#end').onclick = () => finish(false);
    cleanup = () => { if (!done) { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); keepAwake(false); document.body.classList.remove('immersive'); } };
  }

  /* ----- Learn (focus study + Dharma library) ----- */
  let studyPick = null;
  V.learn = () => {
    studyPick ??= { focus: S.goals.study >= 50 ? 50 : 25, brk: S.goals.study >= 50 ? 10 : 5, task: '' };
    const presets = [[25, 5], [50, 10], [90, 15]];
    return `<div class="stack">
      <div><div class="eyebrow">Learn</div><h1>Right effort, one session at a time</h1></div>
      <div class="card stack"><div class="row" style="gap:14px"><div style="flex:none">${padma('study', 72)}</div><div><h3>Focus study</h3><p class="small muted" style="margin:2px 0 0">Leaving Sati mid-session counts as a wander — an honest mirror, not a punishment.</p></div></div>
        <label class="field"><span>What are you working on?</span><input type="text" id="task" maxlength="60" placeholder="e.g. Chapter 3, essay draft, sutta reading" value="${esc(studyPick.task)}"></label>
        <div class="row wrap">${presets.map(([f, b]) => `<button class="chip" data-act="pre" data-f="${f}" data-b="${b}" aria-pressed="${studyPick.focus === f}">${f} / ${b} min</button>`).join('')}</div>
        <button class="btn block" data-act="go">Start ${studyPick.focus}-min focus</button>
      </div>
      <div class="row spread"><h2>Dharma library</h2><span class="small muted">${Object.keys(S.lessons).length}/${LESSONS.length} studied</span></div>
      ${LESSONS.map((l) => `<a class="card tap row spread" href="#lesson/${l.id}"><div><h3>${esc(l.title)}</h3><div class="small muted">${esc(l.pali)} · ${l.minutes} min</div></div>${S.lessons[l.id] ? '<span class="check" aria-label="Studied">✓</span>' : '<span class="muted">›</span>'}</a>`).join('')}
      ${orgFooter()}
    </div>`;
  };
  V.learn.bind = () => {
    view.addEventListener('input', (e) => { if (e.target.id === 'task') studyPick.task = e.target.value; });
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'pre') { studyPick.focus = +b.dataset.f; studyPick.brk = +b.dataset.b; render(); }
      if (b.dataset.act === 'go') runSession({ kind: 'study', minutes: studyPick.focus, breakMin: studyPick.brk, task: studyPick.task.trim() });
    });
  };

  V.lesson = (id) => {
    const l = LESSONS.find((x) => x.id === id) || LESSONS[0];
    return `<div class="stack lesson">
      <a href="#learn" class="small">‹ Library</a>
      <div><div class="eyebrow">${esc(l.pali)} · ${l.minutes} min</div><h1>${esc(l.title)}</h1></div>
      ${l.body.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="card"><h3 style="margin-bottom:6px">Key terms</h3>${l.terms.map(([t, m]) => `<div class="term"><b>${esc(t)}</b><span class="muted">${esc(m)}</span></div>`).join('')}</div>
      <div class="card stack"><div class="row spread"><h3>Practice cards</h3><span class="small muted" id="fc-n">1 / ${l.quiz.length}</span></div>
        <div class="flash" id="flash" role="button" tabindex="0" aria-live="polite"></div>
        <div class="row"><button class="btn ghost" style="flex:1" id="fc-flip">Show answer</button><button class="btn soft" style="flex:1" id="fc-next">Next</button></div>
      </div>
      ${S.lessons[l.id] ? '<p class="center check">✓ Studied</p>' : `<button class="btn block" id="done">Mark as studied (+${l.minutes} min study)</button>`}
    </div>`;
  };
  V.lesson.bind = (id) => {
    const l = LESSONS.find((x) => x.id === id) || LESSONS[0];
    let i = 0, flipped = false;
    const show = () => {
      $('#flash').textContent = flipped ? l.quiz[i].a : l.quiz[i].q;
      $('#flash').style.fontStyle = flipped ? 'italic' : 'normal';
      $('#fc-n').textContent = `${i + 1} / ${l.quiz.length}`;
      $('#fc-flip').textContent = flipped ? 'Show question' : 'Show answer';
    };
    const flip = () => { flipped = !flipped; show(); };
    $('#flash').onclick = flip; $('#fc-flip').onclick = flip;
    $('#flash').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    $('#fc-next').onclick = () => { i = (i + 1) % l.quiz.length; flipped = false; show(); };
    show();
    const done = $('#done');
    if (done) done.onclick = () => {
      S.lessons[l.id] = dayKey(); const d = day(); d.lessons++; d.study += l.minutes; save();
      toast('Sādhu! Lesson added to today’s practice.'); render();
    };
  };

  /* ----- Guard (the blocker equivalent) ----- */
  V.guard = () => {
    const active = S.guards.filter((g) => guardActive(g));
    const have = new Set(S.guards.map((g) => g.preset).filter(Boolean));
    const d = day();
    const gcard = (g) => {
      const on = guardActive(g);
      return `<div class="card guard">
        <div class="row spread"><div class="row"><div class="gicon">${padma(g.mood || 'sit', 44)}</div><div><h3>${esc(g.name)}</h3><div class="small muted">${daysText(g.days)} · ${g.start}–${g.end}${g.untilSit ? ' · until you sit' : ''}</div></div></div>
          ${on ? '<span class="status on">● Active</span>' : `<span class="status">${g.on ? 'Scheduled' : 'Off'}</span>`}</div>
        <div class="row spread applist"><span class="small muted">${g.apps?.length ? 'Selected apps' : 'Your list'}</span><span class="row" style="gap:4px">${(g.apps?.length ? g.apps : S.apps).map((a) => tile(a, 26)).join('')}</span></div>
        <div class="row"><button class="chip" data-act="toggle" data-v="${g.id}" aria-pressed="${g.on}">${g.on ? 'On' : 'Off'}</button><button class="chip" data-act="del" data-v="${g.id}">Remove</button></div>
      </div>`;
    };
    return `<div class="stack">
      <div class="row spread"><h1>Guard</h1><button class="btn sm" data-act="add">+ Add guard</button></div>
      <p class="small muted">A guard is a time when your doorways become stricter: five breaths instead of three, and only five minutes of intended use.</p>
      <h3 class="sect">Guarding now</h3>
      ${active.length ? active.map(gcard).join('') : '<div class="card small muted">Nothing is guarded right now. Pick a preset or add your own.</div>'}
      <h3 class="sect">Presets for you</h3>
      <div class="presets">${PRESETS.map((p) => `<button class="preset" data-act="preset" data-v="${p.preset}" style="--pb:${p.bg}" aria-pressed="${have.has(p.preset)}">
        <div class="pi">${padma(p.mood, 92)}</div><b>${p.name}</b><span>${p.sub}</span>${have.has(p.preset) ? '<em>✓ Added</em>' : ''}</button>`).join('')}</div>
      ${S.guards.filter((g) => !guardActive(g)).length ? `<h3 class="sect">Your guards</h3>${S.guards.filter((g) => !guardActive(g)).map(gcard).join('')}` : ''}
      <h3 class="sect">Your list</h3>
      <div class="card"><div class="row spread"><div><b>Distracting apps</b><div class="row" style="gap:4px;margin-top:8px;flex-wrap:wrap">${S.apps.map((a) => tile(a, 32)).join('')}</div></div><button class="chip" data-act="list">Edit</button></div></div>
      <div class="grid2"><div class="stat"><b>${d.present}</b><span>stayed present today</span></div><div class="stat"><b>${d.mindful}</b><span>opened with intention</span></div></div>
      <h3 class="sect">Set up a doorway</h3>
      <div class="card stack">
        <p class="small muted" style="margin:0">${NATIVE ? 'Sati stands at the door' : 'A web app can\u2019t lock other apps, so Sati stands at the door instead'}. Swap a distracting app’s icon for its doorway: three breaths, then a choice.</p>
        <select id="appsel">${S.apps.map((a) => `<option value="${a}">${appById(a).name}</option>`).join('')}</select>
        <input type="text" id="applink" readonly aria-label="Doorway link">
        <div class="row"><button class="btn soft" style="flex:1" id="copy">Copy link</button><a class="btn ghost" style="flex:1" id="try">Try it</a></div>
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
      ${orgFooter()}
    </div>`;
  };
  V.guard.bind = () => {
    const sel = $('#appsel'), link = $('#applink'), tryA = $('#try'), base = NATIVE ? 'sati://' : location.href.split('#')[0] + '#';
    const upd = () => { link.value = `${base}pause/${sel.value}`; tryA.href = `#pause/${sel.value}`; };
    if (sel) { sel.onchange = upd; upd(); }
    $('#copy').onclick = async () => { try { await navigator.clipboard.writeText(link.value); toast('Link copied'); } catch { link.select(); toast('Select and copy the link'); } };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act, v = b.dataset.v;
      if (a === 'preset') {
        const ex = S.guards.find((g) => g.preset === v);
        if (ex) S.guards = S.guards.filter((g) => g !== ex);
        else { const p = PRESETS.find((x) => x.preset === v); S.guards.push({ id: 'g' + Date.now(), preset: p.preset, name: p.name, mood: p.mood, start: p.start, end: p.end, days: p.days, untilSit: !!p.untilSit, apps: [], on: true }); toast(`${p.name} added`); }
        save(); render();
      }
      if (a === 'toggle') { const g = S.guards.find((x) => x.id === v); g.on = !g.on; save(); render(); }
      if (a === 'del') { S.guards = S.guards.filter((x) => x.id !== v); save(); render(); }
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
    sheet(`<h2>New guard</h2>
      <label class="field"><span>Name</span><input type="text" name="name" maxlength="30" placeholder="e.g. Exam week" required></label>
      <div class="grid2"><label class="field"><span>From</span><input type="time" name="start" value="09:00"></label><label class="field"><span>To</span><input type="time" name="end" value="12:00"></label></div>
      <div><span class="small muted">Days</span><div class="row wrap" style="margin-top:6px">${DAYN.map((n, i) => `<label class="chip"><input type="checkbox" name="d${i}" ${i > 0 && i < 6 ? 'checked' : ''} style="margin:0 6px 0 0">${n}</label>`).join('')}</div></div>
      <div class="row"><button class="btn ghost" style="flex:1" value="cancel" formnovalidate>Cancel</button><button class="btn" style="flex:1" value="save">Add</button></div>`, (dlg) => {
      dlg.addEventListener('close', () => {
        if (dlg.returnValue !== 'save') return;
        const f = new FormData(dlg.querySelector('form')), days = DAYN.map((_, i) => i).filter((i) => f.get('d' + i));
        if (!days.length) return toast('Pick at least one day');
        S.guards.push({ id: 'g' + Date.now(), name: String(f.get('name')).trim() || 'Guard', mood: 'sit', start: f.get('start') || '09:00', end: f.get('end') || '12:00', days, apps: [], on: true });
        save(); render(); toast('Guard added');
      });
    });
  }

  /* ----- the doorway (intervention screen) ----- */
  V.pause = (appId) => {
    const app = appById(appId);
    if (!app) { location.replace('#guard'); return ''; }
    const g = guardFor(app.id);
    return `<div class="stack center" style="padding-top:10px">
      ${g ? `<div class="pill warn">${esc(g.name)} is guarding until ${g.end}</div>` : '<div class="eyebrow">Mindful pause</div>'}
      <h1 id="ph">Breathe in…</h1>
      <div class="orb" id="orb"></div>
      <p class="muted" id="pc">${g ? 'Five' : 'Three'} breaths before ${esc(app.name)}.</p>
      <div id="choice" class="stack hidden" style="text-align:left">
        <h2 class="center">Why are you opening ${esc(app.name)}?</h2>
        <button class="opt" data-act="present">I’ll stay present instead <span class="small muted">· close and come back to now</span></button>
        <p class="small muted center" style="margin-top:14px">Or use it with an intention:</p>
        <div class="row wrap" style="justify-content:center">${(g ? [5] : [5, 10, 15, 30]).map((m) => `<button class="chip" data-act="use" data-v="${m}">${m} min</button>`).join('')}</div>
      </div>
      <div id="after" class="stack hidden"></div>
    </div>`;
  };
  V.pause.bind = (appId) => {
    const app = appById(appId); if (!app) return;
    const breaths = guardFor(app.id) ? 5 : 3;
    document.body.classList.add('immersive');
    const orb = $('#orb'), ph = $('#ph');
    let n = 0, t, stopped = false;
    const cycle = () => {
      if (stopped) return;
      if (n >= breaths) { ph.textContent = 'Now, choose.'; $('#pc').classList.add('hidden'); orb.classList.add('hidden'); $('#choice').classList.remove('hidden'); return; }
      ph.textContent = 'Breathe in…'; orb.classList.add('in');
      t = setTimeout(() => { ph.textContent = 'Breathe out…'; orb.classList.remove('in'); t = setTimeout(() => { n++; $('#pc').textContent = `${n} of ${breaths}`; cycle(); }, 4000); }, 4000);
    };
    t = setTimeout(cycle, 300);
    cleanup = () => { stopped = true; clearTimeout(t); document.body.classList.remove('immersive'); };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const d = day(), after = $('#after');
      $('#choice').classList.add('hidden'); after.classList.remove('hidden');
      if (b.dataset.act === 'present') {
        d.present++; save();
        ph.textContent = 'Sādhu.';
        after.innerHTML = `<div class="mini-scene">${landscape(S.scene, health(), 'happy')}</div><p>You chose presence. Padma brightens.</p><a class="btn block" href="#sit">Sit for a minute</a><a class="btn ghost block" href="#today">Back to today</a>`;
      } else {
        const m = b.dataset.v; d.mindful++; save();
        ph.textContent = `${m} minutes, with intention.`;
        after.innerHTML = `<p class="muted">Set a ${m}-minute timer if it helps, and notice the urge to keep going when it ends.</p>
          ${app.scheme ? `<a class="btn block" href="${app.scheme}">Open ${esc(app.name)}</a>` : ''}<a class="btn ghost block" href="#today">Not now</a>`;
      }
    });
  };

  /* ----- Stats + rewards ----- */
  V.stats = () => {
    const days7 = [...Array(7)].map((_, i) => addDays(new Date(), i - 6));
    const rows = days7.map((d) => ({ d, k: dayKey(d), v: peek(dayKey(d)) || blankDay() }));
    const max = Math.max(30, ...rows.map((r) => r.v.med + r.v.study));
    const totM = rows.reduce((a, r) => a + r.v.med, 0), totS = rows.reduce((a, r) => a + r.v.study, 0);
    const scores = rows.map((r) => score(r.k)).filter((x) => x != null);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) + '%' : '—';
    const all = Object.values(S.days);
    const present = all.reduce((a, d) => a + (d.present || 0), 0), mindful = all.reduce((a, d) => a + (d.mindful || 0), 0);
    const scr = rows.map((r) => r.v.screen).filter((x) => x != null), pk = rows.map((r) => r.v.pickups).filter((x) => x != null);
    const appTot = {}; rows.forEach((r) => Object.entries(r.v.apps || {}).forEach(([a, m]) => { appTot[a] = (appTot[a] || 0) + m; }));
    const tops = Object.entries(appTot).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const now = new Date(), first = new Date(now.getFullYear(), now.getMonth(), 1), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const best = Math.max(bestStreak(), streak());
    return `<div class="stack">
      <div><div class="eyebrow">Stats</div><h1>Your practice</h1></div>
      <div class="grid2">
        <div class="stat"><b>${fmtMin(totM)}</b><span>meditation, 7 days</span></div>
        <div class="stat"><b>${fmtMin(totS)}</b><span>study, 7 days</span></div>
        <div class="stat"><b>${avg}</b><span>average clarity</span></div>
        <div class="stat"><b>${scr.length ? fmtMin(scr.reduce((a, b) => a + b) / scr.length * 60) : '—'}</b><span>avg screen time${pk.length ? ` · ${Math.round(pk.reduce((a, b) => a + b) / pk.length)} pickups` : ''}</span></div>
      </div>
      <div class="card stack"><h3>Last 7 days</h3>
        <div class="chart">${rows.map((r) => `<div><div class="col" title="${r.k}: ${fmtMin(r.v.med)} meditation, ${fmtMin(r.v.study)} study">
          <div class="seg s" style="height:${r.v.study / max * 100}%"></div><div class="seg m" style="height:${r.v.med / max * 100}%"></div></div>
          <div class="lbl">${r.d.toLocaleDateString('en-AU', { weekday: 'narrow' })}</div></div>`).join('')}</div>
        <div class="legend"><span><i style="background:var(--accent)"></i>Meditation</span><span><i style="background:var(--leaf)"></i>Study</span></div>
      </div>
      <div class="card stack"><h3>${now.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</h3>
        <div class="cal">${[...Array(first.getDay())].map(() => '<div class="blank"></div>').join('')}${[...Array(dim)].map((_, i) => {
          const k = dayKey(new Date(now.getFullYear(), now.getMonth(), i + 1));
          return `<div title="${k}">${score(k) == null ? `<small>${i + 1}</small>` : emoji(score(k))}</div>`;
        }).join('')}</div>
        <p class="small muted">\u{1FAB7} blooming · \u{1F338} bright · \u{1F331} clouded · \u{1F940} wilting</p>
      </div>
      <div class="card stack"><h3>Top distractions this week</h3>
        ${tops.length ? tops.map(([id, m]) => `<div class="offender light">${tile(id)}<div><b>${esc(appById(id)?.name || id)}</b></div><em>${fmtMin(m)}</em></div>`).join('') : '<p class="small muted">Add your Screen Time numbers from the Home tab to see them here.</p>'}
        <div class="grid2"><div class="stat"><b>${present}</b><span>times you stayed present</span></div><div class="stat"><b>${mindful}</b><span>opened with intention</span></div></div>
      </div>
      <div class="card stack"><div class="row spread"><h3>Rewards</h3><span class="small muted">best streak ${best} day${best === 1 ? '' : 's'}</span></div>
        <p class="small muted">Practise on consecutive days to unlock new worlds for Padma.</p>
        <div class="scenes">${SCENES.map((s) => { const open = best >= s.streak; return `<button class="scene-card" data-act="scene" data-v="${s.id}" ${open ? '' : 'disabled'} aria-pressed="${S.scene === s.id}">
          <div class="thumb">${landscape(s.id, 95, open ? 'happy' : null)}${open ? '' : '<span class="lock">\u{1F512}</span>'}</div>
          <b>${s.name}</b><span>${open ? (S.scene === s.id ? 'In use' : 'Tap to use') : `${s.streak}-day streak`}</span></button>`; }).join('')}</div>
      </div>
      ${orgFooter()}
    </div>`;
  };
  V.stats.bind = () => {
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act=scene]'); if (!b || b.disabled) return;
      S.scene = b.dataset.v; save(); applyTheme(); render(); toast(`${scene(S.scene).name} unlocked for Padma`);
    });
  };

  /* ----- settings ----- */
  V.settings = () => `<div class="stack">
    <a href="#today" class="small">‹ Home</a>
    <h1>Settings</h1>
    <div class="card stack"><h3>Daily goals</h3>
      <label class="field"><span>Meditation (minutes)</span><input type="number" min="1" max="240" id="g-med" value="${S.goals.meditate}"></label>
      <label class="field"><span>Study (minutes)</span><input type="number" min="5" max="600" id="g-study" value="${S.goals.study}"></label>
      <label class="field"><span>Screen time limit (hours)</span><input type="number" min="0.5" max="16" step="0.5" id="g-scr" value="${S.goals.screen}"></label>
    </div>
    <div class="card stack"><h3>Appearance & sound</h3>
      <div class="row wrap">${['auto', 'light', 'dark'].map((t) => `<button class="chip" data-act="theme" data-v="${t}" aria-pressed="${S.theme === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
      <div class="row spread"><span>Meditation bell</span><div class="row"><button class="chip" data-act="bell" aria-pressed="${S.bell}">${S.bell ? 'On' : 'Off'}</button><button class="chip" data-act="testbell">Test</button></div></div>
    </div>
    <div class="card stack"><h3>Practice reminders</h3>
      <p class="small muted">${NATIVE ? 'A gentle notification each day at these times.' : 'Adds two daily events, with alerts, to your phone\u2019s calendar.'}</p>
      <div class="grid2"><label class="field"><span>Morning sit</span><input type="time" id="r-am" value="${S.reminders.morning}"></label>
      <label class="field"><span>Evening study</span><input type="time" id="r-pm" value="${S.reminders.evening}"></label></div>
      ${NATIVE ? `<div class="row spread"><span>Daily reminders</span><button class="chip" data-act="notify" aria-pressed="${S.notify}">${S.notify ? 'On' : 'Off'}</button></div>` : '<button class="btn soft block" data-act="ics">Add to calendar (.ics)</button>'}
    </div>
    ${NATIVE ? `<div class="card stack"><h3>Apple Health</h3>
      <p class="small muted">Save each completed meditation to Apple Health as Mindful Minutes. Sati never reads your health data.</p>
      <div class="row spread"><span>Log Mindful Minutes</span><button class="chip" data-act="health" aria-pressed="${S.health}">${S.health ? 'On' : 'Off'}</button></div>
    </div>` : `<div class="card stack"><h3>Install Sati</h3>
      <p class="small muted"><b>iPhone:</b> in Safari, tap Share › Add to Home Screen. <b>Android:</b> in Chrome, tap ⋮ › Install app. It then works offline like a normal app. Long-press the icon on Android for Sit, Learn and Guard shortcuts.</p>
    </div>`}
    <div class="card stack"><h3>Your data</h3>
      <p class="small muted">Everything stays on this device. Nothing is sent to the Society or anyone else.</p>
      <div class="row">${NATIVE ? '' : '<button class="btn ghost" style="flex:1" data-act="export">Export</button>'}<button class="btn ghost" style="flex:1" data-act="onb">Redo intro</button></div>
      <button class="btn ghost block" data-act="reset" style="color:var(--warn)">Erase all data</button>
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
      if (a === 'export') download(`sati-${dayKey()}.json`, JSON.stringify(S, null, 2), 'application/json');
      if (a === 'onb') { S.onboarded = false; save(); location.hash = '#welcome'; }
      if (a === 'reset' && confirm('Erase all your practice history on this device?')) { localStorage.removeItem(KEY); S = defaults(); applyTheme(); location.hash = '#welcome'; }
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
        { id: 101, title: 'Time to sit \u{1FAB7}', body: 'Padma is waiting. A few minutes of stillness?', schedule: { on: on(S.reminders.morning), allowWhileIdle: true }, extra: { hash: '#sit' } },
        { id: 102, title: 'Evening study \u{1F4D6}', body: 'One focused session, one gentle return at a time.', schedule: { on: on(S.reminders.evening), allowWhileIdle: true }, extra: { hash: '#learn' } }
      ] });
      return true;
    } catch { return false; }
  }
  async function cancelReminders() {
    try { await plug('LocalNotifications')?.cancel({ notifications: [{ id: 101 }, { id: 102 }] }); } catch { /* none scheduled */ }
    return false;
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
      ...ev('pm', S.reminders.evening, '\u{1F4D6} Evening study', '#learn'),
      'END:VCALENDAR'].join('\r\n');
  }

  /* ----- onboarding ----- */
  let ob = 0;
  const OB_STEPS = 6;
  const obH = () => Math.max(5, Math.round(100 - S.profile.hours * 9));
  V.welcome = () => {
    const P = S.profile, dots = `<div class="dots">${[...Array(OB_STEPS)].map((_, i) => `<i class="${i === ob ? 'on' : ''}"></i>`).join('')}</div>`;
    const q = (key, opts) => opts.map(([v, l]) => `<button class="opt" data-act="ans" data-k="${key}" data-v="${v}" aria-pressed="${P[key] === v}">${l}</button>`).join('');
    const steps = [
      () => `<div class="center stack"><div class="mini-scene">${landscape('pond', 95, 'happy')}</div>
        <div class="eyebrow">${ORG.name}</div><h1 class="wordmark dark">SATI</h1>
        <p class="muted">Meet Padma. Padma blooms when you meditate, study with focus and meet your phone with a pause instead of a reflex.</p></div>`,
      () => `<div class="stack center"><h2>See for yourself</h2><p class="muted" style="margin-top:-6px">How many hours a day are you on your phone?</p>
        <div class="mini-scene" id="ob-scene">${landscape('pond', obH(), moodOf(obH()))}</div>
        <div class="bignum dark" id="ob-h">${P.hours}<small>h</small></div>
        <input type="range" id="hours" min="0" max="12" step="0.5" value="${P.hours}" aria-label="Hours per day">
        <p class="small muted">Not sure? Check Settings › Screen Time.</p></div>`,
      () => `<div class="stack"><h2>When does the scroll pull hardest?</h2>${q('scroll', [['morning', 'First thing in the morning'], ['study', 'While I’m studying or working'], ['evening', 'In the evening'], ['night', 'Late at night, in bed']])}
        <h2 style="margin-top:22px">What brings you here?</h2>${q('why', [['calm', 'A calmer mind'], ['focus', 'Better focus for study'], ['dharma', 'Learning the Dharma'], ['sleep', 'Better sleep']])}</div>`,
      () => { const pr = PROFILES[P.scroll]; return `<div class="stack center"><div class="eyebrow">Your pattern</div><h1>${pr.name}</h1>
        <div>${padma(P.scroll === 'night' ? 'sleep' : 'ok', 120)}</div>
        <p>${pr.text}</p><div class="card small" style="text-align:left"><b>In the Buddha’s terms:</b> this pull often looks like <i>${pr.hindrance.toLowerCase()}</i>, one of the five hindrances. Recognising it is the first step. You’ll find a lesson on it in Learn.</div></div>`; },
      () => { const remain = Math.max(5, 85 - P.age), lost = Math.round(P.hours / 16 * remain * 10) / 10, back = Math.round(lost / 2 * 10) / 10;
        const cells = Math.min(80, remain), red = Math.round(P.hours / 16 * cells);
        return `<div class="stack center"><h2>At ${P.hours}h a day, that’s about <span style="color:var(--warn)">${lost} years</span> of your waking life on a screen.</h2>
        <label class="field" style="text-align:left"><span>Your age: <b id="agev">${P.age}</b></span><input type="range" id="age" min="12" max="80" value="${P.age}"></label>
        <div class="life" id="life">${[...Array(cells)].map((_, i) => `<i class="${i < red ? 'phone' : ''}"></i>`).join('')}</div>
        <p class="small muted">Each square is one year until 85. Coloured squares are years on the phone (of 16 waking hours a day).</p>
        <p><b>Halve it and you get back ${back} years</b>, enough for more than ${Math.round(back * 365 * 0.5 * 60 / 20).toLocaleString('en-AU')} twenty-minute sits.</p></div>`; },
      () => `<div class="stack"><h2>Set a gentle daily intention</h2>
        <h3>Meditate</h3><div class="row wrap">${[5, 10, 20, 30].map((m) => `<button class="chip" data-act="goal" data-k="meditate" data-v="${m}" aria-pressed="${S.goals.meditate === m}">${m} min</button>`).join('')}</div>
        <h3>Study</h3><div class="row wrap">${[25, 50, 90, 120].map((m) => `<button class="chip" data-act="goal" data-k="study" data-v="${m}" aria-pressed="${S.goals.study === m}">${m} min</button>`).join('')}</div>
        <h3>Screen time, at most</h3><div class="row wrap">${[1, 2, 3, 4].map((m) => `<button class="chip" data-act="goal" data-k="screen" data-v="${m}" aria-pressed="${S.goals.screen === m}">${m}h</button>`).join('')}</div>
        <p class="small muted">Free, no account, no ads. Your practice stays on your device.</p></div>`
    ];
    return `<div class="onb">${dots}<div>${steps[ob]()}</div>
      <div class="stack"><button class="btn block" data-act="next">${ob === 0 ? 'Begin' : ob === OB_STEPS - 1 ? 'Start practising' : 'Continue'}</button>
      ${ob === 0 ? '<button class="btn ghost block" data-act="skip">Skip intro</button>' : '<button class="btn ghost block" data-act="back">Back</button>'}</div></div>`;
  };
  V.welcome.bind = () => {
    document.body.classList.add('immersive');
    cleanup = () => document.body.classList.remove('immersive');
    const P = S.profile;
    const hr = $('#hours');
    if (hr) hr.oninput = () => { P.hours = Number(hr.value); $('#ob-h').innerHTML = `${P.hours}<small>h</small>`; $('#ob-scene').innerHTML = landscape('pond', obH(), moodOf(obH())); save(); };
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
      if (a === 'next' && ob < OB_STEPS - 1) { if (ob === 0) bell(0.6); ob++; window.scrollTo(0, 0); return render(); }
      if (a === 'next' || a === 'skip') {
        if (a === 'next' && S.goals.screen === defaults().goals.screen && P.hours <= 3) S.goals.screen = Math.max(1, P.hours - 1);
        S.onboarded = true; ob = 0; save(); location.hash = '#today';
      }
    });
  };

  /* ---------- router ---------- */
  const ALIAS = { meditate: 'sit', study: 'learn', insights: 'stats' };
  function render() {
    cleanup?.(); cleanup = null;
    const fresh = view.cloneNode(false); view.replaceWith(fresh); view = fresh; // drop old delegated listeners
    let [name, arg] = location.hash.replace(/^#/, '').split('/');
    name = ALIAS[name] || name;
    if (name === 'pause' && !arg) name = 'guard';
    if (!S.onboarded && name !== 'pause') name = 'welcome';
    if (!V[name]) name = 'today';
    view.innerHTML = V[name](arg && decodeURIComponent(arg));
    V[name].bind?.(arg && decodeURIComponent(arg));
    const tab = name === 'lesson' ? 'learn' : name === 'pause' ? 'guard' : name;
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
    const t = { today: 'Sati', sit: 'Sit', learn: 'Learn', lesson: 'Learn', guard: 'Guard', pause: 'Pause', stats: 'Stats', settings: 'Settings', welcome: 'Welcome' }[name];
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
