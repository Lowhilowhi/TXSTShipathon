// The one screen that asks, in order:
//   1. Where are you right now          -> mood
//   2. What do you want to do           -> intent
//   3. If staying in, what kind         -> format
//   4. Here is what fits, and why
//
// Each question only appears once the one above it is answered, so it is never
// a wall of choices. This screen holds no matching logic; that lives in the
// pure functions in src/lib/recommend.js.

import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import MediaCard from '@/components/media-card';
import activities from '@/data/activities.json';
import resources from '@/data/resources.json';
import { FORMAT_LABELS, recommend, supportSignal } from '@/lib/recommend';
import { useAppState } from '@/lib/state';
import { acuityColors, colors, maxWidth, radius, space } from '@/lib/theme';

const MOODS = [
  { key: 'spiraling', label: 'I cannot stop thinking', want: 'Something loud enough to drown it out' },
  { key: 'hollow', label: 'I feel empty', want: 'People being good to each other' },
  { key: 'angry', label: 'I am furious', want: 'A woman who wins' },
  { key: 'numb', label: 'I feel nothing', want: 'Something easy that asks nothing' },
];

const INTENTS = [
  { key: 'in', label: 'Nothing. I am a homebody', want: 'Give me something to watch, listen to or read' },
  { key: 'hands', label: 'Something to do with my hands', want: 'Calm, repetitive, no decisions' },
  { key: 'out', label: 'Actually get out of the house', want: 'Small plans that are easy to abandon' },
  { key: 'people', label: 'Be around people who get it', want: 'Survivor groups and peer support near you' },
];

const FORMATS = ['watch', 'listen', 'read'];

