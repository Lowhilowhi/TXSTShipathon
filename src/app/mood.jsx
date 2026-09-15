// Mood check in. Four large tappable options, no text input.
// Writes the chosen mood into shared state, where recommend.js reads it.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/lib/state';
import { colors, maxWidth, radius, space } from '@/lib/theme';

// The key must match the moods handled in src/lib/recommend.js.
const MOODS = [
  { key: 'numb', label: 'Numb', blurb: 'I cannot really feel much of anything right now.' },
  { key: 'spiraling', label: 'Spiraling', blurb: 'My thoughts keep running the same loop.' },
  { key: 'angry', label: 'Angry', blurb: 'I am furious and it has nowhere to go.' },
  { key: 'hollow', label: 'Hollow', blurb: 'Empty. Like something got scooped out.' },
];

export default function MoodScreen() {
  const router = useRouter();
  const { mood, recordMood } = useAppState();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <Text style={styles.title}>How are you right now?</Text>
        <Text style={styles.subtitle}>
          There is no wrong answer and you can change it any time. This only changes what the app
          suggests next.
        </Text>

        {MOODS.map((option) => {
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
              <Text style={styles.optionBlurb}>{option.blurb}</Text>
            </Pressable>
          );
        })}

        {mood ? (
          <Pressable
            onPress={() => router.push('/feed')}
            style={({ pressed }) => [styles.next, pressed && styles.pressed]}>
            <Text style={styles.nextText}>See what might help</Text>
          </Pressable>
        ) : null}
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
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.xs,
    minHeight: 96,
    justifyContent: 'center',
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pressed: { opacity: 0.75 },
  optionLabel: { fontSize: 24, fontWeight: '600', color: colors.text },
  optionLabelSelected: { color: colors.accent },
  optionBlurb: { fontSize: 16, lineHeight: 24, color: colors.textSoft },
  next: {
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: space.sm,
  },
  nextText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});
