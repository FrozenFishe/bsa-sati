# Sati — Meditate & Study

A free, installable meditation and study app (PWA) for the **Buddhist Society of Australia**,
an ACNC-registered charity (ABN 35 892 665 974).

It reworks the core loop of *Brainrot: Screen Time Control* (Smolworks Inc) for Buddhist practice.
No code, art or text from that app is used; only its publicly observable product patterns.

## How the reference was studied (REA)

The reference app's iOS binary is FairPlay-encrypted and wasn't available locally, so
[REA](https://github.com/morluto/rea) (`rea-agents@6.5.0`) was used in its website-observation
mode. Its CDP provider ran `list-browser-targets` and `inspect-web-page` against the public
ScreensDesign UI breakdown of the app. A summary of the findings is in
`docs/rea-findings.md`, alongside the public App Store listing.

| Brainrot pattern (observed) | Sati equivalent |
| --- | --- |
| Brain mascot that decays with screen time | Lotus that blooms or wilts with a daily **clarity** score |
| "See for yourself" screen-time slider | Onboarding slider: the lotus closes as hours rise |
| Quiz → named "attention profile" | Profile (e.g. *The Night Scroller*) linked to one of the Five Hindrances |
| "Years of your life lost" visual | Life grid: phone-years turn green when halved |
| Health score + calendar of daily emoji | Clarity score, week strip, month calendar (🪷🌸🌱🥀) |
| Intervention before opening blocked apps (5/10/15/30 min) | **Mindful pause** doorway: 3 breaths, then *stay present* or *use with intention* |
| Focus / Pomodoro timer | Study timer (25/5, 50/10, 90/15) that counts each time you leave the app as a "wander" |
| Smart schedules | Morning-sit / evening-study reminders exported as a daily `.ics` |
| Streaks, unlockable themes | Streak unlocks lotus colours (Saffron, Forest, Full moon, Bodhi gold) |
| Hard paywall | None: free, no account, no ads, data on device; links to Dharma Friend giving |

Additions: a meditation timer with a synthesised singing bowl, interval bells and guided cues
(breath, mettā, body scan, silent), and a Dharma library of 8 lessons with flashcards.

### Platform limits

A web app can't block other apps; that needs Apple's FamilyControls entitlement in a native app.
Instead, Sati's doorway link replaces the app's home-screen icon (setup steps are in the app),
and users are pointed to the system App Limits for hard blocking. There are no home-screen widgets.

## Live

https://sati.buddhistsocietiesofaustralia.org (Cloudflare Worker `sati` with static assets)

## Run / deploy

Static files, with no build step:

```bash
python3 -m http.server 8765   # http://127.0.0.1:8765
```

Deploy: `./build.sh && npx wrangler deploy` (with `CLOUDFLARE_ACCOUNT_ID` set to the Society's account).
`build.sh` copies the app into `public/`, the Worker's assets directory.
Bump `CACHE` in `sw.js` when shipping changes.

Files: `index.html`, `app.css`, `app.js` (views, scoring, timer, onboarding), `content.js`
(lessons and techniques), `sw.js` (offline), `manifest.webmanifest`, `icons/`.
