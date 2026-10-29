'use strict';
/* Zero-dependency tests (node --test) for the static app:
   content integrity, artwork invariants, and cross-file wiring
   (service worker cache, manifest icons, CSS palettes, script order). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// The app scripts are plain browser globals scripts; give them a window.
globalThis.window = globalThis;
require(path.join(ROOT, 'content.js'));
require(path.join(ROOT, 'art.js'));

const { LESSONS, TECHNIQUES } = globalThis;
const { SCENES, scene, colors, padma, landscape, zen, mix } = globalThis.ART;

const appJs = read('app.js');
const css = read('app.css');
const html = read('index.html');
const swJs = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const HEX = /^#[0-9a-f]{6}$/i;
const isHex = (c) => typeof c === 'string' && HEX.test(c);

/* ---------- Dharma library ---------- */

test('lessons: unique ids and complete fields', () => {
  assert.ok(LESSONS.length >= 8, 'expected at least 8 lessons');
  const ids = LESSONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson ids must be unique');
  for (const l of LESSONS) {
    assert.match(l.id, /^[a-z]+$/, `lesson id "${l.id}" must be lowercase`);
    assert.ok(l.title && l.pali, `${l.id}: title and pali required`);
    assert.ok(Number.isFinite(l.minutes) && l.minutes > 0, `${l.id}: minutes must be positive`);
    assert.ok(Array.isArray(l.body) && l.body.length > 0, `${l.id}: body required`);
    assert.ok(l.body.every((p) => typeof p === 'string' && p.trim()), `${l.id}: body paragraphs must be non-empty`);
    assert.ok(Array.isArray(l.terms) && l.terms.length > 0, `${l.id}: terms required`);
    assert.ok(l.terms.every(([t, m]) => t && m), `${l.id}: terms must be [term, meaning] pairs`);
    assert.ok(Array.isArray(l.quiz) && l.quiz.length > 0, `${l.id}: quiz required`);
    assert.ok(l.quiz.every((c) => c.q && c.a), `${l.id}: quiz cards need question and answer`);
  }
});

test('techniques: unique ids with cue lists', () => {
  const ids = TECHNIQUES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'technique ids must be unique');
  for (const t of TECHNIQUES) {
    assert.ok(t.name && t.sub, `${t.id}: name and sub required`);
    assert.ok(Array.isArray(t.cues) && t.cues.every((c) => typeof c === 'string'), `${t.id}: cues must be strings`);
  }
});

/* ---------- artwork ---------- */

test('scenes: unique ids, ordered streaks, valid palettes and colors', () => {
  const ids = SCENES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'scene ids must be unique');
  let prev = -1;
  for (const s of SCENES) {
    assert.ok(s.name, `${s.id}: name required`);
    assert.ok(Number.isInteger(s.streak) && s.streak >= 0, `${s.id}: streak must be a non-negative integer`);
    assert.ok(s.streak >= prev, `${s.id}: streaks must be non-decreasing`);
    prev = s.streak;
    assert.ok(['lotus', 'forest', 'moon', 'saffron', 'gold'].includes(s.palette), `${s.id}: unknown palette ${s.palette}`);
    assert.ok(Array.isArray(s.sky) && s.sky.length === 2 && s.sky.every(isHex), `${s.id}: sky must be two hex colors`);
    for (const k of ['hill', 'ground', 'deep', 'sun']) assert.ok(isHex(s[k]), `${s.id}: ${k} must be hex`);
  }
  assert.equal(scene('no-such-scene'), SCENES[0], 'unknown scene falls back to the first');
});

test('colors: decay steps and output keys', () => {
  assert.equal(colors('pond', 90).d, 0);
  assert.equal(colors('pond', 50).d, 0.45);
  assert.equal(colors('pond', 10).d, 0.9);
  const c = colors('night', 90);
  for (const k of ['sky', 'hill', 'ground', 'deep']) assert.ok(k in c);
});

