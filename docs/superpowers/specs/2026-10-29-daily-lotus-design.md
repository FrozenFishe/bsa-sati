# Daily lotus: a 5-minute sit every day, and a seed that grows into a flower

## Why

Rafael wants Sati to build a daily habit that has teeth. Each day the user must meditate for at least
5 minutes. Missing a day costs them something. Keeping the streak grows a seed through 10 stages
into a full lotus, a small game inside the app.

## The rules

**Daily minimum (Rafael's):** at least 5 minutes of meditation each day. There's no skip button, no
streak freeze and no "rest day". Settings can't lower it.

- What counts: completed meditation minutes in Sit that add up to 5 or more in a day. Two 3-minute
  sits count. Sits under 1 minute already don't count. Study, lessons and the doorway pause don't
  meet the minimum. *(My call: the rule says "meditation".)*
- A day runs from midnight to midnight on the phone's clock. *(My call: the same day boundary the
  app already uses.)*

**Growth (Rafael's: plant, water, 10 stages to a flower):**

- The user starts with a seed in hand (stage 0) and taps **Plant your seed** in the garden.
  That's stage 1.
- Each day the minimum is met, the lotus is **watered** and grows one stage. That's at most one stage
  per day, so a bloom takes 10 straight days. *(My call: one stage per day stops people binge-sitting
  to skip the habit.)*
- Other activities on the same day (a focus study, a lesson) show as **extra care**: a drop beside
  that day in the garden's week strip. They don't move the stage. *(Rafael's.)*
- At stage 10 the lotus blooms. The garden celebrates it, adds it to a **Bloomed** count ("3 lotuses
  bloomed"), and offers **Plant a new seed**. That starts again at stage 1.

**Penalty (Rafael's: you get penalised if you miss):**

- Each missed day: the lotus **wilts back one stage**. Its picture is shown faded and drooping, and
  the streak goes back to 0.
- Three missed days in a row: the lotus **withers**. It's lost, and the user starts over from a seed
  (stage 0). The Bloomed count is kept.
- On the first open after a miss, the garden says it plainly once, in a kind tone: "Your lotus missed
  its water yesterday and lost a stage." *(My call: honest, not shaming, since this is a Buddhist app.)*
- Days before the user first plants, and days before this update is installed, never count as missed.

**Edge rules** *(all my calls)*:
- Wilting stops at stage 1. Only three misses in a row take the lotus back to a seed.
- Days with no lotus in the ground don't count as missed: before the first planting, after a bloom, or
  after the lotus withers and before the user replants.
- Planting day counts. If the minimum is met that day, before or after tapping Plant, the lotus goes
  to stage 2.
- A bloomed lotus stays bloomed and can't wilt. It waits for **Plant a new seed**.
- The streak shown on Home and on the session-complete screen follows the lotus rule: days in a row
  with 5 or more meditation minutes. There's one streak, not two. Stats "days practised" keeps
  counting any practice.
- A study break ("Take a 5-minute break") is a real sit, so it counts toward the 5 minutes.

## The 10 stages

| # | Name | Picture |
|---|------|---------|
| 1 | Planted | a seed pressed into mud in a small clay bowl of water |
| 2 | Waking | the seed split, a tiny root |
| 3 | Sprout | a pale shoot breaks the surface |
| 4 | First leaf | one small round leaf on the water |
| 5 | Leaves | three floating leaves |
| 6 | Stem | a stem rising above the leaves |
| 7 | Bud | a small green bud |
| 8 | Blushing bud | the bud turning pink |
| 9 | Opening | the petals parting |
| 10 | Bloom | a full pink lotus, with Padma's face, in the same bowl |

Plus stage 0 (a seed resting on the bowl's rim, unplanted).

Art: 11 clay pictures in the current style (cream background, soft light), made on our studio GPUs.
Make one base picture of the bowl, then edit it for each stage, so the bowl, camera and light stay the
same and only the plant changes. Wilting is a CSS filter (desaturate, lower brightness), not extra art.

## Where it shows up

- **Garden (#garden)** replaces today's Seed/Sprout/Bloom page. It shows the stage picture large,
  "Stage 4 of 10 · Leaves", and a 10-step progress bar. Today's state reads "Watered today" or
  "Needs water: sit 5 minutes", with the minutes still left and a **Sit 5 minutes** button. Below
  that are the last 7 days (watered, missed or extra care) and the Bloomed count.
- **Home:** the "Meditate" row at the top of the daily practice list becomes the lotus row. It shows
  a small stage picture, "Water your lotus: 5 min sit", and how many minutes are left today. A done
  tick replaces this when the minimum is met. The big Begin button still uses the user's own sit
  length, for example 10 min, which also meets the 5. *(My call.)*
- **Session complete:** when a sit takes the day to 5 minutes or more, the screen shows
  "Your lotus is watered", the new stage and a **See your lotus** link. The garden then plays a short
  watering and growing animation once, and respects reduced motion.
- **Reminder:** the morning sit reminder (id 101) gets new text, "Your lotus needs water: 5 minutes
  of stillness". The evening study reminder stays as it is. *(My call: making the reminder skip days
  that are already done is native work, so it's out of scope.)*

## Data

The new state lives in `S.lotus = { stage, planted, checked, missed, bloomed, seen }`. Growth and
penalties are worked out from the daily history (`S.days[k].med`) when the app opens or a sit ends.
So reopening the app after days away gives the same result as if it had been open the whole time.
Backup and restore already carry `S` and need no change.

## Non-goals

- Locking other parts of the app until the sit is done. *(Rafael: no lock.)*
- Rewards, shops, several plants or social sharing.
- A grace period or paying to keep a streak.

## Anti-goals

- Guilt or harsh wording. The penalty is in the lotus, not in the text.
- Being able to grow the lotus without actually sitting.

## Decided by Rafael (29 Oct)

1. Only meditation waters the lotus. Study and lessons are extra-care drops and don't grow it.
2. No lock: the rest of the app stays open.
3. Penalty: one stage back per missed day, and the lotus withers after 3 missed days in a row.
4. The stage art is generated on the studio GPUs.

## Testing

Playwright tests with a fake clock and seeded history:

- a 5-minute day grows one stage, and a second sit the same day doesn't
- a missed day wilts back one stage
- three missed days wither the lotus to a seed
- stage 10 blooms and counts
- days before planting don't count

These run in light and dark mode like the rest.
