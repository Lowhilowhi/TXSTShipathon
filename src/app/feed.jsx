// Recommendation feed. Reads mood and recent acuity out of shared state,
// hands them to the pure engine in src/lib/recommend.js, and renders the result.
// This screen holds no matching logic of its own.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { recommend } from '@/lib/recommend';
import { useAppState } from '@/lib/state';
import { acuityColors, colors, maxWidth, radius, space } from '@/lib/theme';

export default function FeedScreen() {
  const router = useRouter();
  const { mood, recentAcuity, feedback, recordFeedback, clearFeedback } = useAppState();
  const { label, items, hiddenCount } = recommend({ mood, recentAcuity, feedback });

  if (!mood) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.title}>Check in first</Text>
          <Text style={styles.subtitle}>
            Every suggestion here has to be able to explain itself, and it cannot do that without
            knowing how you are doing.
          </Text>
          <Pressable
            onPress={() => router.push('/mood')}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>How are you right now?</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.stateBar}>
          <Text style={styles.stateLabel}>Picked using</Text>
          <View style={styles.chips}>
            <View style={[styles.chip, styles.chipMood]}>
              <Text style={styles.chipMoodText}>mood: {mood}</Text>
            </View>
            <View style={[styles.chip, { borderColor: acuityColors[label] ?? colors.border }]}>
              <Text style={[styles.chipText, { color: acuityColors[label] ?? colors.textSoft }]}>
                acuity: {label}
              </Text>
            </View>
          </View>
          <Text style={styles.stateNote}>
            {recentAcuity.length === 0
              ? 'No resources opened yet.'
              : `From the ${recentAcuity.length} resource${
                  recentAcuity.length === 1 ? '' : 's'
                } you opened: ${recentAcuity.join(', ')}.`}
          </Text>
        </View>

        {feedback.length > 0 ? (
          <View style={styles.changed}>
            <Text style={styles.changedText}>
              This list just changed.{' '}
              {hiddenCount > 0
                ? `${hiddenCount} ${hiddenCount === 1 ? 'title is' : 'titles are'} gone because you said no`
                : 'Nothing was removed'}
              {feedback.some((f) => f.liked)
                ? ', and anything sharing tags with your yes moved up.'
                : ', and the rest reordered.'}
            </Text>
            <Pressable
              onPress={clearFeedback}
              style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
              <Text style={styles.resetText}>Start the list over</Text>
            </Pressable>
          </View>
        ) : null}

        {items.map((item) => {
          const saidYes = feedback.some((f) => f.mediaId === item.id && f.liked);
          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardType}>{item.type}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.description}</Text>

              <View style={styles.why}>
                <Text style={styles.whyLabel}>Why this</Text>
                <Text style={styles.whyText}>{item.reason}</Text>
              </View>

              <Text style={styles.askLabel}>Would this help?</Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => recordFeedback(item.id, true)}
                  style={({ pressed }) => [
                    styles.action,
                    styles.yes,
                    saidYes && styles.yesActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.actionText, saidYes && styles.yesActiveText]}>
                    {saidYes ? 'Yes, more like this' : 'Yes'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => recordFeedback(item.id, false)}
                  style={({ pressed }) => [styles.action, styles.no, pressed && styles.pressed]}>
                  <Text style={[styles.actionText, styles.noText]}>No</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, paddingBottom: space.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth, gap: space.md },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '600', color: colors.text, marginTop: space.sm },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.textSoft },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  pressed: { opacity: 0.75 },

  stateBar: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius,
    padding: space.md,
    gap: space.sm,
    marginTop: space.sm,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    backgroundColor: colors.surface,
  },
  chipMood: { borderColor: colors.accent },
  chipMoodText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  chipText: { fontSize: 14, fontWeight: '600' },
  stateNote: { fontSize: 14, lineHeight: 21, color: colors.textSoft },

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

  changed: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: space.md,
    gap: space.sm,
  },
  changedText: { fontSize: 15, lineHeight: 23, color: colors.text },
  reset: { alignSelf: 'flex-start', paddingVertical: space.sm, minHeight: 44, justifyContent: 'center' },
  resetText: { fontSize: 15, fontWeight: '600', color: colors.accent },

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
  yesActive: { backgroundColor: colors.accent },
  no: { borderColor: colors.border, backgroundColor: colors.surface },
  actionText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  yesActiveText: { color: '#FFFFFF' },
  noText: { color: colors.textSoft },
});
