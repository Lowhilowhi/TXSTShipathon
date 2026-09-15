// Pure recommendation logic. No React, no react-native, no UI imports.
// Everything here is a plain function of its arguments, so it can be read,
// reasoned about, and tested on its own.
//
// This is the file where the two hackathon categories actually meet.
// `mood` comes from the Health side check in. `recentAcuity` comes from
// which support resources the user opened. Both are required inputs.

import mediaData from '@/data/media.json';

// What each mood is reaching for, and the wording used in the why sentence.
export const MOOD_TARGETS = {
  spiraling: {
    tags: ['ensemble', 'comedy'],
    phrase: 'an ensemble comedy, busy enough to interrupt a thought loop',
  },
  hollow: {
    tags: ['warmth', 'connection'],
    phrase: 'about warmth and people choosing each other',
  },
  angry: {
    tags: ['women-winning', 'justice'],
    phrase: 'a story where a woman is underestimated and wins anyway',
  },
  numb: {
    tags: ['gentle', 'low-stakes'],
    phrase: 'gentle and low stakes, nothing that demands a reaction',
  },
};

// Plain English for each tag, used in the why sentence.
export const TAG_LABELS = {
  ensemble: 'with a big cast',
  comedy: 'funny',
  warmth: 'warm',
  connection: 'about people choosing each other',
  'women-winning': 'about a woman winning',
  justice: 'about something unfair being put right',
  gentle: 'gentle',
  'low-stakes': 'low stakes',
};

// Which catalogue types belong to each format the user can ask for. Keeping
// this here rather than in the screen means the split is testable.
export const FORMAT_TYPES = {
  watch: ['film', 'series', 'video'],
  listen: ['music', 'podcast', 'audiobook'],
  read: ['book'],
};

export const FORMAT_LABELS = {
  watch: 'Something to watch',
  listen: 'Something to listen to',
  read: 'Something to read',
};

// How much each acuity level counts toward "this person is in a rough spot".
const ACUITY_WEIGHT = { high: 1, medium: 0.5, low: 0 };

// Points per matching mood tag.
const TAG_POINTS = 3;

// Points per tag shared with something the user said yes or no to.
const FEEDBACK_POINTS = 2;

/**
 * Turns the list of recently viewed acuity values into a single 0..1 number.
 * The most recently viewed resource counts double, because it is the best
 * signal of where the person is right now.
 */
export function acuityPressure(recentAcuity) {
  if (!recentAcuity || recentAcuity.length === 0) return 0;

  let total = 0;
  let weight = 0;
  recentAcuity.forEach((acuity, index) => {
    const w = index === 0 ? 2 : 1;
    total += (ACUITY_WEIGHT[acuity] ?? 0) * w;
    weight += w;
  });

  return weight === 0 ? 0 : total / weight;
}

/**
 * A readable bucket for the 0..1 pressure number.
 *
 * `hasViews` is separate from the number on purpose. Low acuity resources are
 * weighted 0, so someone who only opened counseling has a pressure of 0 but has
 * still opened something. Without this flag the card would tell them they had
 * not opened anything, which is both wrong and the kind of thing that makes an
 * app feel like it is not listening.
 */
export function pressureLabel(pressure, hasViews = true) {
  if (!hasViews) return 'none';
  if (pressure >= 0.6) return 'high';
  if (pressure >= 0.3) return 'medium';
  return 'low';
}

// The acuity half of the why sentence.
const ACUITY_PHRASES = {
  high: 'You have been looking at immediate safety resources, so anything heavy is filtered out and this is one of the gentlest things here.',
  medium:
    'You have been looking at reporting level resources, so this is kept on the steadier side.',
  low: 'The resources you opened were support level, so this does not have to be especially soft.',
  none: 'You have not opened any resources yet, so nothing is being filtered for intensity.',
};

/**
 * Score one media item. Higher is a better fit.
 *
 * Two terms, both legible:
 *   1. Mood fit   - one point block per tag the mood is reaching for.
 *   2. Acuity fit - the more high acuity resources viewed, the more a gentle,
 *                   low intensity item is rewarded over an intense one.
 */
