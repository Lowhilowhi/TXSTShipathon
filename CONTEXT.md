# Project brief

I am building a mobile app in one day for a hackathon. I have web development and C++ experience but have never built a mobile app. This is an Expo project, SDK 57, using Expo Router with `src/app` as the router root. I am testing in the browser at localhost:8081, not on a device.

Work in order, and commit to git after each numbered step completes and runs without errors. Do not skip ahead. Keep every file small and self contained so a single file plus an error message is enough to debug it in isolation.

## The concept

An app for assault and abuse survivors, built on two hackathon categories, Health and Entertainment, which must be genuinely interdependent rather than two separate feature sets sitting side by side.

The app first helps someone find the right reporting and support channel, then supports recovery by treating media as an intervention rather than a catalog. The dependency runs one direction and must be visible in the code: every resource carries an `acuity` value, viewing a resource records that acuity into app state, and the recommendation engine reads both the recorded acuity and the user's mood check in to decide what to surface. Someone who just viewed protective order information receives different recommendations than someone who tapped counseling. Every recommendation displays the reason it was chosen, naming the mood and acuity that produced it.

## Build order

1. Create `CONTEXT.md` in the project root containing this entire brief. Run `git init` and commit.
2. Create `src/data/resources.json`. Twelve entries minimum, each with: id, tier (campus, county, or national), acuity (high, medium, or low), name, whatItDoes, doesNotRequire, link, phone. Use clearly marked placeholder contact details, with a comment at the top of the file saying real Texas State and Hays County data will replace them. High acuity means immediate safety, protective orders, emergency. Medium means formal reporting, Title IX, Dean of Students. Low means counseling, support groups, peer support.
3. Build the resource directory screen. Entries grouped by tier, campus first, then county, then national. Each entry shows name, whatItDoes, and doesNotRequire. Tapping an entry opens a detail view and records that entry's acuity into shared app state.
4. Build shared state using React Context in `src/lib/state.js`. It holds: recent acuity values viewed, current mood, and a list of feedback responses. No backend, no auth, no persistence. In memory only.
5. Build the mood check in screen. Three to four large tappable options, no text input. Suggested options: numb, spiraling, angry, hollow. Writes to shared state.
6. Build `src/lib/recommend.js` as pure functions with no UI imports. It takes mood and recent acuity and returns scored recommendations from a local `src/data/media.json` that you also create, roughly twenty entries with fields for title, type, tags, and a short description. The matching logic should be legible: spiraling maps toward ensemble comedy that interrupts rumination, hollow toward warmth and connection, angry toward women-winning narratives, numb toward gentle low-stakes content. High recent acuity should shift everything toward safer, lower-intensity picks.
7. Build the recommendation feed screen. Each card shows the title, the description, and a plain sentence explaining why it was chosen, referencing both the mood and the acuity state.
8. Add a yes or no feedback control on each card. Feedback writes to shared state and visibly changes the next set of recommendations. This is the demo moment that proves the two categories are wired together, so make the change obvious.
9. Light visual pass only. Calm palette, generous spacing, large touch targets, readable at a glance. No animation libraries, no component frameworks.

## Out of scope, do not build

Live chat or hotline, evidence logging, therapist or hospital matching, research funding discovery, account sharing, discounts, shopping, outfit suggestions, job help, any backend, any authentication, any persistence, any user accounts, any third party APIs, any paid services.

## Working style

After each step, tell me what you built, what file it lives in, and what I should see on screen. If something fails, fix it and say what was wrong. Never mark a step complete unless the app runs. If you finish all nine steps, stop and write a short summary of what exists and what a demo walkthrough would look like. Do not start unlisted work.

One thing to handle before you leave: check that step 3 actually renders in the browser. If the scaffolding is broken, everything after it is wasted effort, and you'd rather know at 8am than at 6:30pm.

I'll have the real Texas State and Hays County contacts ready for when you're back so you can drop them into `resources.json` in about ten minutes.
