// One recommendation card.
//
// The card owns its own "you just tapped this" moment. Tapping save or skip
// does not remove it straight away: it swaps to a confirmation panel, holds it
// long enough to read, fades, and only then tells the parent to commit the
// change. Without that the card vanished instantly and you could not tell
// whether your tap had registered.
//
// Animated is React Native's built in API, not an animation library.

import { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { linkFor } from '@/lib/recommend';
import { colors, radius, space } from '@/lib/theme';

const HOLD_MS = 700;
const FADE_MS = 320;

export default function MediaCard({ item, onSave, onSkip }) {
  const [acted, setActed] = useState(null);
  const fade = useRef(new Animated.Value(1)).current;
  const timer = useRef(null);
  const link = linkFor(item);

  useEffect(() => () => clearTimeout(timer.current), []);

  function act(kind) {
    if (acted) return;
    setActed(kind);

    Animated.timing(fade, {
      toValue: 0,
      duration: FADE_MS,
      delay: HOLD_MS,
      // Web does not take the native driver for this, and it is one opacity.
      useNativeDriver: false,
    }).start();

    timer.current = setTimeout(() => {
      if (kind === 'saved') onSave();
      else onSkip();
    }, HOLD_MS + FADE_MS);
  }

  if (acted) {
    return (
      <Animated.View
        style={[
          styles.confirm,
          acted === 'saved' ? styles.confirmSaved : styles.confirmSkipped,
          { opacity: fade },
        ]}>
        <Text style={acted === 'saved' ? styles.confirmTextSaved : styles.confirmTextSkipped}>
          {acted === 'saved' ? '✓  Saved to your library' : '✕  Skipped'}
        </Text>
        <Text style={styles.confirmSub}>
          {acted === 'saved' ? item.title : 'Something else is taking its place'}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, { opacity: fade }]}>
      <Text style={styles.cardType}>{item.type}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.description}</Text>

      {item.contentNote ? (
        <View style={styles.noteBlock}>
          <Text style={styles.noteLabel}>Heads up</Text>
          <Text style={styles.noteBody}>{item.contentNote}</Text>
        </View>
      ) : null}

      <View style={styles.why}>
        <Text style={styles.whyLabel}>Why this</Text>
        <Text style={styles.whyText}>{item.reason}</Text>
      </View>

      <Pressable
        onPress={() => Linking.openURL(link.url)}
        style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
        <Text style={styles.linkButtonText}>{link.label}</Text>
      </Pressable>

      <Text style={styles.askLabel}>Keep this one?</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => act('saved')}
          style={({ pressed }) => [styles.action, styles.yes, pressed && styles.yesPressed]}>
          <Text style={styles.actionText}>Save it</Text>
        </Pressable>
        <Pressable
          onPress={() => act('skipped')}
          style={({ pressed }) => [styles.action, styles.no, pressed && styles.pressed]}>
          <Text style={[styles.actionText, styles.noText]}>Not this</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.sm,
  },
  cardType: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: { fontSize: 21, fontWeight: '600', color: colors.text },
  cardBody: { fontSize: 16, lineHeight: 24, color: colors.text },

  noteBlock: {
    backgroundColor: colors.noteSoft,
    borderRadius: radius - 4,
    borderLeftWidth: 5,
    borderLeftColor: colors.note,
    padding: space.md,
    gap: 2,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.note,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteBody: { fontSize: 15, lineHeight: 23, color: colors.text },

  why: {
    backgroundColor: colors.background,
    borderRadius: radius - 4,
    padding: space.md,
    gap: space.xs,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whyText: { fontSize: 15, lineHeight: 23, color: colors.textSoft },

  linkButton: {
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  linkButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  askLabel: { fontSize: 14, color: colors.textSoft },
  actions: { flexDirection: 'row', gap: space.sm },
  action: {
    flex: 1,
    borderRadius: radius,
    borderWidth: 1,
    paddingVertical: space.md,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yes: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  // A clear pressed state, so the tap is visible even before the confirmation.
  yesPressed: { backgroundColor: colors.accent, opacity: 1 },
  no: { borderColor: colors.border, backgroundColor: colors.surface },
  pressed: { opacity: 0.6 },
  actionText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  noText: { color: colors.textSoft },

  confirm: {
    borderRadius: radius,
    borderWidth: 2,
    padding: space.lg,
    gap: space.xs,
    minHeight: 96,
    justifyContent: 'center',
  },
  confirmSaved: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  confirmSkipped: { backgroundColor: colors.surface, borderColor: colors.border },
  confirmTextSaved: { fontSize: 20, fontWeight: '700', color: colors.accent },
  confirmTextSkipped: { fontSize: 20, fontWeight: '700', color: colors.textSoft },
  confirmSub: { fontSize: 15, lineHeight: 22, color: colors.textSoft },
});
