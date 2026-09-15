// Shared in-memory app state. No backend, no auth, no persistence.
// Everything here resets when the page reloads. That is intentional.
//
// This is the seam where the two hackathon categories meet:
// Health (viewing a resource) writes `recentAcuity`, and the
// Entertainment side (the recommendation engine) reads it.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// How many recently viewed acuity values we keep. Newest first.
const MAX_RECENT_ACUITY = 5;

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // Acuity values of resources the user has opened, newest first, e.g. ['high', 'low'].
  const [recentAcuity, setRecentAcuity] = useState([]);
  // One of 'numb' | 'spiraling' | 'angry' | 'hollow', or null before check in.
  const [mood, setMood] = useState(null);
  // What they want to do: 'in' | 'out' | 'hands' | 'people', or null.
  const [intent, setIntent] = useState(null);
  // If staying in: 'watch' | 'listen' | 'read', or null.
  const [format, setFormat] = useState(null);
  // [{ mediaId, liked }] where liked is true for yes and false for no.
  const [feedback, setFeedback] = useState([]);

  // Called when a resource detail view opens. This is the Health -> Entertainment write.
  const recordAcuity = useCallback((acuity) => {
    setRecentAcuity((prev) => [acuity, ...prev].slice(0, MAX_RECENT_ACUITY));
  }, []);

  const recordMood = useCallback((nextMood) => {
    setMood(nextMood);
  }, []);

  // Changing what you want to do drops the format, so the next question is
  // always asked fresh rather than silently keeping a stale answer.
  const recordIntent = useCallback((nextIntent) => {
    setIntent(nextIntent);
    setFormat(null);
  }, []);

  const recordFormat = useCallback((nextFormat) => {
    setFormat(nextFormat);
  }, []);

  // Yes or no on a single recommendation card. One entry per media id, latest wins.
  const recordFeedback = useCallback((mediaId, liked) => {
    setFeedback((prev) => [...prev.filter((f) => f.mediaId !== mediaId), { mediaId, liked }]);
  }, []);

  // Take something back out of the library, returning it to the feed.
  const removeFeedback = useCallback((mediaId) => {
    setFeedback((prev) => prev.filter((f) => f.mediaId !== mediaId));
  }, []);

  const clearFeedback = useCallback(() => setFeedback([]), []);

  const value = useMemo(
    () => ({
      recentAcuity,
      mood,
      intent,
      format,
      feedback,
      recordAcuity,
      recordMood,
      recordIntent,
      recordFormat,
      recordFeedback,
      removeFeedback,
      clearFeedback,
    }),
    [
      recentAcuity,
      mood,
      intent,
      format,
      feedback,
      recordAcuity,
      recordMood,
      recordIntent,
      recordFormat,
      recordFeedback,
      removeFeedback,
      clearFeedback,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be called inside <AppStateProvider>. Check src/app/_layout.jsx.');
  }
  return context;
}
