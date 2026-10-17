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

| Brainrot (App Store screenshots + REA capture) | Sati equivalent |
| --- | --- |
| Home: mascot in a landscape, big %, progress bar, Screen Time / Pickups / Focus tiles, Top Offenders, 🔥 streak | **Home**: Padma the lotus in a scene, clarity %, bar, Screen time / Pickups / Practice tiles, Top distractions, 🪔 streak |
| Mascot and world decay as screen time grows | The scene goes grey, the pond dries and stalks wither; Padma slumps and frowns |
| Block tab: Add Blocker, Blocking Now (Active), Presets, Your Lists | **Guard** tab: scheduled guards (Study Hall, Morning Sit, Night Rest, Weekend Retreat, custom), Active badge, your app list, doorway setup |
| Intervention before opening a blocked app (5/10/15/30 min) | **Doorway**: 3 breaths (5 during a guard), then *stay present* or *use with intention* |
| Focus mode: mascot meditating in a zen garden, big timer, stop button | **Sit** (centre tab): Padma under a Bodhi tree in a raked garden, outlined timer, "Keep going!" bar, stop button, open sit |
| Widgets: reminders checklist, Start Focus, live timer | Daily practice checklist on Home, timer in the tab title, Android shortcuts, calendar (`.ics`) reminders |
| Unlock rewards, customise the app | **Rewards**: streaks unlock scenes (Forest monastery, Full-moon night, Mountain temple, Bodhi at sunset) |
| Onboarding slider, attention profile, years-lost visual | The same flow, tied to the Five Hindrances |
| Hard paywall | None: free, no account, no ads, data on device; Dharma Friend giving link |

All artwork (`art.js`) is original SVG. Only the layouts and features follow the reference.

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
