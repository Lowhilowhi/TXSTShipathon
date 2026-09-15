// Home hub. Large touch targets, one decision per row.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, maxWidth, radius, space } from '@/lib/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        <Text style={styles.title}>You get to decide what happens next.</Text>
        <Text style={styles.subtitle}>
          Nothing here reports anything for you, and nothing is saved. Start wherever you want.
        </Text>

        <Pressable
          onPress={() => router.push('/resources')}
          style={({ pressed }) => [styles.card, styles.cardPrimary, pressed && styles.pressed]}>
          <Text style={styles.cardTitle}>Find help</Text>
          <Text style={styles.cardBody}>
            Campus, county, and national options. Each one says plainly what it does and what it
            does not require from you.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/mood')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Text style={styles.cardTitle}>How are you right now?</Text>
          <Text style={styles.cardBody}>
            One tap. What you pick, together with what you just looked at, decides what the app
            suggests next.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/feed')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Text style={styles.cardTitle}>What might help right now</Text>
          <Text style={styles.cardBody}>
            Something to watch or listen to, picked for where you actually are. Each one tells you
            why it was chosen.
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Nothing you do here is stored. Closing the app clears everything.
        </Text>
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
    marginTop: space.md,
  },
  subtitle: { fontSize: 17, lineHeight: 26, color: colors.textSoft, marginBottom: space.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.sm,
    minHeight: 96,
    justifyContent: 'center',
  },
  // The safety path is the one that should read first.
  cardPrimary: { borderLeftWidth: 5, borderLeftColor: colors.accent },
  pressed: { opacity: 0.75 },
  cardTitle: { fontSize: 21, fontWeight: '600', color: colors.text },
  cardBody: { fontSize: 16, lineHeight: 24, color: colors.textSoft },
  footer: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: space.md,
  },
});
