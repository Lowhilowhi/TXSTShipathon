// Your library. Everything you said yes to lands here and leaves the feed.
// Each entry carries a link to somewhere you can actually watch, read or
// listen to it right now.

import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { linkFor, savedItems } from '@/lib/recommend';
import { useAppState } from '@/lib/state';
import { colors, maxWidth, radius, space } from '@/lib/theme';

export default function LibraryScreen() {
  const { feedback, removeFeedback } = useAppState();
  const saved = savedItems(feedback);

  if (saved.length === 0) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.title}>Nothing saved yet</Text>
          <Text style={styles.subtitle}>
            Anything you say yes to moves here and leaves the list, so you never have to scroll past
            the same thing twice.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <Text style={styles.title}>
          {saved.length} saved
        </Text>
        <Text style={styles.subtitle}>Yours to come back to. Nothing here is shared anywhere.</Text>

        {saved.map((item) => {
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

              <Pressable
                onPress={() => Linking.openURL(link.url)}
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
                <Text style={styles.linkButtonText}>{link.label}</Text>
              </Pressable>

              <Pressable
                onPress={() => removeFeedback(item.id)}
                style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
                <Text style={styles.removeText}>Remove and put it back in the list</Text>
              </Pressable>
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
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: colors.text,
    marginTop: space.sm,
  },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.textSoft },
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
  linkButton: {
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  linkButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  remove: {
    alignSelf: 'flex-start',
    paddingVertical: space.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  removeText: { fontSize: 15, fontWeight: '600', color: colors.textSoft },
  pressed: { opacity: 0.75 },
});