export function scoreItem(item, moodTags, pressure) {
  const matchedTags = item.tags.filter((tag) => moodTags.includes(tag));
  const moodScore = matchedTags.length * TAG_POINTS;

  // intensity 1 gains the most, intensity 3 gains nothing, and the whole
  // effect scales with how much acuity pressure there is.
  const acuityScore = (3 - item.intensity) * pressure * 3;

  return { score: moodScore + acuityScore, matchedTags, moodScore, acuityScore };
}

/** The plain sentence shown on the card, naming both the mood and the acuity. */
export function buildReason(mood, label) {
  const target = MOOD_TARGETS[mood];
  return `You checked in as ${mood}, so this is ${target.phrase}. ${ACUITY_PHRASES[label]}`;
}

/**
 * Collects the tags of everything the user said yes or no to, so that a yes
 * on one title pulls up other titles that share its tags.
 *
 * `protectedTags` are the tags the current mood is reaching for. A no never
 * counts against those, because feedback is meant to refine the list within
 * the mood, not to overrule the check in. Saying no to one sitcom should get
 * you a different sitcom, not a documentary.
 */
export function feedbackTags(feedback, catalog, protectedTags = []) {
  const liked = new Set();
  const disliked = new Set();

  feedback.forEach(({ mediaId, liked: isLiked }) => {
    const item = catalog.find((m) => m.id === mediaId);
    if (!item) return;
    item.tags.forEach((tag) => (isLiked ? liked : disliked).add(tag));
  });

  // A tag the user said yes to elsewhere should not also count against them.
  liked.forEach((tag) => disliked.delete(tag));
  protectedTags.forEach((tag) => disliked.delete(tag));

  return { liked: [...liked], disliked: [...disliked] };
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {string} input.mood          one of the keys of MOOD_TARGETS
 * @param {string[]} input.recentAcuity  e.g. ['high', 'low'], newest first
 * @param {object[]} input.feedback    [{ mediaId, liked }] from the cards
 * @param {number} input.limit         how many cards to return
 * @returns {{ pressure, label, items, hiddenCount }} items sorted, best first
 */
export function recommend({ mood, recentAcuity = [], feedback = [], format = null, limit = 6 }) {
  const pressure = acuityPressure(recentAcuity);
  const label = pressureLabel(pressure, recentAcuity.length > 0);

  // No mood yet means we cannot honestly explain a pick, so return nothing.
  const target = MOOD_TARGETS[mood];
  if (!target) return { pressure, label, items: [], hiddenCount: 0 };

  const catalog = mediaData.media;
  const { liked, disliked } = feedbackTags(feedback, catalog, target.tags);

  // Anything you have answered leaves the feed. A yes moves it to your library,
  // a no discards it, and either way something new takes the slot. Without this
  // a liked item scores itself higher on its own tags and pins to the top
  // forever, which looks exactly like a frozen button.
  const answeredIds = feedback.map((f) => f.mediaId);
  const rejectedIds = feedback.filter((f) => !f.liked).map((f) => f.mediaId);

  const allowedTypes = format ? FORMAT_TYPES[format] : null;

  const eligible = catalog.filter((item) => {
    if (answeredIds.includes(item.id)) return false;
    // Only the format they asked for: watch, listen or read.
    if (allowedTypes && !allowedTypes.includes(item.type)) return false;
    // Under high pressure, the most intense material is removed too.
    if (label === 'high' && item.intensity >= 3) return false;
    return true;
  });

  const baseReason = buildReason(mood, label);

  const scored = eligible
    .map((item) => {
      const { score, matchedTags } = scoreItem(item, target.tags, pressure);

      const likedHits = item.tags.filter((tag) => liked.includes(tag));
      const dislikedHits = item.tags.filter((tag) => disliked.includes(tag));
      const feedbackScore = (likedHits.length - dislikedHits.length) * FEEDBACK_POINTS;

      return {
        ...item,
        score: score + feedbackScore,
        matchedTags,
        reason: baseReason + feedbackClause(likedHits, dislikedHits),
      };
    })
    // Sort by score, then title, so the order is stable and repeatable.
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return {
    pressure,
    label,
    items: scored.slice(0, limit),
    hiddenCount: rejectedIds.length,
    savedCount: feedback.length - rejectedIds.length,
  };
}

/**
 * Where to actually find this thing, built from the title and type.
 *
 * These are search links rather than hardcoded deep links on purpose. What is
 * streaming where changes constantly and differs by country, so a stored
 * "watch on X" URL would be wrong within months. A search always resolves.
 */
export function linkFor(item) {
  // Titles carry the author or artist after a dash, and that dash breaks most
  // search engines: "Beach Read - Emily Henry" returns nothing, while
  // "Beach Read Emily Henry" finds it immediately.
  const q = encodeURIComponent(item.title.replace(/ - /g, ' '));

  switch (item.type) {
    case 'book':
      // A plain web search always returns something useful here, including
      // libraries, shops and the author's own page.
      return { label: 'Find this book', url: `https://www.google.com/search?q=${q}+book` };
    case 'audiobook':
      return { label: 'Find the audiobook', url: `https://www.google.com/search?q=${q}+audiobook` };
    case 'video':
      return {
        label: 'Watch on YouTube',
        url: `https://www.youtube.com/results?search_query=${q}`,
      };
    case 'music':
    case 'podcast':
      return { label: 'Listen on Spotify', url: `https://open.spotify.com/search/${q}` };
    default:
      // JustWatch is a legal streaming guide. It hosts nothing itself, it just
      // says which services currently carry a title and what a rental costs.
      return { label: 'Find where to watch', url: `https://www.justwatch.com/us/search?q=${q}` };
  }
}

// How many repeats before the app stops offering media and offers a person.
export const SUPPORT_THRESHOLD = 3;

/**
 * The return path: Entertainment feeding back into Health.
 *
 * The forward path is viewing a resource changing what gets recommended. This
 * is the other direction. If someone keeps landing on the same bad feeling, or
 * keeps rejecting what they are offered, that is evidence the media side is not
 * doing its job, and the right response is to put a person back in front of
 * them rather than a seventh thing to watch.
 *
 * Pure, like everything else in this file. It reads signals and returns a
 * verdict; the screen decides how to draw it.
 */
export function supportSignal({ moodHistory = [], feedback = [] }) {
  const current = moodHistory.length ? moodHistory[moodHistory.length - 1] : null;
  const repeats = current ? moodHistory.filter((m) => m === current).length : 0;
  const rejections = feedback.filter((f) => !f.liked).length;

  // Mood is checked first: coming back to the same place is the stronger signal.
  if (repeats >= SUPPORT_THRESHOLD) {
    return {
      triggered: true,
      kind: 'mood',
      headline: 'This keeps bringing you back to the same place.',
      reason: `You have checked in as ${current} ${repeats} times now. Sometimes the thing that helps is not another thing to watch, and that is not a failure on your part.`,
    };
  }

  if (rejections >= SUPPORT_THRESHOLD) {
    return {
      triggered: true,
      kind: 'rejection',
      headline: 'Nothing here is landing.',
      reason: `You have passed on ${rejections} of these. When that happens it usually means the problem is not the recommendations, so here is the other kind of help.`,
    };
  }

  return { triggered: false };
}

/** The saved items, newest first, resolved back to full catalog entries. */
export function savedItems(feedback) {
  return feedback
    .filter((f) => f.liked)
    .map((f) => mediaData.media.find((m) => m.id === f.mediaId))
    .filter(Boolean)
    .reverse();
}

/**
 * The optional third sentence, added only once the user has given feedback.
 * It states what the feedback counted as, not where the item ended up, because
 * position is decided by all three terms together.
 */
function feedbackClause(likedHits, dislikedHits) {
  if (likedHits.length > 0) {
    return ` You said yes to something ${TAG_LABELS[likedHits[0]]}, and this is too.`;
  }
  if (dislikedHits.length > 0) {
    return ` You said no to something ${TAG_LABELS[dislikedHits[0]]}, which counted against this one.`;
  }
  return '';
}
