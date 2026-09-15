# Steady

A mobile app for women and survivors: legal help, health help, and somewhere to land afterward.

Built in one day for the TXST Shipathon.
**Categories: Health x Entertainment**

---

## Why this exists

One in five women is sexually assaulted while in college. Eight out of ten are assaulted by someone they know, which means most survivors go on living in the same building, the same class, the same neighborhood as the person who did it.

Then comes the part nobody prepares you for.

Out of every 1,000 sexual assaults in the United States, 975 perpetrators walk free. Four in five reported perpetrators are never charged. Seventy four percent of reported rape cases are never resolved. The system that is supposed to protect you will more often interrogate you, doubt your timeline, ask what you were wearing, and send you home. Women are told it did not happen, or that it happened but not the way they remember, or that there is nothing to be done.

So the question a survivor is actually facing is not "should I report." It is "who do I even talk to, and will talking to them make this worse."

That question has a real answer, and almost nobody knows it. At Texas State, telling a supervisor or a professor is not a private conversation: under Texas SB 212, nearly every university employee is a mandatory reporter, and failing to report is grounds for termination. Calling HCWC is a private conversation. They are confidential, free, open 24/7, and they will help you file a protective order without any police report at all. Those two facts sit one click apart in this app, labeled, because knowing the difference changes what a person is willing to say out loud.

And after all that, at 2am, you are still awake replaying it. A counseling appointment three weeks out does not help at 2am. Something has to.

---

## The two categories, and why they need each other

This is not a resource list sitting next to a media list.

Every resource in the app carries an `acuity` value. Opening one records that acuity into app state. The recommendation engine reads both that acuity and how you say you are feeling, then decides what to put in front of you. Someone who just read about protective orders gets something different from someone who tapped counseling, and every card says out loud which feeling and which acuity produced it.

Entertainment stops being a catalog and becomes dosage. Health stops requiring you to walk into an office and say it out loud to a stranger.

And it runs the other way too. If you keep coming back to the same feeling, or keep rejecting what you are handed, the app reads that as the media side failing and puts a support resource back in front of you, saying which signal made it appear. Watching is not working, so here is a person. That is Entertainment writing into Health.

**What becomes possible only because these two collided: a recovery loop that learns which stories actually move a specific survivor, delivered through the one thing people will still open at 2am.**

---

## What is built

1. **Resource directory.** 15 verified entries across campus, Hays County, and national.
2. **Confidentiality is labeled.** Every entry states what it does and what it does not require, so confidential channels are visibly distinguishable from mandatory reporters.
3. **One screen, three questions in sequence.** How you are, what you want to do, and what kind. Each appears only once the last is answered, so cause and effect stays in a single view instead of across a navigation.
4. **Not only media.** "What do you want to do" branches to things to do with your hands, small ways out of the house, and people who get it, which routes straight back into the support level entries of the directory.
5. **Recommendation engine.** Scores on stated feeling plus recorded acuity, over 71 titles: films, series, books, music, podcasts, audiobooks and YouTube channels, never mixed into one list.
6. **A reason line on every card**, naming both the feeling and the acuity.
7. **Save or skip feedback** that visibly reweights what comes next, with saved items moving to a library and being replaced.
8. **A link on every card** to where you can actually watch, read or listen to it.
9. **A support resource that surfaces itself** when the media side is not working.

---

## How it works, technically

Stack: React Native, Expo SDK 57, Expo Router. No backend.

**Data.** `src/data/resources.json`, 15 entries. Each carries an `acuity` of high, medium, or low, plus `whatItDoes` and `doesNotRequire`.

**State.** `src/lib/state.js`, React Context. Holds recently viewed acuity values, every feeling selected in order, and feedback responses. In memory only.

**The coupling, forward.** Opening a resource detail writes its acuity into context. `src/lib/recommend.js` is a pure scoring function over `media.json`, taking feeling and recent acuity as inputs. Recent acuity becomes a pressure value from 0 to 1, weighting the most recent view double. Rising pressure scores gentler titles higher and, at the top of the range, removes the most intense material outright.

Same feeling, same format, one difference between these two runs:

| | What comes back |
|---|---|
| Nothing opened yet | Enola Holmes, **Erin Brockovich**, Hidden Figures, Ladies First, Legally Blonde, Ocean's Eight |
| After opening the protective order entry | Enola Holmes, Legally Blonde, **Bend It Like Beckham**, Hidden Figures, **Julie & Julia**, Ladies First |

Erin Brockovich is the only intensity 3 title in that set and it is gone. Two of the gentlest films move in behind it. Nothing was touched on the feed screen.