test('mix: endpoints and midpoint', () => {
  assert.equal(mix('#000000', '#ffffff', 0), '#000000');
  assert.equal(mix('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
});

test('padma renders for every mood', () => {
  for (const mood of ['happy', 'ok', 'sad', 'sit', 'study', 'sleep']) {
    const svg = padma(mood, 80);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `padma(${mood}) must be an svg`);
    assert.ok(svg.includes('aria-label="Padma the lotus, ' + mood + '"'));
  }
});

test('landscape and zen render', () => {
  assert.ok(landscape('pond', 90, 'happy').includes('class="bob"'), 'landscape with a mood embeds Padma');
  assert.ok(!landscape('pond', 90, null).includes('class="bob"'), 'landscape without a mood has no Padma');
  for (const id of SCENES.map((s) => s.id)) {
    assert.ok(landscape(id, 90, 'happy').includes('<svg'), `landscape(${id}) renders`);
    assert.ok(zen(id).includes('breathe-g'), `zen(${id}) renders`);
  }
});

/* ---------- cross-file wiring ---------- */

test('app.js default and migrated scenes exist', () => {
  const def = appJs.match(/scene: '(\w+)'/);
  assert.ok(def, 'defaults() must set a scene');
  assert.ok(SCENES.some((s) => s.id === def[1]), `default scene "${def[1]}" missing from SCENES`);
  const mig = appJs.match(/S\.scene = \{([^}]+)\}\[S\.palette\]/);
  assert.ok(mig, 'palette migration map not found in app.js');
  for (const id of [...mig[1].matchAll(/'(\w+)'/g)].map((m) => m[1])) {
    assert.ok(SCENES.some((s) => s.id === id), `migrated scene "${id}" missing from SCENES`);
  }
});

test('onboarding scroll options match the profile keys', () => {
  const profSlice = appJs.slice(appJs.indexOf('const PROFILES'), appJs.indexOf('/* ---------- storage'));
  const profiles = [...profSlice.matchAll(/^\s{4}(\w+): \{/gm)].map((m) => m[1]);
  assert.deepEqual(profiles.sort(), ['evening', 'morning', 'night', 'study']);
  const scroll = appJs.match(/q\('scroll', \[\[([\s\S]*?)\]\]\)/);
  assert.ok(scroll, 'onboarding scroll question not found');
  const options = [...scroll[1].matchAll(/'(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(options.sort(), profiles.sort(), 'every scroll option needs a profile and vice versa');
});

test('every scene palette has a CSS rule', () => {
  for (const s of SCENES) {
    if (s.palette === 'lotus') continue; // lotus is the :root default
    assert.ok(css.includes(`data-palette="${s.palette}"`), `app.css missing [data-palette="${s.palette}"]`);
  }
});

test('service worker shell files all exist', () => {
  const shell = swJs.match(/const SHELL = \[([^\]]*)\]/);
  assert.ok(shell, 'SHELL list not found in sw.js');
  for (const entry of [...shell[1].matchAll(/'([^']+)'/g)].map((m) => m[1])) {
    const p = entry === './' ? 'index.html' : entry;
    assert.ok(fs.existsSync(path.join(ROOT, p)), `sw.js caches missing file ${entry}`);
  }
});

test('manifest icons exist and html loads the scripts in order', () => {
  const icons = [...manifest.icons.map((i) => i.src), ...manifest.shortcuts.flatMap((s) => s.icons.map((i) => i.src))];
  assert.ok(icons.length > 0);
  for (const src of new Set(icons)) assert.ok(fs.existsSync(path.join(ROOT, src)), `manifest icon missing: ${src}`);
  const order = ['content.js', 'art.js', 'app.js'].map((f) => html.indexOf(`src="${f}"`));
  assert.ok(order.every((i) => i >= 0), 'index.html must load content.js, art.js and app.js');
  assert.ok(order[0] < order[1] && order[1] < order[2], 'scripts must load in the order content, art, app');
  assert.ok(appJs.includes("serviceWorker.register('sw.js')"), 'app.js must register sw.js');
});
