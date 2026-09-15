// Resource detail. Opening this screen records the resource's acuity into
// shared state, which is what later steers the recommendation engine.

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import resourceData from '@/data/resources.json';
import { useAppState } from '@/lib/state';
import { acuityColors, acuityLabels, colors, maxWidth, radius, space } from '@/lib/theme';

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { recordAcuity } = useAppState();
  const resource = resourceData.resources.find((r) => r.id === id);

  // Record once per mount. The ref stops React's double invoked dev effect
  // from logging the same view twice.
  const recorded = useRef(false);
  useEffect(() => {
    if (resource && !recorded.current) {
      recorded.current = true;
      recordAcuity(resource.acuity);
    }
  }, [resource, recordAcuity]);

  if (!resource) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>No resource found for id "{String(id)}".</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={[styles.tag, { borderColor: acuityColors[resource.acuity] }]}>
          <Text style={[styles.tagText, { color: acuityColors[resource.acuity] }]}>
            {acuityLabels[resource.acuity]}
          </Text>
        </View>

        <Text style={styles.name}>{resource.name}</Text>

        <View style={styles.block}>
          <Text style={styles.blockLabel}>What it does</Text>
          <Text style={styles.blockBody}>{resource.whatItDoes}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockLabel}>What it does not require</Text>
          <Text style={styles.blockBody}>{resource.doesNotRequire}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockLabel}>Contact</Text>
          <Text style={styles.contact} selectable>
            {resource.phone}
          </Text>
          <Pressable
            onPress={() => Linking.openURL(resource.link)}
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
            <Text style={styles.linkButtonText}>Open website</Text>
          </Pressable>
          <Text style={styles.placeholderNote}>
            Placeholder contact details. Real numbers and links go into
            src/data/resources.json.
          </Text>
        </View>

        <Text style={styles.recorded}>
          Noted that you looked at a {resource.acuity} acuity resource. That is used to pick what
          the app suggests later. Nothing was sent anywhere.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, paddingBottom: space.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth, gap: space.md },
  missing: { padding: space.lg, fontSize: 17, color: colors.text },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    marginTop: space.sm,
  },
  tagText: { fontSize: 12, fontWeight: '600' },
  name: { fontSize: 28, lineHeight: 36, fontWeight: '600', color: colors.text },
  block: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.sm,
  },
  blockLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blockBody: { fontSize: 17, lineHeight: 26, color: colors.text },
  contact: { fontSize: 17, color: colors.text },
  linkButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  linkButtonText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  pressed: { opacity: 0.75 },
  placeholderNote: { fontSize: 13, lineHeight: 20, color: colors.textSoft },
  recorded: { fontSize: 14, lineHeight: 21, color: colors.textSoft, marginTop: space.xs },
});
