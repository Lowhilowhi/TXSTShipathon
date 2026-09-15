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
  // [{ mediaId, liked }] where liked is true for yes and false for no.
  const [feedback, setFeedback] = useState([]);

  // Called when a resource detail view opens. This is the Health -> Entertainment write.
  const recordAcuity = useCallback((acuity) => {
    setRecentAcuity((prev) => [acuity, ...prev].slice(0, MAX_RECENT_ACUITY));
  }, []);

  const recordMood = useCallback((nextMood) => {
    setMood(nextMood);
  }, []);

  // Yes or no on a single recommendation card. One entry per media id, latest wins.
  const recordFeedback = useCallback((mediaId, liked) => {
    setFeedback((prev) => [...prev.filter((f) => f.mediaId !== mediaId), { mediaId, liked }]);
  }, []);

  const clearFeedback = useCallback(() => setFeedback([]), []);

  const value = useMemo(
    () => ({
      recentAcuity,
      mood,
      feedback,
      recordAcuity,
      recordMood,
      recordFeedback,
      clearFeedback,
    }),
    [recentAcuity, mood, feedback, recordAcuity, recordMood, recordFeedback, clearFeedback]
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
