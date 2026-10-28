# Daily Lotus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A required 5-minute daily sit grows a lotus through 10 stages; missed days wilt it and 3 in a row wither it.

**Architecture:** All in `app.js` like the rest of the app. A small replay function, `tendLotus()`, settles growth and penalties from `S.days[k].med` whenever the app renders or a sit ends, so the result doesn't depend on when the app was open. Home becomes the lotus screen (the garden merges into it); session complete and the morning reminder read it.

**Order:** Tasks 2 → 3 → 1 → 4. The studio was scaled to 0 on 29 Oct, so the art comes after the code. Until then `img('lotus-N')` falls back to `art/garden.webp`.

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
- [ ] **Step 4: Make Home the lotus.**
  - Replace `V.today` with the lotus screen (spec, "Where it shows up"). Delete `V.garden`, add
    `garden: 'today'` to `ALIAS`, and delete the evening version, `moreOpen`, the practice list, the
    `extra` checks and their `check` handler.
  - Layout:
    - `header()`
    - `img('lotus-' + stage)` in a `.lotus` figure, with class `wilt` when `missed > 0`
    - `Stage N of 10 · Name` as the h1 (stage 0 shows `A seed in your hand`)
    - a 10-segment `.lotusbar`
    - the status line: `Watered today`, or `Needs water: N more minutes today`
    - `N days in a row` when the streak is above 1
  - The `news` line is shown once and then cleared:
    - wilted: `Your lotus missed its water and lost a stage.`
    - withered: `Your lotus withered after three dry days. Plant a new seed when you’re ready.`
    - bloomed: `Your lotus has bloomed. Sādhu!`
  - One button:
    - stage 0: `Plant your seed`
    - stage 10: `Plant a new seed`
    - otherwise: `Water your lotus · 5 min`, which runs `runSession({ kind: 'med', minutes: 5, tech: TECHNIQUES[0], interval: 0 })`.
      It stays available after watering, as `Sit again`.
  - The last 7 days as dots: watered, missed (planted and dry), or blank, plus a small drop when `study > 0 || lessons > 0`.
  - `N lotus(es) bloomed` when the count is above 0, and `orgFooter()`.
  - CSS:
    - Replace the `.stages/.stage/.stage-gap` and `.homecard`/`.evening` rules that are no longer used.
    - The `.wilt` filter is `grayscale(.6) brightness(.92)`.
    - `@keyframes grow` (a scale from .96 to 1) plays once when `grownOn === today` and `seen !== today`. It's off under `prefers-reduced-motion`.
  - Tests that this breaks:
    - Remove `garden` from the route list.
    - Update `onboarding ends on Home` if it checks the old h1.
- [ ] **Step 5:** Run `npm test`. Expected: all pass, the 9 new tests included.
- [ ] **Step 6:** Commit: `git commit -m "Daily lotus: growth, wilting and the garden"`

### Task 3: Session complete, Screen Time check-in in Stats, reminder

**Files:**
- Modify: `app.js`: session end (~403–417), `V.stats`, reminder 101 (~794); move the `checkin` sheet handler from `V.today.bind` to `V.stats.bind`
- Test: `tests/app.spec.js`

**Interfaces:**
- Consumes: `LOTUS_MIN`, `watered`, `tendLotus`, `S.lotus` from Task 2.

- [ ] **Step 1: Write and update the tests.**
  - `two short sits water the lotus`: lotus stage 3 (`checked` = −1) and today med 0. Run two 3-minute sits with the clock, as in `a timed sit logs its minutes`. After the second, expect `Your lotus is watered` and `Stage 4`.
  - `home shows what the lotus still needs`: lotus stage 3 and today med 2. Home reads `Needs water: 3 more minutes today`.
  - Change `the Screen Time check-in saves` so it opens it from `#stats`.
- [ ] **Step 2:** Run `npx playwright test -g "short sits|still needs|check-in"`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - In session end, compare `watered(today)` before and after adding the minutes, and call `tendLotus()`.
  - When it flips to true, add `Your lotus is watered · Stage N` above the statrow and a `See your lotus` link to `#today`.
  - The streak stat uses the new `streak()`.
  - In Stats, add a `Screen Time check-in` row under the tiles, with the same sheet as before.
  - Reminder 101 body: `Your lotus needs water: 5 minutes of stillness.`
- [ ] **Step 4:** Run `npm test`. Expected: all pass.
- [ ] **Step 5:** Commit: `git commit -m "Lotus after a sit, check-in in Stats, reminder text"`

### Task 4: Store and docs

- [ ] **Step 1:**
  - README: change the Home and Garden rows to "Home is the daily lotus: a 5-minute sit each day grows a seed through 10 stages; missed days wilt it".
  - `appstore/metadata.json`: update the "A LITTLE SPACE EACH DAY" bullets and the review notes (step 6, the check-in, is now in Stats).
  - `appstore/testflight.md` item 6.
- [ ] **Step 2:**
  - Remove art that's no longer used (`home`, `garden`, `evening`), unless onboarding uses it. Remove it from `sw.js` too.
  - Reshoot the store screenshots with the scratchpad `store.js`. Seed a stage-6 lotus and replace `05-garden` with a wilted or bloomed shot.
- [ ] **Step 3:** Run `npm test`, then commit: `git commit -m "Docs and store for the daily lotus"`
