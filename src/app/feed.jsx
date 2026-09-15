// One screen: pick how you are, see what helps, immediately.
//
// The check in and the recommendations used to be two routes. They are merged
// because the whole point is that one drives the other, and you cannot see that
// happen if it takes a navigation to find out.
//
// This screen holds no matching logic of its own. It reads shared state, hands
// it to the pure engine in src/lib/recommend.js, and renders the result.

import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { linkFor, recommend } from '@/lib/recommend';
import { useAppState } from '@/lib/state';
import { acuityColors, colors, maxWidth, radius, space } from '@/lib/theme';

// The key must match the moods handled in src/lib/recommend.js.
// Each option names the feeling and what it will get you, so picking one is a
// choice about your evening rather than a self diagnosis.
const OPTIONS = [
  { key: 'spiraling', label: 'I cannot stop thinking', want: 'Give me something loud enough to drown it out' },
  { key: 'hollow', label: 'I feel empty', want: 'Give me people being good to each other' },
  { key: 'angry', label: 'I am furious', want: 'Give me a woman who wins' },
  { key: 'numb', label: 'I feel nothing', want: 'Give me something easy that asks nothing' },
];

export default function RightNowScreen() {
  const router = useRouter();
  const { mood, recentAcuity, feedback, recordMood, recordFeedback, clearFeedback } = useAppState();
  const { label, items, hiddenCount, savedCount } = recommend({ mood, recentAcuity, feedback });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <Text style={styles.title}>Where are you right now?</Text>
        <Text style={styles.subtitle}>
          Tap one. The list underneath changes as soon as you do, and you can change your mind as
          often as you want.
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = mood === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => recordMood(option.key)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionWant, selected && styles.optionWantSelected]}>
                  {option.want}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!mood ? (
          <Text style={styles.empty}>
            Nothing is suggested until you pick one, because every card here has to be able to say
            why it was chosen.
          </Text>
        ) : (
          <>
            <View style={styles.stateBar}>
              <Text style={styles.stateLabel}>Picked using</Text>
              <View style={styles.chips}>
                <View style={[styles.chip, styles.chipMood]}>
                  <Text style={styles.chipMoodText}>mood: {mood}</Text>
                </View>
                <View style={[styles.chip, { borderColor: acuityColors[label] ?? colors.border }]}>
                  <Text
                    style={[styles.chipText, { color: acuityColors[label] ?? colors.textSoft }]}>
                    acuity: {label}
                  </Text>
                </View>
              </View>
              <Text style={styles.stateNote}>
                {recentAcuity.length === 0
                  ? 'No resources opened yet, so nothing is filtered for intensity.'
                  : `From the ${recentAcuity.length} resource${
                      recentAcuity.length === 1 ? '' : 's'
                    } you opened: ${recentAcuity.join(', ')}.`}
              </Text>
            </View>

            {feedback.length > 0 ? (
              <View style={styles.changed}>
                <Text style={styles.changedText}>
                  {savedCount > 0
                    ? `${savedCount} saved to your library and ${savedCount === 1 ? 'it is' : 'they are'} out of this list. `
                    : ''}
                  {hiddenCount > 0
                    ? `${hiddenCount} ${hiddenCount === 1 ? 'title is' : 'titles are'} gone because you said no. `
                    : ''}
                  New ones took their place, and anything like what you saved moved up.
                </Text>
                <View style={styles.changedActions}>
                  {savedCount > 0 ? (
                    <Pressable
                      onPress={() => router.push('/library')}
                      style={({ pressed }) => [styles.libraryButton, pressed && styles.pressed]}>
                      <Text style={styles.libraryButtonText}>Open library ({savedCount})</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={clearFeedback}
                    style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
                    <Text style={styles.resetText}>Start the list over</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {items.map((item) => {
              const link = linkFor(item);
              return (
                <View key={item.id} style={styles.card}>
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
                      onPress={() => recordFeedback(item.id, true)}
                      style={({ pressed }) => [styles.action, styles.yes, pressed && styles.pressed]}>
                      <Text style={styles.actionText}>Save it</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => recordFeedback(item.id, false)}
                      style={({ pressed }) => [styles.action, styles.no, pressed && styles.pressed]}>
                      <Text style={[styles.actionText, styles.noText]}>Not this</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, paddingBottom: space.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth, gap: space.md },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: colors.text,
    marginTop: space.sm,
  },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.textSoft },

  options: { gap: space.sm },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    gap: 2,
    minHeight: 72,
    justifyContent: 'center',
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionLabel: { fontSize: 19, fontWeight: '600', color: colors.text },
  optionLabelSelected: { color: colors.accent },
  optionWant: { fontSize: 15, lineHeight: 22, color: colors.textSoft },
  optionWantSelected: { color: colors.accent },
  pressed: { opacity: 0.75 },
  empty: { fontSize: 15, lineHeight: 23, color: colors.textSoft },

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

  changed: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: space.md,
    gap: space.sm,
  },
  changedText: { fontSize: 15, lineHeight: 23, color: colors.text },
  changedActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md },
  libraryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  libraryButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
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
  linkButton: {
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  linkButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  reset: {
    alignSelf: 'flex-start',
    paddingVertical: space.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: { fontSize: 15, fontWeight: '600', color: colors.accent },

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
