# Daily Lotus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A required 5-minute daily sit grows a lotus through 10 stages; missed days wilt it and 3 in a row wither it.

**Architecture:** All in `app.js` like the rest of the app. A small replay function, `tendLotus()`, settles growth and penalties from `S.days[k].med` whenever the app renders or a sit ends, so the result doesn't depend on when the app was open. The garden view is rebuilt around it; Home, session complete and the morning reminder read it.

**Tech Stack:** Vanilla JS PWA, Playwright tests (`npm test`), studio MCP for art (krea2 base, qwen edits).

**Spec:** `docs/superpowers/specs/2026-10-29-daily-lotus-design.md`

## Global Constraints

- Daily minimum `LOTUS_MIN = 5` meditation minutes (sum of `d.med` for the day); not a setting.
- At most one stage per day; stages 0 (seed in hand) to 10 (bloom).
- A miss is −1 stage (floor 1); 3 misses in a row → stage 0 (withered). Stage 0 and 10 never take penalties.
- Only meditation waters. Study and lessons are cosmetic "extra care" drops.
- Kind wording, no guilt. The penalty is shown in the picture (faded) plus one plain line.
- No lock on other screens. No new dependencies. Art in `art/`, webp, small (aim under 60 KB each).

## Review Focus

- Opening after a long absence (e.g. 40 days, lotus at stage 6): it withers once, with no errors and no negative stage → test in Task 2.
- The phone clock moved backwards (`checked` is later than yesterday): no replay, no crash, stage unchanged → test in Task 2.
- A backup or older state without `lotus`, or with a partial `lotus`: defaults filled in → test in Task 2.
- Reloading the garden twice the same day: no double growth → test in Task 2.
- Two short sits (3 + 3 minutes) in one day: they water the lotus → test in Task 3.

---

### Task 1: Stage art

**Files:**
- Create: `art/lotus-0.webp` … `art/lotus-10.webp`
- Modify: `sw.js` (add the 11 files to `SHELL`, `CACHE` → `sati-v8`)

**Interfaces:**
- Produces: `img('lotus-' + n)` works for n = 0..10.

- [ ] **Step 1:** Generate the base picture with krea2 at 1024×1024: a small round celadon clay bowl of water with dark mud, centred, plain warm cream background `#f8f2e8`, soft clay style matching `art/home.webp`, nothing growing.
- [ ] **Step 2:** For each stage (table in the spec), run qwen image-to-image on the base, changing only the plant. Stage 0 has a lotus seed resting on the rim. Stage 10 is a full pink lotus with Padma's face (as in `icons/icon-512.png`).
- [ ] **Step 3:** Look at all 11 side by side. Redo any stage whose bowl or framing drifts.
- [ ] **Step 4:** Convert to 640×640 webp (quality 80) in `art/`, and update `sw.js`.
- [ ] **Step 5:** Commit: `git commit -m "Lotus stage art"`

### Task 2: Lotus engine and garden

**Files:**
- Modify: `app.js`: `defaults()` (~line 98), `streak()` (~128), `V.garden` and `V.garden.bind` (~294–315), restore sanitising (~827)
- Modify: `app.css`: replace the `.stages/.stage/.stage-gap` rules (~206–211) with the lotus garden styles
- Test: `tests/app.spec.js`

**Interfaces:**
- Produces:
  - `LOTUS_MIN = 5`
  - `LOTUS_NAMES = ['Seed', 'Planted', 'Waking', 'Sprout', 'First leaf', 'Leaves', 'Stem', 'Bud', 'Blushing bud', 'Opening', 'Bloom']`
  - `watered(k: string): boolean`: `(peek(k)?.med || 0) >= LOTUS_MIN`
  - `tendLotus(): void`: mutates `S.lotus` and saves
  - `plantLotus(): void`
  - `S.lotus = { stage: 0, planted: null, checked: null, grownOn: null, missed: 0, bloomed: 0, news: null }`, where `news` is `'wilted' | 'withered' | 'bloomed' | null`
  - `streak()` counts days in a row where `watered(k)`

- [ ] **Step 1: Write the failing tests.** Seed `S.lotus` plus `days`, using `key(addDays(-n))` like `seed()`. Open `#garden` and assert:
  - `the lotus grows one stage per watered day`: stage 3, `checked` = −2, `grownOn` = −2; days −1 and 0 have med 6. Expect `Stage 5 of 10`. After a reload it's still `Stage 5 of 10`.
  - `a missed day wilts the lotus one stage`: stage 4, `checked` = −2, nothing on day −1, today med 0. Expect `Stage 3 of 10` and the text `lost a stage`. After a reload the text is gone.
  - `three missed days wither the lotus`: stage 6, `checked` = −4, days −3..−1 empty. Expect a `Plant your seed` button and the text `withered`.
  - `a long absence withers once`: stage 6, `checked` = −41. Expect `Plant your seed`, and `state.lotus.stage === 0`.
  - `stage 10 blooms and is counted`: stage 9, `checked` = −1, `grownOn` = −1, today med 6. Expect `Bloom`, `1 lotus bloomed` and `Plant a new seed`.
  - `planting on a watered day reaches stage 2`: stage 0, today med 6. Click `Plant your seed`, expect `Stage 2 of 10`.
  - `a bloomed lotus does not wilt`: stage 10, `checked` = −6, no days. Expect `Bloom`.
  - `a clock moved back changes nothing`: stage 4, `checked` = +3 (in the future). Expect `Stage 4 of 10`.
  - `restore fills in a missing lotus`: restore a backup without `lotus` (reuse `chooseFile`). `state.lotus.stage === 0`.
