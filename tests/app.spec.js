const { test, expect } = require('@playwright/test');

const pad = (n) => String(n).padStart(2, '0');
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// A user a couple of weeks in: practice on the last 9 days and a guard running all day.
function seed() {
  const days = {};
  for (let i = 1; i <= 9; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days[key(d)] = { med: 5 + i * 2, study: 20 + i * 5, present: i % 3, mindful: 1, wanders: i % 2, lessons: 0, screen: 2 + (i % 4) * 0.7, pickups: 50 + i * 6, apps: { instagram: 40 + i * 3, youtube: 30 }, checks: {} };
  }
  days[key(new Date())] = { med: 6, study: 25, present: 0, mindful: 0, wanders: 0, lessons: 0, screen: 3.2, pickups: 74, apps: { instagram: 62 }, checks: { refuge: true } };
  return {
    onboarded: true, goals: { meditate: 10, study: 25, screen: 3 }, days, lessons: {}, scene: 'pond', bell: false,
    apps: ['instagram', 'tiktok', 'youtube', 'x'],
    guards: [{ id: 'g1', preset: 'study', name: 'Study Hall', mood: 'study', start: '00:00', end: '23:59', days: [0, 1, 2, 3, 4, 5, 6], apps: [], on: true }]
  };
}

async function chooseFile(page, button, text) {
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click(button)]);
  await chooser.setFiles({ name: 'sati.json', mimeType: 'application/json', buffer: Buffer.from(text) });
}
const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('sati.v1')));
const today = (s) => s.days[key(new Date())];

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  await page.goto('./');
  await page.evaluate((s) => localStorage.setItem('sati.v1', JSON.stringify(s)), seed());
});
test.afterEach(async ({ page }) => expect(page.errors).toEqual([]));

for (const route of ['today', 'sit', 'learn', 'learn/focus', 'lesson/refuges', 'guard', 'stats', 'settings', 'pause/instagram']) {
  test(`#${route} renders without sideways scroll`, async ({ page }) => {
    await page.goto(`./#${route}`);
    await page.reload();
    await expect(page.locator('#view')).not.toBeEmpty();
    await expect(page.locator('#view')).not.toContainText('${'); // a template left uninterpolated
    const wide = await page.evaluate(() => [...document.querySelectorAll('#view *')]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !el.closest('.session, .hero'); })
      .map((el) => el.className || el.tagName));
    expect(wide).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}

test('loads nothing from other servers', async ({ page }) => {
  const outside = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1')) outside.push(r.url()); });
  for (const route of ['today', 'sit', 'learn', 'stats']) { await page.goto(`./#${route}`); await page.reload(); }
  await page.waitForLoadState('networkidle');
  expect(outside).toEqual([]);
});

test('onboarding ends on Home', async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
  await page.goto('./#today');
  await page.reload();
  for (let i = 0; i < 6; i++) await page.click('[data-act=next]');
  await expect(page).toHaveURL(/#today$/);
  expect((await state(page)).onboarded).toBe(true);
});

test('a timed sit logs its minutes', async ({ page }) => {
  await page.clock.install();
  await page.goto('./#sit');
  await page.reload();
  await page.click('[data-act=dur][data-v="5"]');
  await page.click('[data-act=start]');
  await expect(page.locator('#tm')).toHaveText('5:00');
  await page.clock.fastForward('05:01');
  await expect(page.locator('h1')).toHaveText('You made space.');
  expect(today(await state(page)).med).toBe(6 + 5);
});

test('pausing a sit stops the clock', async ({ page }) => {
  await page.clock.install();
  await page.goto('./#sit');
  await page.reload();
  await page.click('[data-act=dur][data-v="10"]');
  await page.click('[data-act=start]');
  await page.clock.fastForward('01:00');
  await page.click('#pp');
  const shown = await page.locator('#tm').textContent();
  await page.clock.fastForward('03:00');
  await expect(page.locator('#tm')).toHaveText(shown);
  await page.click('#pp');
  await page.clock.fastForward('00:30');
  await expect(page.locator('#tm')).not.toHaveText(shown);
});

