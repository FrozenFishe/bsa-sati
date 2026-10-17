/* Sati — Meditate & Study. Buddhist Society of Australia.
   Everything is stored on the device (localStorage); there is no server. */
(() => {
  'use strict';

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

  // Streak thresholds that unlock lotus colours (from the original's unlockable themes).
  const PALETTES = [
    { id: 'lotus', name: 'Lotus', streak: 0, color: '#d86a85' },
    { id: 'saffron', name: 'Saffron robe', streak: 3, color: '#e07a4a' },
    { id: 'forest', name: 'Forest monastery', streak: 7, color: '#6f9b55' },
    { id: 'moon', name: 'Full moon (Uposatha)', streak: 14, color: '#6a83c4' },
    { id: 'gold', name: 'Bodhi gold', streak: 30, color: '#c99a1c' }
  ];

  // Doorway targets for the mindful pause; schemes reopen the app after an intention is set.
  const APPS = [
    { id: 'instagram', name: 'Instagram', scheme: 'instagram://' },
    { id: 'tiktok', name: 'TikTok', scheme: 'snssdk1233://' },
    { id: 'youtube', name: 'YouTube', scheme: 'youtube://' },
    { id: 'x', name: 'X (Twitter)', scheme: 'twitter://' },
    { id: 'facebook', name: 'Facebook', scheme: 'fb://' },
    { id: 'reddit', name: 'Reddit', scheme: 'reddit://' },
    { id: 'snapchat', name: 'Snapchat', scheme: 'snapchat://' },
    { id: 'other', name: 'Another app', scheme: '' }
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
    profile: { hours: 4, age: 30, scroll: 'evening', why: 'calm', exp: 'little' },
    goals: { meditate: 10, study: 25, screen: 3 },
    days: {},
    lessons: {},
    palette: 'lotus',
    theme: 'auto',
    bell: true,
    reminders: { morning: '07:00', evening: '19:30' },
    created: Date.now()
  });
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = defaults(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };

  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const day = (k = dayKey()) => (S.days[k] ||= { med: 0, study: 0, present: 0, mindful: 0, wanders: 0, lessons: 0, screen: null });
  const peek = (k) => S.days[k];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`);

  /* ---------- scoring: the "clarity" score drives the lotus ---------- */
  function score(k) {
    const d = peek(k);
    if (!d) return null;
    const active = d.med || d.study || d.present || d.mindful || d.lessons || d.screen != null;
    if (!active) return null;
    const g = S.goals;
    let s = 40;
    s += Math.min(d.med / g.meditate, 1) * 25;
    s += Math.min(d.study / g.study, 1) * 15;
    s += Math.min(d.present * 3 + d.mindful, 12);
    s += Math.min(d.lessons * 4, 8);
    if (d.screen != null) {
      const over = d.screen - g.screen;
      s += over > 0 ? -over * 8 : Math.min(-over * 4, 10);
    }
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
  const mood = (h) => (h >= 80 ? 'Blooming' : h >= 60 ? 'Opening' : h >= 40 ? 'Resting' : h >= 20 ? 'Wilting' : 'Needs care');
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

  /* ---------- lotus avatar ---------- */
  function lotus(h, opts = {}) {
    const t = Math.max(0, Math.min(1, h / 100));
    const open = 0.2 + 0.8 * t, size = 0.78 + 0.22 * t, droop = (1 - t) * 28;
    const back = [-70, -38, 38, 70], front = [-48, -18, 18, 48];
    const petal = 'M0 0 C-20 -18 -19 -62 0 -86 C19 -62 20 -18 0 0Z';
    const p = (a, fill, s) => `<path class="petal" d="${petal}" fill="${fill}" transform="rotate(${(a * open).toFixed(1)}) scale(${(s * size).toFixed(3)})"/>`;
    const mouth = t > 0.6 ? 'M-7 6 Q0 12 7 6' : t > 0.35 ? 'M-6 8 L6 8' : 'M-7 10 Q0 5 7 10';
    return `<svg class="lotus ${opts.breathe ? 'breathe' : ''}" viewBox="0 0 220 200" role="img" aria-label="Lotus, ${mood(h).toLowerCase()}">
      <ellipse cx="110" cy="176" rx="96" ry="14" fill="var(--leaf)" opacity=".25"/>
      <path d="M30 172 Q70 150 110 166 Q150 150 192 172 Q150 186 110 180 Q70 186 30 172Z" fill="var(--leaf)" opacity="${0.55 + 0.4 * t}"/>
      <g transform="translate(110 160) rotate(${droop.toFixed(1)} 0 0)" style="filter:saturate(${(0.35 + 0.65 * t).toFixed(2)})">
        ${back.map((a) => p(a, 'var(--petal-b)', 0.95)).join('')}
        ${front.map((a) => p(a, 'var(--petal-a)', 0.88)).join('')}
        ${p(0, 'var(--petal-a)', 1)}
        <g transform="translate(0 -40)" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round" opacity=".7">
          <path d="M-12 -2 Q-8 2 -4 -2M4 -2 Q8 2 12 -2"/><path d="${mouth}"/>
        </g>
      </g>
    </svg>`;
  }

  /* ---------- sound: synthesised singing bowl ---------- */
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

  /* ---------- theming ---------- */
  function applyTheme() {
    const r = document.documentElement;
    if (S.palette && S.palette !== 'lotus') r.dataset.palette = S.palette; else delete r.dataset.palette;
    if (S.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = S.theme;
  }

  /* ---------- views ---------- */
  let view = $('#view');
  let cleanup = null;
  const orgFooter = () => `<footer class="org">${ORG.name}<br>ACNC registered charity · ABN ${ORG.abn}</footer>`;

  function greet() {
    const h = new Date().getHours();
    return h < 5 ? 'A quiet night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }

  function weekStrip() {
    const start = addDays(new Date(), -6), names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return `<div class="week">${[...Array(7)].map((_, i) => {
      const d = addDays(start, i), k = dayKey(d);
      return `<div class="${i === 6 ? 'today' : ''}"><div class="d">${names[d.getDay()]}</div><div class="e" title="${k}">${emoji(score(k))}</div></div>`;
    }).join('')}</div>`;
  }

  function nextLesson() { return LESSONS.find((l) => !S.lessons[l.id]) || LESSONS[0]; }

  const V = {};

  V.today = () => {
    const d = day(), h = health(), st = streak(), g = S.goals, nl = nextLesson();
    const sc = score(dayKey());
    return `<div class="stack">
      <div class="row spread"><div><div class="eyebrow">${new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>${greet()}</h1></div>
        <a class="chip" href="#settings" aria-label="Settings">Settings</a></div>
      <div class="card center">
        <div class="lotus-wrap">${lotus(h, { breathe: true })}</div>
        <div class="score">${h}<small>clarity</small></div>
        <div class="muted">${mood(h)}${sc == null ? ' · practise today to tend your lotus' : ''}</div>
        <div class="row" style="justify-content:center;margin-top:10px"><span class="badge">${st}-day streak</span></div>
      </div>
      <div class="card stack">
        <div><div class="row spread small"><span>Meditation</span><span class="muted">${fmtMin(d.med)} / ${g.meditate}m</span></div><div class="bar"><i style="width:${Math.min(100, d.med / g.meditate * 100)}%"></i></div></div>
        <div><div class="row spread small"><span>Study</span><span class="muted">${fmtMin(d.study)} / ${g.study}m</span></div><div class="bar"><i style="width:${Math.min(100, d.study / g.study * 100)}%;background:var(--leaf)"></i></div></div>
      </div>
      <div class="grid2">
        <a class="card tap" href="#meditate"><div class="eyebrow">Sit</div><h3>Meditate ${g.meditate} min</h3><p class="small muted">Breath, metta, body scan</p></a>
        <a class="card tap" href="#study"><div class="eyebrow">Focus</div><h3>Study session</h3><p class="small muted">${g.study} min with breaks</p></a>
        <a class="card tap" href="#lesson/${nl.id}"><div class="eyebrow">Dharma</div><h3>${esc(nl.title)}</h3><p class="small muted">${nl.minutes} min read</p></a>
        <a class="card tap" href="#pause"><div class="eyebrow">Phone</div><h3>Mindful pause</h3><p class="small muted">${d.present} stayed present today</p></a>
      </div>
      <div class="card stack">
        <div class="row spread"><h3>Screen time today</h3><span class="small muted">goal ≤ ${g.screen}h</span></div>
        <p class="small muted">Copy it from Settings › Screen Time (iPhone) or Digital Wellbeing (Android).</p>
        <div class="row"><button class="chip" data-act="scr" data-v="-0.5" aria-label="Less">−</button>
          <div class="score" style="font-size:32px;flex:1;text-align:center">${d.screen == null ? '—' : d.screen + 'h'}</div>
          <button class="chip" data-act="scr" data-v="0.5" aria-label="More">+</button></div>
      </div>
      <div class="card"><div class="row spread" style="margin-bottom:8px"><h3>This week</h3><a class="small" href="#insights">Insights</a></div>${weekStrip()}</div>
      ${orgFooter()}
    </div>`;
  };
  V.today.bind = () => {
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act=scr]'); if (!b) return;
      const d = day(); d.screen = Math.max(0, Math.min(24, (d.screen ?? S.profile.hours) + Number(b.dataset.v)));
      save(); render();
    });
  };

  /* ----- meditate ----- */
  let medPick = { tech: 'breath', min: null, interval: 0 };
  V.meditate = () => {
    medPick.min ??= S.goals.meditate;
    const durs = [3, 5, 10, 15, 20, 30, 45, 60];
    return `<div class="stack">
      <div><div class="eyebrow">Meditate</div><h1>Sit with what is</h1></div>
      <div class="card stack"><h3>Practice</h3>
        <div class="grid2">${TECHNIQUES.map((t) => `<button class="opt" data-act="tech" data-v="${t.id}" aria-pressed="${medPick.tech === t.id}"><b>${t.name}</b><br><span class="small muted">${t.sub}</span></button>`).join('')}</div>
      </div>
      <div class="card stack"><h3>Duration</h3>
        <div class="row wrap">${durs.map((m) => `<button class="chip" data-act="dur" data-v="${m}" aria-pressed="${medPick.min === m}">${m} min</button>`).join('')}</div>
        <h3>Interval bell</h3>
        <div class="row wrap">${[[0, 'Off'], [1, 'Every min'], [5, 'Every 5 min'], [10, 'Every 10 min']].map(([v, l]) => `<button class="chip" data-act="int" data-v="${v}" aria-pressed="${medPick.interval === v}">${l}</button>`).join('')}</div>
      </div>
      <button class="btn block" data-act="start">Begin · ${medPick.min} min</button>
      <p class="small muted center">The bell sounds at the start and end. Your screen stays on while you sit.</p>
    </div>`;
  };
  V.meditate.bind = () => {
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

  /* ----- shared immersive timer ----- */
  function ring(frac, label) {
    const C = 2 * Math.PI * 120;
    return `<svg class="ring" viewBox="0 0 260 260"><circle class="track" cx="130" cy="130" r="120"/><circle class="prog" cx="130" cy="130" r="120" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/><text x="130" y="130">${label}</text></svg>`;
  }
  const mmss = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

  function runSession(o) {
    // o: { kind: 'med'|'study', minutes, tech?, interval?, task?, breakMin? }
    bell(); keepAwake(true);
    document.body.classList.add('immersive');
    const total = o.minutes * 60, startedAt = Date.now();
    let pausedAt = null, pausedFor = 0, lastInt = 0, cueIdx = -1, done = false, away = false;
    const cues = o.tech?.cues || [];
    const title = o.kind === 'med' ? `${o.tech.name}` : (o.task ? esc(o.task) : 'Focus');
    view.innerHTML = `<div class="stack center" style="padding-top:20px">
      <div class="eyebrow">${o.kind === 'med' ? 'Meditating' : 'Studying'}</div><h2>${title}</h2>
      <div id="ring"></div>
      <p class="cue" id="cue">${o.kind === 'study' ? 'One thing at a time. If you leave the app, Sati will gently count it.' : ''}</p>
      ${o.kind === 'study' ? '<p class="small muted" id="wan">Wanders: 0</p>' : ''}
      <div class="row" style="justify-content:center"><button class="btn ghost" id="pp">Pause</button><button class="btn soft" id="end">End</button></div>
    </div>`;
    const elapsed = () => ((pausedAt || Date.now()) - startedAt - pausedFor) / 1000;
    let wanders = 0;
    const onVis = () => {
      if (o.kind !== 'study' || done) return;
      if (document.hidden) away = true;
      else if (away) { away = false; wanders++; $('#wan') && ($('#wan').textContent = `Wanders: ${wanders}`); toast('Welcome back. Notice where the mind went, and return.'); }
    };
    document.addEventListener('visibilitychange', onVis);
    const tick = () => {
      const el = Math.min(elapsed(), total), left = total - el;
      $('#ring').innerHTML = ring(el / total, mmss(Math.ceil(left)));
      if (cues.length) {
        const i = Math.min(cues.length - 1, Math.floor(el / (total / cues.length)));
        if (i !== cueIdx) { cueIdx = i; const c = $('#cue'); c.style.opacity = 0; setTimeout(() => { c.textContent = cues[i]; c.style.opacity = 1; }, 400); }
      }
      if (o.interval && !pausedAt) { const k = Math.floor(el / (o.interval * 60)); if (k > lastInt && left > 2) { lastInt = k; bell(0.5); } }
      if (left <= 0) finish(true);
    };
    const iv = setInterval(tick, 250); tick();
    function finish(complete) {
      if (done) return; done = true;
      clearInterval(iv); document.removeEventListener('visibilitychange', onVis);
      keepAwake(false); if (complete) bell();
      const mins = Math.round(Math.min(elapsed(), total) / 60 * 10) / 10;
      const d = day();
      if (mins >= 1) { if (o.kind === 'med') d.med += mins; else d.study += mins; }
      d.wanders += wanders; save();
      document.body.classList.remove('immersive');
      const h = health();
      view.innerHTML = `<div class="stack center" style="padding-top:20px">
        <div class="lotus-wrap">${lotus(h)}</div>
        <h1>${mins >= 1 ? (complete ? 'Sādhu, sādhu, sādhu' : 'Well practised') : 'Short and sweet'}</h1>
        <p class="muted">${mins >= 1 ? `${fmtMin(mins)} of ${o.kind === 'med' ? 'meditation' : 'focused study'} added.` : 'Sessions under a minute aren’t counted — every return still matters.'}${o.kind === 'study' ? ` ${wanders === 0 ? 'Not a single wander.' : `${wanders} wander${wanders > 1 ? 's' : ''} noticed.`}` : ''}</p>
        <p class="score">${h}<small>clarity</small></p>
        ${o.kind === 'study' && complete && o.breakMin ? `<button class="btn block" id="brk">Take a ${o.breakMin}-min mindful break</button>` : ''}
        <a class="btn ${o.kind === 'study' && complete && o.breakMin ? 'ghost' : ''} block" href="#today">Done</a>
        <p class="small muted">May the merit of this practice be shared with all beings.</p>
      </div>`;
      $('#brk')?.addEventListener('click', () => runSession({ kind: 'med', minutes: o.breakMin, tech: TECHNIQUES[0], interval: 0 }));
    }
    $('#pp').onclick = (e) => {
      if (pausedAt) { pausedFor += Date.now() - pausedAt; pausedAt = null; e.target.textContent = 'Pause'; }
      else { pausedAt = Date.now(); e.target.textContent = 'Resume'; }
    };
    $('#end').onclick = () => finish(false);
    cleanup = () => { if (!done) { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); keepAwake(false); document.body.classList.remove('immersive'); } };
  }

  /* ----- study ----- */
  let studyPick = null;
  V.study = () => {
    studyPick ??= { focus: S.goals.study >= 50 ? 50 : 25, brk: S.goals.study >= 50 ? 10 : 5, task: '' };
    const presets = [[25, 5], [50, 10], [90, 15]];
    return `<div class="stack">
      <div><div class="eyebrow">Study</div><h1>Right effort, one session at a time</h1></div>
      <div class="card stack"><h3>Focus timer</h3>
        <label class="field"><span>What are you working on?</span><input type="text" id="task" maxlength="60" placeholder="e.g. Chapter 3, essay draft, sutta reading" value="${esc(studyPick.task)}"></label>
        <div class="row wrap">${presets.map(([f, b]) => `<button class="chip" data-act="pre" data-f="${f}" data-b="${b}" aria-pressed="${studyPick.focus === f}">${f} / ${b}</button>`).join('')}</div>
        <button class="btn block" data-act="go">Start ${studyPick.focus}-min focus</button>
        <p class="small muted">Leaving Sati during a session counts as a wander. It isn’t a punishment, just an honest mirror.</p>
      </div>
      <div class="row spread"><h2>Dharma library</h2><span class="small muted">${Object.keys(S.lessons).length}/${LESSONS.length} studied</span></div>
      ${LESSONS.map((l) => `<a class="card tap row spread" href="#lesson/${l.id}"><div><h3>${esc(l.title)}</h3><div class="small muted">${esc(l.pali)} · ${l.minutes} min</div></div>${S.lessons[l.id] ? '<span class="check" aria-label="Studied">✓</span>' : '<span class="muted">›</span>'}</a>`).join('')}
      ${orgFooter()}
    </div>`;
  };
  V.study.bind = () => {
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
      <a href="#study" class="small">‹ Library</a>
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

  /* ----- mindful pause (the intervention screen) ----- */
  V.pause = (appId) => {
    const app = APPS.find((a) => a.id === appId);
    if (!app) return pauseSetup();
    return `<div class="stack center" style="padding-top:10px">
      <div class="eyebrow">Mindful pause</div>
      <h1 id="ph">Breathe in…</h1>
      <div class="orb" id="orb"></div>
      <p class="muted" id="pc">Three breaths before ${esc(app.name)}.</p>
      <div id="choice" class="stack hidden" style="text-align:left">
        <h2 class="center">Why are you opening ${esc(app.name)}?</h2>
        <button class="opt" data-act="present">I’ll stay present instead <span class="small muted">· close and come back to now</span></button>
        <p class="small muted center" style="margin-top:14px">Or use it with an intention:</p>
        <div class="row wrap" style="justify-content:center">${[5, 10, 15, 30].map((m) => `<button class="chip" data-act="use" data-v="${m}">${m} min</button>`).join('')}</div>
      </div>
      <div id="after" class="stack hidden"></div>
    </div>`;
  };
  V.pause.bind = (appId) => {
    const app = APPS.find((a) => a.id === appId);
    if (!app) return pauseSetupBind();
    document.body.classList.add('immersive');
    const orb = $('#orb'), ph = $('#ph');
    let n = 0, t, stopped = false;
    const cycle = () => {
      if (stopped) return;
      if (n >= 3) { ph.textContent = 'Now, choose.'; $('#pc').classList.add('hidden'); orb.classList.add('hidden'); $('#choice').classList.remove('hidden'); return; }
      ph.textContent = 'Breathe in…'; orb.classList.add('in');
      t = setTimeout(() => { ph.textContent = 'Breathe out…'; orb.classList.remove('in'); t = setTimeout(() => { n++; $('#pc').textContent = `${n} of 3`; cycle(); }, 4000); }, 4000);
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
        after.innerHTML = `<div class="lotus-wrap">${lotus(health())}</div><p>You chose presence. Your lotus opens a little.</p><a class="btn block" href="#meditate">Sit for a minute</a><a class="btn ghost block" href="#today">Back to today</a>`;
      } else {
        const m = b.dataset.v; d.mindful++; save();
        ph.textContent = `${m} minutes, with intention.`;
        after.innerHTML = `<p class="muted">Set a ${m}-minute timer if it helps, and notice the urge to keep going when it ends.</p>
          ${app.scheme ? `<a class="btn block" href="${app.scheme}">Open ${esc(app.name)}</a>` : ''}
          <a class="btn ghost block" href="#today">Not now</a>`;
      }
    });
  };

  function pauseSetup() {
    const d = day();
    const base = location.href.split('#')[0];
    return `<div class="stack">
      <div><div class="eyebrow">Mindful pause</div><h1>A doorway before the scroll</h1></div>
      <p class="muted">Sati can’t block apps from a web app, but it can stand at the door. Replace a distracting app’s icon with a Sati doorway: three breaths, then a choice.</p>
      <div class="grid2"><div class="stat"><b>${d.present}</b><span>stayed present today</span></div><div class="stat"><b>${d.mindful}</b><span>opened with intention</span></div></div>
      <div class="card stack"><h3>1. Choose an app</h3>
        <select id="appsel">${APPS.map((a) => `<option value="${a.id}">${a.name}</option>`).join('')}</select>
        <label class="field"><span>Doorway link</span><input type="text" id="applink" readonly value="${esc(base)}#pause/instagram"></label>
        <div class="row"><button class="btn soft" style="flex:1" id="copy">Copy link</button><a class="btn ghost" style="flex:1" id="try" href="#pause/instagram">Try it</a></div>
      </div>
      <div class="card stack"><h3>2. iPhone setup</h3>
        <ol class="steps small">
          <li>Open <b>Shortcuts</b>, tap <b>+</b>, add the action <b>Open URLs</b> and paste the link.</li>
          <li>Tap the share button › <b>Add to Home Screen</b>. Name it after the app (e.g. “Instagram”) and pick an icon.</li>
          <li>Long-press the real app › <b>Remove App</b> › <b>Remove from Home Screen</b> (it stays in the App Library).</li>
          <li>Put the doorway where the app used to be. Muscle memory now leads to a pause first.</li>
        </ol>
      </div>
      <div class="card stack"><h3>Android setup</h3>
        <ol class="steps small">
          <li>Open the doorway link in Chrome, tap <b>⋮</b> › <b>Add to Home screen</b>.</li>
          <li>Move the real app off your home screen into the app drawer.</li>
        </ol>
      </div>
      <details class="card"><summary>Want hard limits too?</summary><p class="small muted">Pair Sati with your phone’s built-in limits: iPhone Settings › Screen Time › App Limits, or Android Settings › Digital Wellbeing › App timers. Sati adds the reflective pause; the system enforces the limit.</p></details>
      ${orgFooter()}
    </div>`;
  }
  function pauseSetupBind() {
    const sel = $('#appsel'), link = $('#applink'), tryA = $('#try');
    const base = location.href.split('#')[0];
    sel.onchange = () => { link.value = `${base}#pause/${sel.value}`; tryA.href = `#pause/${sel.value}`; };
    $('#copy').onclick = async () => {
      try { await navigator.clipboard.writeText(link.value); toast('Link copied'); } catch { link.select(); toast('Select and copy the link'); }
    };
  }

  /* ----- insights ----- */
  V.insights = () => {
    const days7 = [...Array(7)].map((_, i) => addDays(new Date(), i - 6));
    const rows = days7.map((d) => ({ d, k: dayKey(d), v: peek(dayKey(d)) || { med: 0, study: 0 } }));
    const max = Math.max(30, ...rows.map((r) => r.v.med + r.v.study));
    const totM = rows.reduce((a, r) => a + r.v.med, 0), totS = rows.reduce((a, r) => a + r.v.study, 0);
    const scores = rows.map((r) => score(r.k)).filter((x) => x != null);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : '—';
    const all = Object.values(S.days);
    const present = all.reduce((a, d) => a + (d.present || 0), 0), mindful = all.reduce((a, d) => a + (d.mindful || 0), 0);
    const scr = rows.map((r) => r.v.screen).filter((x) => x != null);
    const now = new Date(), first = new Date(now.getFullYear(), now.getMonth(), 1);
    const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const best = bestStreak();
    return `<div class="stack">
      <div><div class="eyebrow">Insights</div><h1>Your practice</h1></div>
      <div class="grid2">
        <div class="stat"><b>${fmtMin(totM)}</b><span>meditation, 7 days</span></div>
        <div class="stat"><b>${fmtMin(totS)}</b><span>study, 7 days</span></div>
        <div class="stat"><b>${avg}</b><span>average clarity</span></div>
        <div class="stat"><b>${scr.length ? (scr.reduce((a, b) => a + b) / scr.length).toFixed(1) + 'h' : '—'}</b><span>avg screen time</span></div>
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
        <p class="small muted">\u{1FAB7} blooming · \u{1F338} opening · \u{1F331} resting · \u{1F940} wilting</p>
      </div>
      <div class="card stack"><h3>Phone</h3>
        <div class="grid2"><div class="stat"><b>${present}</b><span>times you stayed present</span></div><div class="stat"><b>${mindful}</b><span>opened with intention</span></div></div>
      </div>
      <div class="card stack"><div class="row spread"><h3>Lotus colours</h3><span class="small muted">best streak ${best}d</span></div>
        <p class="small muted">Practise on consecutive days to unlock new colours.</p>
        ${PALETTES.map((p) => { const open = best >= p.streak; return `<button class="opt row spread" data-act="pal" data-v="${p.id}" ${open ? '' : 'disabled'} aria-pressed="${S.palette === p.id}">
          <span class="row"><i style="width:18px;height:18px;border-radius:50%;background:${p.color};display:inline-block"></i>${p.name}</span>
          <span class="small muted">${open ? (S.palette === p.id ? 'In use' : 'Use') : `${p.streak}-day streak`}</span></button>`; }).join('')}
      </div>
      ${orgFooter()}
    </div>`;
  };
  V.insights.bind = () => {
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act=pal]'); if (!b || b.disabled) return;
      S.palette = b.dataset.v; save(); applyTheme(); render();
    });
  };

  /* ----- settings ----- */
  V.settings = () => `<div class="stack">
    <a href="#today" class="small">‹ Today</a>
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
      <p class="small muted">Adds two daily events, with alerts, to your phone’s calendar.</p>
      <div class="grid2"><label class="field"><span>Morning sit</span><input type="time" id="r-am" value="${S.reminders.morning}"></label>
      <label class="field"><span>Evening study</span><input type="time" id="r-pm" value="${S.reminders.evening}"></label></div>
      <button class="btn soft block" data-act="ics">Add to calendar (.ics)</button>
    </div>
    <div class="card stack"><h3>Install Sati</h3>
      <p class="small muted"><b>iPhone:</b> in Safari, tap Share › Add to Home Screen. <b>Android:</b> in Chrome, tap ⋮ › Install app. It then works offline like a normal app.</p>
    </div>
    <div class="card stack"><h3>Your data</h3>
      <p class="small muted">Everything stays on this device. Nothing is sent to the Society or anyone else.</p>
      <div class="row"><button class="btn ghost" style="flex:1" data-act="export">Export</button><button class="btn ghost" style="flex:1" data-act="onb">Redo intro</button></div>
      <button class="btn ghost block" data-act="reset" style="color:var(--warn)">Erase all data</button>
    </div>
    <div class="card stack"><h3>About</h3>
      <p class="small">Sati is offered freely by the <b>${ORG.name}</b>, a volunteer-run charity in Sydney helping keep the teachings of the Buddha open to all who seek them.</p>
      <p class="small muted">Registered with the Australian Charities and Not-for-profits Commission (ACNC). ABN ${ORG.abn}. <a href="${ORG.acnc}" target="_blank" rel="noopener">ACNC register</a> · <a href="${ORG.abr}" target="_blank" rel="noopener">ABN Lookup</a></p>
      <div class="row wrap"><a class="btn block" href="${ORG.give}" target="_blank" rel="noopener">Become a Dharma Friend</a></div>
      <p class="small muted">Gifts support the Society’s work but are not tax-deductible. Join a meditation evening in Sydney: <a href="${ORG.contact}" target="_blank" rel="noopener">contact us</a> or email <a href="mailto:${ORG.email}">${ORG.email}</a>.</p>
      <p class="small muted">Sati supports wellbeing but is not a substitute for professional care. If you are struggling, call Lifeline on <a href="tel:131114">13 11 14</a>.</p>
    </div>
    ${orgFooter()}
  </div>`;
  V.settings.bind = () => {
    const num = (id, key, min, max) => $(id).addEventListener('change', (e) => {
      const v = Number(e.target.value); if (v >= min && v <= max) { S.goals[key] = v; save(); toast('Goal saved'); } else e.target.value = S.goals[key];
    });
    num('#g-med', 'meditate', 1, 240); num('#g-study', 'study', 5, 600); num('#g-scr', 'screen', 0.5, 16);
    $('#r-am').onchange = (e) => { S.reminders.morning = e.target.value; save(); };
    $('#r-pm').onchange = (e) => { S.reminders.evening = e.target.value; save(); };
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'theme') { S.theme = b.dataset.v; save(); applyTheme(); render(); }
      if (a === 'bell') { S.bell = !S.bell; save(); render(); }
      if (a === 'testbell') { const was = S.bell; S.bell = true; bell(); S.bell = was; }
      if (a === 'ics') download('sati-reminders.ics', ics(), 'text/calendar');
      if (a === 'export') download(`sati-${dayKey()}.json`, JSON.stringify(S, null, 2), 'application/json');
      if (a === 'onb') { S.onboarded = false; save(); location.hash = '#welcome'; }
      if (a === 'reset' && confirm('Erase all your practice history on this device?')) { localStorage.removeItem(KEY); S = defaults(); applyTheme(); location.hash = '#welcome'; }
    });
  };

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
      ...ev('am', S.reminders.morning, '\u{1FAB7} Morning sit', '#meditate'),
      ...ev('pm', S.reminders.evening, '\u{1F4D6} Evening study', '#study'),
      'END:VCALENDAR'].join('\r\n');
  }

  /* ----- onboarding: problem framing, profile, life view, goals ----- */
  let ob = 0;
  const OB_STEPS = 6;
  V.welcome = () => {
    const P = S.profile, dots = `<div class="dots">${[...Array(OB_STEPS)].map((_, i) => `<i class="${i === ob ? 'on' : ''}"></i>`).join('')}</div>`;
    const q = (key, opts) => opts.map(([v, l]) => `<button class="opt" data-act="ans" data-k="${key}" data-v="${v}" aria-pressed="${P[key] === v}">${l}</button>`).join('');
    const steps = [
      () => `<div class="center stack" style="padding-top:20px">${lotus(85, { breathe: true })}
        <div class="eyebrow">${ORG.name}</div><h1>Sati</h1>
        <p class="muted">Sati means mindfulness. Meditate, study with focus, and meet your phone with a pause instead of a reflex.</p></div>`,
      () => `<div class="stack center"><h2>How many hours a day are you on your phone?</h2>
        <div id="ob-lotus">${lotus(Math.max(5, 100 - P.hours * 9))}</div>
        <div class="score" id="ob-h">${P.hours}<small>hours</small></div>
        <input type="range" id="hours" min="0" max="12" step="0.5" value="${P.hours}" aria-label="Hours per day">
        <p class="small muted">Not sure? Check Settings › Screen Time. Move the slider and watch the lotus.</p></div>`,
      () => `<div class="stack"><h2>When does the scroll pull hardest?</h2>${q('scroll', [['morning', 'First thing in the morning'], ['study', 'While I’m studying or working'], ['evening', 'In the evening'], ['night', 'Late at night, in bed']])}
        <h2 style="margin-top:22px">What brings you here?</h2>${q('why', [['calm', 'A calmer mind'], ['focus', 'Better focus for study'], ['dharma', 'Learning the Dharma'], ['sleep', 'Better sleep']])}</div>`,
      () => { const pr = PROFILES[P.scroll]; return `<div class="stack center"><div class="eyebrow">Your pattern</div><h1>${pr.name}</h1>
        ${lotus(Math.max(20, 100 - P.hours * 9))}
        <p>${pr.text}</p><div class="card small" style="text-align:left"><b>In the Buddha’s terms:</b> this pull often looks like <i>${pr.hindrance.toLowerCase()}</i>, one of the five hindrances. Recognising it is the first step. You’ll find a lesson on it in the library.</div></div>`; },
      () => { const remain = Math.max(5, 85 - P.age), lost = Math.round(P.hours / 16 * remain * 10) / 10, back = Math.round(lost / 2 * 10) / 10;
        const cells = Math.min(80, remain), red = Math.round(P.hours / 16 * cells);
        return `<div class="stack center"><h2>At ${P.hours}h a day, that’s about <span style="color:var(--warn)">${lost} years</span> of your waking life on a screen.</h2>
        <label class="field" style="text-align:left"><span>Your age: <b id="agev">${P.age}</b></span><input type="range" id="age" min="12" max="80" value="${P.age}"></label>
        <div class="life" id="life">${[...Array(cells)].map((_, i) => `<i class="${i < red ? 'phone' : ''}"></i>`).join('')}</div>
        <p class="small muted">Each square is one year until 85. The coloured squares are years spent on the phone (out of 16 waking hours a day).</p>
        <p><b>Halve it and you get back ${back} years</b>, enough time for more than ${Math.round(back * 365 * 0.5 * 60 / 20).toLocaleString('en-AU')} twenty-minute sits.</p></div>`; },
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
    if (hr) hr.oninput = () => { P.hours = Number(hr.value); $('#ob-h').innerHTML = `${P.hours}<small>hours</small>`; $('#ob-lotus').innerHTML = lotus(Math.max(5, 100 - P.hours * 9)); save(); };
    const age = $('#age');
    if (age) age.onchange = () => { P.age = Number(age.value); save(); render(); };
    if (age) age.oninput = () => { $('#agev').textContent = age.value; };
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
      if (a === 'next' && ob < OB_STEPS - 1) { if (ob === 0) bell(0.6); ob++; view.scrollTo?.(0, 0); window.scrollTo(0, 0); return render(); }
      if (a === 'next' || a === 'skip') {
        if (a === 'next' && S.goals.screen === defaults().goals.screen && P.hours <= 3) S.goals.screen = Math.max(1, P.hours - 1);
        S.onboarded = true; ob = 0; save(); location.hash = '#today';
      }
    });
  };

  /* ---------- router ---------- */
  function render() {
    cleanup?.(); cleanup = null;
    const fresh = view.cloneNode(false); view.replaceWith(fresh); view = fresh; // drop old delegated listeners
    let [name, arg] = location.hash.replace(/^#/, '').split('/');
    if (!S.onboarded && name !== 'pause') name = 'welcome';
    if (!V[name]) name = 'today';
    view.innerHTML = V[name](arg && decodeURIComponent(arg));
    V[name].bind?.(arg && decodeURIComponent(arg));
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === (name === 'lesson' ? 'study' : name)));
    const t = { today: 'Sati', meditate: 'Meditate', study: 'Study', lesson: 'Study', pause: 'Pause', insights: 'Insights', settings: 'Settings', welcome: 'Welcome' }[name];
    document.title = t === 'Sati' ? 'Sati — Meditate & Study' : `${t} · Sati`;
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  applyTheme();
  render();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