**The coupling, backward.** `supportSignal()` in the same file watches for the same feeling picked three or more times, or three or more rejections. Either one surfaces a support level resource in the feed with the signal that produced it written on it. Deliberately support level and never high acuity: three taps is not evidence of an emergency, and escalating to a protective order on that basis would be alarming rather than helpful.

This is the whole thesis in two lines of data flow. Health writes acuity and Entertainment reads it. Entertainment writes failure and Health answers. Remove either side and the other stops working.

**Content safety.** Every title carries an intensity of 1 to 3, and intensity 3 is unreachable while acuity pressure is high. Anything touching assault or abuse directly carries a content note rendered above the reasoning, always visible, never behind a tap.

---

## Privacy

Nothing is stored. No backend, no accounts, no persistence, no analytics. State lives in memory and is gone the moment you close it. There is nothing here to subpoena, and nothing for anyone to find on your phone.

---

## The vision, not yet built

**1. Somewhere to actually talk to each other.**
Right now the app can hand you a support group's phone number. It cannot let you say anything to anybody. The version I want is a place survivors can talk: accounts, public channels organized around what people are actually going through, and private one to one messages for when a channel is too much. Less a feature bolted onto a directory and more its own small social network, where the whole membership already understands the thing you would otherwise have to explain from the beginning.

It is not in this build for two reasons. The obvious one is that it needs what this app deliberately does not have: a backend, accounts, authentication, and stored messages. The real one is moderation. An unmoderated room full of survivors is not a support network, it is a place people get found, groomed, and hurt again, and the privacy promise above stops being true the moment messages are stored somewhere subpoenable. That is not a weekend feature. It is the part that has to be built most carefully, and building it badly would be worse than not building it.

**2. Research that was never done on us.**
Women are still under enrolled in the trials that decide how we get treated. Women are 60% of psychiatric patients and 42% of psychiatric trial participants. 49% of cardiovascular patients, 41.9% of participants. 51% of cancer patients, 41% of participants. The conditions that fall almost entirely on women, migraine, endometriosis, chronic fatigue, anxiety disorders, are funded far below the burden they actually carry. That is not a gap in one disease. That is decades of medicine built on a male default, and women paying for it in years of being told the pain is normal. Steady would surface studies on women's health that need funding, volunteers, and visibility, and route people to them.

**3. Everything else a survivor needs and has to find alone.**

- Evidence logging with a timestamped trail
- Live chat and warm handoff to a hotline
- Therapist and specialist matching, filtered by what it costs
- Community: not caseworkers, just people who get it, and who will go out with you. The "people who get it" branch is the stub of this, routing to real support services; the actual survivor to survivor part needs the backend described above
- Peer reviews of institutions, so you know which office actually helps

---

## Running it

**What you need:** [Node.js](https://nodejs.org) 20 or newer, and the **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779), [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)). Nothing else: no accounts, no API keys, no services to sign up for.

```
git clone https://github.com/Lowhilowhi/TXSTShipathon.git
cd TXSTShipathon
npm install
npx expo start
```

`npm install` takes a couple of minutes the first time. When the server finishes booting it prints a QR code in the terminal.

**Scan that QR** with the iPhone Camera app, or with Expo Go's built in scanner on Android. It opens on your phone as a real native app: React Native components rendered by the operating system, not a website inside a wrapper.

Your phone needs to be on the same Wi-Fi as the computer running the server. If it is not, run `npx expo start --tunnel` instead, which lifts that restriction.

Leave the terminal window open while you use it. Closing it stops the server.

If you cannot install Expo Go, pressing `w` in that same terminal opens the identical code in a browser at `http://localhost:8081`. That is a development convenience rather than the target platform, but the walkthrough below works there too.

State is in memory, so a refresh clears everything. That is the design, not a bug, and it is worth saying before someone reloads mid demo and thinks it broke.

## Walkthrough

1. **Where are you right now** → pick a feeling. **What do you want to do** → "Nothing. I am a homebody". **What kind** → "Something to watch". Note the chips: `acuity: none`. Erin Brockovich is in the list.
2. Back to home → **Find help** → County → **Protective Order (Hays County)**. The detail view records it.
3. Back to the feed. Same feeling, same format, but the chips now read `acuity: high` and Erin Brockovich is gone, replaced by gentler films. Read any **Why this** line aloud.
4. Tap the same feeling twice more. A support resource surfaces itself, saying which signal produced it.
5. **Save it** on any card → it confirms, leaves the list, is replaced, and lands in your library with a link.

---

## Sources

Contact details in `src/data/resources.json` verified against Texas State, Hays-Caldwell Women's Center, and national sources on the build date. Statistics from RAINN, NSVRC, JAMA Network Open, and Contemporary Clinical Trials.