test('the doorway can be left before the breaths end', async ({ page }) => {
  await page.goto('./#pause/instagram');
  await page.reload();
  await page.getByRole('link', { name: 'Not now' }).click();
  await expect(page).toHaveURL(/#today$/);
});

test('the doorway counts a choice to stay present', async ({ page }) => {
  await page.clock.install();
  await page.goto('./#pause/instagram');
  await page.reload();
  await expect(page.locator('#pc')).toHaveText('Take five breaths');
  await page.clock.runFor(45000);
  await page.click('[data-act=present]');
  await expect(page.locator('#ph')).toHaveText('Sādhu.');
  expect(today(await state(page)).present).toBe(1);
});

test('guard presets add and remove', async ({ page }) => {
  await page.goto('./#guard');
  await page.reload();
  await page.click('[data-act=preset][data-v=night]');
  expect((await state(page)).guards.map((g) => g.preset)).toContain('night');
  await page.click('[data-act=preset][data-v=night]');
  expect((await state(page)).guards.map((g) => g.preset)).not.toContain('night');
});

test('the doorway link follows the chosen app', async ({ page }) => {
  await page.goto('./#guard');
  await page.reload();
  await page.click('[data-act=door][data-v=youtube]');
  await expect(page.locator('#applink')).toHaveValue(/#pause\/youtube$/);
  await expect(page.locator('#try')).toHaveAttribute('href', '#pause/youtube');
});

test('a lesson can be marked studied', async ({ page }) => {
  await page.goto('./#lesson/refuges');
  await page.reload();
  await page.click('#done');
  const s = await state(page);
  expect(s.lessons.refuges).toBeTruthy();
  expect(today(s).lessons).toBe(1);
});

test('the Screen Time check-in saves', async ({ page }) => {
  await page.goto('./#stats');
  await page.reload();
  await page.click('[data-act=checkin]');
  await page.fill('input[name=h]', '2');
  await page.fill('input[name=m]', '30');
  await page.fill('input[name=p]', '40');
  await page.click('button[value=save]');
  await expect.poll(async () => { const d = today(await state(page)); return [d.screen, d.pickups]; }).toEqual([2.5, 40]);
});

test('stats switch between week, month and year', async ({ page }) => {
  await page.goto('./#stats');
  await page.reload();
  await expect(page.locator('.chart .col')).toHaveCount(7);
  await page.click('[data-act=range][data-v=month]');
  await expect(page.locator('.chart .col')).toHaveCount(30);
  await page.click('[data-act=range][data-v=year]');
  await expect(page.locator('.chart .col')).toHaveCount(12);
  await expect(page.locator('.bignum b')).not.toHaveText('0');
});

test('erasing data returns to the intro', async ({ page }) => {
  await page.goto('./#settings');
  await page.reload();
  page.once('dialog', (d) => d.accept());
  await page.click('[data-act=reset]');
  await expect(page).toHaveURL(/#welcome$/);
  expect(await page.evaluate(() => localStorage.getItem('sati.v1') ?? '')).not.toContain('Study Hall');
});

test('a backup restores on a fresh device', async ({ page }) => {
  await page.goto('./#settings');
  await page.reload();
  const [file] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=export]')]);
  const backup = require('fs').readFileSync(await file.path(), 'utf8');
  expect(JSON.parse(backup).guards[0].name).toBe('Study Hall');

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page).toHaveURL(/#settings$/); // still routed to the intro, which offers the restore
  page.once('dialog', (d) => d.accept());
  await chooseFile(page, '[data-act=restore]', backup);
  await expect(page.locator('.toast')).toHaveText('Backup restored');
  await expect(page).toHaveURL(/#today$/);
  const s = await state(page);
  expect([s.onboarded, s.guards.length, today(s).med]).toEqual([true, 1, 6]);
});

test('restore refuses a file that is not a backup', async ({ page }) => {
  await page.goto('./#settings');
  await page.reload();
  await chooseFile(page, '[data-act=restore]', '{"hello":1}');
  await expect(page.locator('.toast')).toHaveText('That file isn’t a Sati backup');
  expect((await state(page)).guards.length).toBe(1);
});

// Daily lotus: a 5-minute sit waters it; missed days wilt it.
const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return key(d); };
async function lotusUser(page, lotus, med = {}) {
  const s = seed(); s.days = {};
  for (const [n, m] of Object.entries(med)) s.days[ago(n)] = { med: m, study: 0, lessons: 0 };
  s.lotus = { stage: 0, planted: null, checked: null, grownOn: null, missed: 0, bloomed: 0, news: null, ...lotus };
  await page.evaluate((x) => localStorage.setItem('sati.v1', JSON.stringify(x)), s);
  await page.goto('./#garden');
  await page.reload();
}

test('the lotus grows one stage per watered day', async ({ page }) => {
  await lotusUser(page, { stage: 3, planted: ago(5), checked: ago(2), grownOn: ago(2) }, { 1: 6, 0: 6 });
  await expect(page.locator('h1')).toContainText('Stage 5 of 10');
  await page.reload();
  await expect(page.locator('h1')).toContainText('Stage 5 of 10');
});

test('a missed day wilts the lotus one stage', async ({ page }) => {
  await lotusUser(page, { stage: 4, planted: ago(6), checked: ago(2), grownOn: ago(2) });
  await expect(page.locator('h1')).toContainText('Stage 3 of 10');
  await expect(page.locator('#view')).toContainText('lost a stage');
  await page.reload();
  await expect(page.locator('#view')).not.toContainText('lost a stage');
});

test('three missed days wither the lotus', async ({ page }) => {
  await lotusUser(page, { stage: 6, planted: ago(9), checked: ago(4), grownOn: ago(4) });
  await expect(page.locator('#view')).toContainText('withered');
  await expect(page.getByRole('button', { name: 'Plant your seed' })).toBeVisible();
});

test('a long absence withers the lotus once', async ({ page }) => {
  await lotusUser(page, { stage: 6, planted: ago(50), checked: ago(41), grownOn: ago(41) });
  await expect(page.getByRole('button', { name: 'Plant your seed' })).toBeVisible();
  expect((await state(page)).lotus.stage).toBe(0);
});

test('stage 10 blooms the lotus and counts it', async ({ page }) => {
  await lotusUser(page, { stage: 9, planted: ago(9), checked: ago(1), grownOn: ago(1) }, { 0: 6 });
  await expect(page.locator('h1')).toContainText('Bloom');
  await expect(page.locator('#view')).toContainText('1 lotus bloomed');
  await expect(page.getByRole('button', { name: 'Plant a new seed' })).toBeVisible();
});

test('planting the lotus on a watered day reaches stage 2', async ({ page }) => {
  await lotusUser(page, {}, { 0: 6 });
  await page.getByRole('button', { name: 'Plant your seed' }).click();
  await expect(page.locator('h1')).toContainText('Stage 2 of 10');
});

test('a bloomed lotus does not wilt', async ({ page }) => {
  await lotusUser(page, { stage: 10, planted: ago(16), checked: ago(6), grownOn: ago(6), bloomed: 1 });
  await expect(page.locator('h1')).toContainText('Bloom');
});

test('a clock moved back leaves the lotus alone', async ({ page }) => {
  await lotusUser(page, { stage: 4, planted: ago(4), checked: ago(-3), grownOn: ago(-3) }, { 0: 6 });
  await expect(page.locator('h1')).toContainText('Stage 4 of 10');
});

test('restore fills in a missing lotus', async ({ page }) => {
  await page.goto('./#settings');
  await page.reload();
  const old = seed(); delete old.lotus;
  page.once('dialog', (d) => d.accept());
  await chooseFile(page, '[data-act=restore]', JSON.stringify(old));
  await expect(page.locator('.toast')).toHaveText('Backup restored');
  expect((await state(page)).lotus.stage).toBe(0);
});

test('two short sits water the lotus', async ({ page }) => {
  await page.clock.install();
  await lotusUser(page, { stage: 3, planted: ago(3), checked: ago(1), grownOn: ago(1) });
  for (let i = 0; i < 2; i++) {
    await page.goto('./#sit');
    await page.reload();
    await page.click('[data-act=dur][data-v="5"]');
    await page.click('[data-act=start]');
    await page.clock.fastForward('03:00');
    await page.click('#end');
  }
  await expect(page.locator('#view')).toContainText('Your lotus is watered · Stage 4');
});

test('home shows what the lotus still needs', async ({ page }) => {
  await lotusUser(page, { stage: 3, planted: ago(3), checked: ago(1), grownOn: ago(1) }, { 0: 2 });
  await expect(page.locator('#view')).toContainText('Needs water: 3 more minutes today');
});

test('a sit that runs past midnight counts for the day it began', async ({ page }) => {
  const start = new Date(); start.setHours(23, 58, 0, 0);
  await page.clock.install({ time: start });
  await page.goto('./#sit');
  await page.reload();
  await page.click('[data-act=dur][data-v="5"]');
  await page.click('[data-act=start]');
  await page.clock.fastForward('05:01');
  await expect(page.locator('h1')).toHaveText('You made space.');
  expect((await state(page)).days[key(start)].med).toBe(6 + 5);
});
