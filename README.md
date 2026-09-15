# HELP

A mobile app for women and survivors: legal help, health help, and somewhere to land afterward.

Built in one day for the TXST Shipathon.
**Categories: Health x Entertainment**

---

## Why this exists

One in five women is sexually assaulted while in college. Eight out of ten are
assaulted by someone they know, which means most survivors go on living in the
same building, the same class, the same neighborhood as the person who did it.

Then comes the part nobody prepares you for.

Out of every 1,000 sexual assaults in the United States, 975 perpetrators walk
free. Four in five reported perpetrators are never charged. Seventy four percent
of reported rape cases are never resolved. The system that is supposed to protect
you will more often interrogate you, doubt your timeline, ask what you were
wearing, and send you home. Women are told it did not happen, or that it happened
but not the way they remember, or that there is nothing to be done.

So the question a survivor is actually facing is not "should I report." It is
"who do I even talk to, and will talking to them make this worse."

That question has a real answer, and almost nobody knows it. At Texas State,
telling a supervisor or a professor is not a private conversation: under Texas
SB 212, nearly every university employee is a mandatory reporter, and failing to
report is grounds for termination. Calling HCWC is a private conversation. They
are confidential, free, open 24/7, and they will help you file a protective order
without any police report at all. Those two facts sit one click apart in this app,
labeled, because knowing the difference changes what a person is willing to say
out loud.

And after all that, at 2am, you are still awake replaying it. A counseling
appointment three weeks out does not help at 2am. Something has to.

---

## The two categories, and why they need each other

This is not a resource list sitting next to a media list.

Every resource in the app carries an `acuity` value. Opening one records that
acuity into app state. The recommendation engine reads both that acuity and how
you say you are feeling, then decides what to put in front of you. Someone who
just read about protective orders gets something different from someone who
tapped counseling, and every card says out loud which feeling and which acuity
produced it.

Entertainment stops being a catalog and becomes dosage. Health stops requiring
you to walk into an office and say it out loud to a stranger.

**What becomes possible only because these two collided: a recovery loop that
learns which stories actually move a specific survivor, delivered through the one
thing people will still open at 2am.**

---

## What is built

- Resource directory: 15 verified entries across campus, Hays County, and national
- Every entry states what it does **and what it does not require**, so confidential channels are visibly distinguishable from mandatory reporters
- Check in and feed merged into one screen, so cause and effect is visible in a single view instead of across a navigation
- Recommendation engine scoring on stated feeling plus recorded acuity
- A reason line on every card
- Yes or no feedback that visibly reweights what comes next

## How it works, technically

Stack: React Native, Expo SDK 57, Expo Router. No backend.

**Data.** `src/data/resources.json`, 15 entries. Each carries an `acuity` of
high, medium, or low, plus `whatItDoes` and `doesNotRequire`.

**State.** `src/lib/state.js`, React Context. Holds recently viewed acuity values,
current feeling, and feedback responses. In memory only.

**The coupling.** Opening a resource detail writes its acuity into context.
`src/lib/recommend.js` is a pure scoring function over `media.json`, taking
feeling and recent acuity as inputs. High recent acuity suppresses high intensity
content: after viewing the protective order entry, an intensity 3 title like
Erin Brockovich is filtered out where it would otherwise score well.

This is the whole thesis in one line of data flow. The Health side writes acuity.
The Entertainment side reads it. Remove either and the other stops working.

## Privacy

Nothing is stored. No backend, no accounts, no persistence, no analytics. State
lives in memory and is gone the moment you close it. There is nothing here to
subpoena, and nothing for anyone to find on your phone.

---

## The vision, not yet built

**Research that was never done on us.**
Women are still under enrolled in the trials that decide how we get treated.
Women are 60% of psychiatric patients and 42% of psychiatric trial participants.
49% of cardiovascular patients, 41.9% of participants. 51% of cancer patients,
41% of participants. The conditions that fall almost entirely on women, migraine,
endometriosis, chronic fatigue, anxiety disorders, are funded far below the burden
they actually carry. That is not a gap in one disease. That is decades of medicine
built on a male default, and women paying for it in years of being told the pain
is normal. HELP would surface studies on women's health that need funding,
volunteers, and visibility, and route people to them.

**Everything else a survivor needs and has to find alone:**

- Evidence logging with a timestamped trail
- Live chat and warm handoff to a hotline
- Therapist and specialist matching, filtered by what it costs
- Community: not caseworkers, just people who get it, and who will go out with you
- Peer reviews of institutions, so you know which office actually helps

---

## Running it

```
npm install
npx expo start
```

Scan the QR with Expo Go.

## Sources

Contact details in `src/data/resources.json` verified against Texas State,
Hays-Caldwell Women's Center, and national sources on the build date.
Statistics from RAINN, NSVRC, JAMA Network Open, and Contemporary Clinical Trials.