export default function RightNowScreen() {
  const router = useRouter();
  const {
    mood,
    moodHistory,
    intent,
    format,
    recentAcuity,
    feedback,
    recordMood,
    recordIntent,
    recordFormat,
    recordFeedback,
    clearFeedback,
  } = useAppState();

  const { label, items, hiddenCount, savedCount } = recommend({
    mood,
    recentAcuity,
    feedback,
    format,
  });

  const supportResources = resources.filter((r) => r.acuity === 'low');

  // Entertainment writing back into Health. Deliberately a support level
  // resource, never a high acuity one: three taps is not evidence of an
  // emergency, and treating it as one would be alarming.
  const signal = supportSignal({ moodHistory, feedback });
  const nudgeResource = supportResources[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <Text style={styles.step}>Step 1</Text>
        <Text style={styles.title}>Where are you right now?</Text>
        <View style={styles.options}>
          {MOODS.map((option) => (
            <Option
              key={option.key}
              option={option}
              selected={mood === option.key}
              onPress={() => recordMood(option.key)}
            />
          ))}
        </View>

        {mood ? (
          <>
            <Text style={styles.step}>Step 2</Text>
            <Text style={styles.title}>What do you want to do?</Text>
            <View style={styles.options}>
              {INTENTS.map((option) => (
                <Option
                  key={option.key}
                  option={option}
                  selected={intent === option.key}
                  onPress={() => recordIntent(option.key)}
                />
              ))}
            </View>
          </>
        ) : null}

        {intent === 'in' ? (
          <>
            <Text style={styles.step}>Step 3</Text>
            <Text style={styles.title}>What kind?</Text>
            <View style={styles.formatRow}>
              {FORMATS.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => recordFormat(key)}
                  style={({ pressed }) => [
                    styles.format,
                    format === key && styles.formatSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.formatText, format === key && styles.formatTextSelected]}>
                    {FORMAT_LABELS[key]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {intent === 'hands' ? (
          <SimpleList
            title="Things to do with your hands"
            blurb="None of these need anyone else, and all of them can be abandoned halfway."
            entries={activities.hands}
            renderMeta={(entry) => entry.search}
            onOpen={(entry) =>
              Linking.openURL(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(entry.search)}`
              )
            }
            openLabel="Look this up"
          />
        ) : null}

        {intent === 'out' ? (
          <SimpleList
            title="Small ways out of the house"
            blurb="Prompts, not places. Pick one and decide the where when you are already up."
            entries={activities.outing}
            renderMeta={(entry) => entry.effort}
          />
        ) : null}

        {intent === 'people' ? (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>People who get it</Text>
            <Text style={styles.groupBlurb}>
              These are the support level services from the directory. Talking to any of them starts
              no report.
            </Text>
            {supportResources.map((resource) => (
              <Pressable
                key={resource.id}
                onPress={() => router.push(`/resource/${resource.id}`)}
                style={({ pressed }) => [styles.entry, pressed && styles.pressed]}>
                <Text style={styles.entryTitle}>{resource.name}</Text>
                <Text style={styles.entryBody}>{resource.whatItDoes}</Text>
                <Text style={styles.entryMeta}>{resource.doesNotRequire}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {intent === 'in' && format ? (
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
                <View style={styles.chip}>
                  <Text style={[styles.chipText, { color: colors.textSoft }]}>{format}</Text>
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
                    ? `${savedCount} in your library. `
                    : ''}
                  {hiddenCount > 0 ? `${hiddenCount} skipped. ` : ''}
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

            {signal.triggered && nudgeResource ? (
              <View style={styles.nudge}>
                <Text style={styles.nudgeLabel}>Because of how this is going</Text>
                <Text style={styles.nudgeHeadline}>{signal.headline}</Text>
                <Text style={styles.nudgeReason}>{signal.reason}</Text>

                <Pressable
                  onPress={() => router.push(`/resource/${nudgeResource.id}`)}
                  style={({ pressed }) => [styles.nudgeCard, pressed && styles.pressed]}>
                  <Text style={styles.nudgeCardTitle}>{nudgeResource.name}</Text>
                  <Text style={styles.nudgeCardBody}>{nudgeResource.whatItDoes}</Text>
                  <Text style={styles.nudgeCardMeta}>{nudgeResource.doesNotRequire}</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/resources')}
                  style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
                  <Text style={styles.resetText}>See all the options</Text>
                </Pressable>
              </View>
            ) : null}

            {items.length === 0 ? (
              <Text style={styles.empty}>
                You have been through everything in this format. Try another one, or start the list
                over.
              </Text>
            ) : null}

            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onSave={() => recordFeedback(item.id, true)}
                onSkip={() => recordFeedback(item.id, false)}
              />
            ))}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Option({ option, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {option.label}
      </Text>
      <Text style={[styles.optionWant, selected && styles.optionWantSelected]}>{option.want}</Text>
    </Pressable>
  );
}

function SimpleList({ title, blurb, entries, renderMeta, onOpen, openLabel }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Text style={styles.groupBlurb}>{blurb}</Text>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.entry}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entryBody}>{entry.description}</Text>
          <Text style={styles.entryMeta}>{renderMeta(entry)}</Text>
          {onOpen ? (
            <Pressable
              onPress={() => onOpen(entry)}
              style={({ pressed }) => [styles.entryButton, pressed && styles.pressed]}>
              <Text style={styles.entryButtonText}>{openLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, paddingBottom: space.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth, gap: space.sm },
  step: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: space.lg,
  },
  title: { fontSize: 25, lineHeight: 33, fontWeight: '600', color: colors.text },
  empty: { fontSize: 15, lineHeight: 23, color: colors.textSoft, marginTop: space.sm },

  options: { gap: space.sm, marginTop: space.xs },
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
  optionLabel: { fontSize: 18, fontWeight: '600', color: colors.text },
  optionLabelSelected: { color: colors.accent },
  optionWant: { fontSize: 15, lineHeight: 22, color: colors.textSoft },
  optionWantSelected: { color: colors.accent },
  pressed: { opacity: 0.6 },

  formatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
  format: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  formatText: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' },
  formatTextSelected: { color: '#FFFFFF' },

  group: { gap: space.sm, marginTop: space.md },
  groupTitle: { fontSize: 22, fontWeight: '600', color: colors.text },
  groupBlurb: { fontSize: 15, lineHeight: 22, color: colors.textSoft, marginBottom: space.xs },
  entry: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.xs,
  },
  entryTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  entryBody: { fontSize: 16, lineHeight: 24, color: colors.text },
  entryMeta: { fontSize: 14, lineHeight: 21, color: colors.accent, fontStyle: 'italic' },
  entryButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius,
    paddingVertical: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: space.xs,
  },
  entryButtonText: { fontSize: 15, fontWeight: '600', color: colors.accent },

  stateBar: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius,
    padding: space.md,
    gap: space.sm,
    marginTop: space.md,
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

  // Deliberately the loudest thing on the screen. When this appears it matters
  // more than any recommendation under it.
  nudge: {
    backgroundColor: colors.noteSoft,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.note,
    padding: space.md,
    gap: space.sm,
    marginTop: space.md,
  },
  nudgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.note,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nudgeHeadline: { fontSize: 20, lineHeight: 28, fontWeight: '700', color: colors.text },
  nudgeReason: { fontSize: 15, lineHeight: 23, color: colors.text },
  nudgeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius - 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.xs,
  },
  nudgeCardTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  nudgeCardBody: { fontSize: 15, lineHeight: 23, color: colors.text },
  nudgeCardMeta: { fontSize: 14, lineHeight: 21, color: colors.accent, fontStyle: 'italic' },

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
  reset: {
    alignSelf: 'flex-start',
    paddingVertical: space.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: { fontSize: 15, fontWeight: '600', color: colors.accent },
});