- [ ] **Step 2:** Run `npx playwright test -g lotus`. Expected: FAIL.
- [ ] **Step 3: Implement the engine.** `tendLotus()` runs at the top of `render()`, so every view sees settled state. Replay rule:

  ```
  if stage is 0 or 10: checked = yesterday; return
  from = max(checked + 1, planted)
  for each day k from `from` to yesterday (skip if from > yesterday):
    if watered(k): if grownOn != k: stage++, grownOn = k; missed = 0
    else: missed++; if missed >= 3: stage = 0, news = 'withered', stop
          else: stage = max(1, stage - 1), news = 'wilted'
    if stage == 10: bloomed++, news = 'bloomed', stop
  if stage in 1..9 and watered(today) and grownOn != today: stage++, grownOn = today, missed = 0
    (and if stage == 10: bloomed++, news = 'bloomed')
  checked = yesterday
  ```

  `plantLotus()` sets stage 1, planted = today, grownOn = null, missed = 0, checked = yesterday, then calls `tendLotus()`. Restore sets `S.lotus = Object.assign(defaults().lotus, S.lotus)`, and so does load.
- [ ] **Step 4: Rebuild `V.garden`.**
  - Title bar as now.
  - `img('lotus-' + stage)` in a `.lotus` figure, with class `wilt` when `missed > 0`.
  - `Stage N of 10 · Name` as the h1 (stage 0 shows `A seed in your hand`).
  - A 10-segment `.lotusbar`.
  - The status line: `Watered today`, or `Needs water: N more minutes today`.
  - The `news` line, shown once and then cleared:
    - wilted: `Your lotus missed its water and lost a stage.`
    - withered: `Your lotus withered after three dry days. Plant a new seed when you’re ready.`
    - bloomed: `Your lotus has bloomed. Sādhu!`
  - Buttons:
    - stage 0: `Plant your seed`
    - stage 10: `Plant a new seed`
    - otherwise, while not watered: `Sit 5 minutes`, which runs `runSession({ kind: 'med', minutes: 5, tech: TECHNIQUES[0], interval: 0 })`
  - The last 7 days as dots: watered, missed (planted and dry), or blank, plus a small drop when `study > 0 || lessons > 0`.
  - `N lotus(es) bloomed` when the count is above 0.
  - The info toast explains the rule in one sentence.
  - The `.wilt` filter is `grayscale(.6) brightness(.92)`. Under `prefers-reduced-motion`, leave out the grow animation (`@keyframes grow`, a scale from .96 to 1, played once when `grownOn === today` and not yet seen).
- [ ] **Step 5:** Run `npm test`. Expected: all pass, the 9 new tests included.
- [ ] **Step 6:** Commit: `git commit -m "Daily lotus: growth, wilting and the garden"`

### Task 3: Home, session complete, reminder

**Files:**
- Modify: `app.js`: `V.today` Meditate row (~line 246) and streak text (~238), the session-complete block (~403–417), reminder 101 (~794)
- Test: `tests/app.spec.js`

**Interfaces:**
- Consumes: `LOTUS_MIN`, `watered`, `tendLotus`, `S.lotus`, `LOTUS_NAMES` from Task 2.

- [ ] **Step 1: Write the failing tests.**
  - `home shows what the lotus still needs`: lotus stage 3 and today med 2. The first row reads `Water your lotus` and `3 more minutes today`. With today med 6, the row has class `done`.
  - `two short sits water the lotus`: lotus stage 3 (`checked` = −1) and today med 0. Run two 3-minute sits with the clock, as in `a timed sit logs its minutes`. After the second, expect the text `Your lotus is watered` and `Stage 4`.
- [ ] **Step 2:** Run `npx playwright test -g "lotus|short sits"`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.**
  - The Meditate row becomes `row({ href: '#garden', img: 'lotus-' + stage, title: 'Water your lotus', sub, cls })`.
    - `sub`: `Watered today`, or `N more minutes today`; at stage 0 it's `Plant your seed`.
    - Extend `row` only if it can't show a small image. Otherwise use `ic: 'lotus'`.
  - The homecard text uses the new `streak()`: `N days in a row. Your lotus is growing.`
  - In session end, compare `watered(today)` before and after adding the minutes, and call `tendLotus()`. When it flips to true, add a line above the statrow: `Your lotus is watered · Stage N` and a `See your lotus` link to `#garden`.
  - Reminder 101 body: `Your lotus needs water: 5 minutes of stillness.` (title unchanged).
- [ ] **Step 4:** Run `npm test`. Expected: all pass.
- [ ] **Step 5:** Update the README Garden row: "Daily lotus: a 5-minute sit each day grows a seed through 10 stages; missed days wilt it". Update `appstore/metadata.json` so the garden bullet says the same. Re-run `npm test`.
- [ ] **Step 6:** Commit: `git commit -m "Lotus on Home, after a sit and in the reminder"`
