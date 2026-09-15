// Resource directory. Grouped by tier: campus, then county, then national.
// Tapping a row opens src/app/resource/[id].jsx, which records its acuity.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import resources from '@/data/resources.json';
import { acuityColors, acuityLabels, colors, maxWidth, radius, space } from '@/lib/theme';

// Order matters. Closest to the user first.
const TIERS = [
  {
    key: 'campus',
    label: 'On campus',
    blurb: 'Closest to you, and able to change your day to day situation quickly.',
  },
  {
    key: 'county',
    label: 'County',
    blurb: 'Legal protection, shelter, and help that is not run by the university.',
  },
  {
    key: 'national',
    label: 'National',
    blurb: 'Anonymous, open at any hour, not connected to anyone local.',
  },
];

export default function ResourcesScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <Text style={styles.intro}>
          Opening a resource does not contact anyone. It only shows you the details.
        </Text>

        {TIERS.map((tier) => {
          const entries = resources.filter((r) => r.tier === tier.key);
          return (
            <View key={tier.key} style={styles.group}>
              <Text style={styles.groupLabel}>{tier.label}</Text>
              <Text style={styles.groupBlurb}>{tier.blurb}</Text>

              {entries.map((resource) => (
                <Pressable
                  key={resource.id}
                  onPress={() => router.push(`/resource/${resource.id}`)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowName}>{resource.name}</Text>
                    <View style={[styles.tag, { borderColor: acuityColors[resource.acuity] }]}>
                      <Text style={[styles.tagText, { color: acuityColors[resource.acuity] }]}>
                        {acuityLabels[resource.acuity]}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.rowBody}>{resource.whatItDoes}</Text>
                  <Text style={styles.rowNote}>{resource.doesNotRequire}</Text>
                </Pressable>
              ))}
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
  inner: { width: '100%', maxWidth, gap: space.lg },
  intro: { fontSize: 16, lineHeight: 24, color: colors.textSoft, marginTop: space.sm },
  group: { gap: space.sm },
  groupLabel: { fontSize: 22, fontWeight: '600', color: colors.text },
  groupBlurb: { fontSize: 15, lineHeight: 22, color: colors.textSoft, marginBottom: space.xs },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.sm,
    minHeight: 88,
  },
  pressed: { opacity: 0.75 },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  rowName: { fontSize: 18, fontWeight: '600', color: colors.text, flexShrink: 1 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: space.sm, paddingVertical: 2 },
  tagText: { fontSize: 12, fontWeight: '600' },
  rowBody: { fontSize: 16, lineHeight: 24, color: colors.text },
  rowNote: { fontSize: 15, lineHeight: 22, color: colors.accent, fontStyle: 'italic' },
});
