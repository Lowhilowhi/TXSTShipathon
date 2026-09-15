// Resource detail. Opening this screen records the resource's acuity into
// shared state, which is what later steers the recommendation engine.
//
// Every contact field except `link` is optional in src/data/resources.json,
// so each row renders only when that resource actually has it.

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import resources from '@/data/resources.json';
import { useAppState } from '@/lib/state';
import { acuityColors, acuityLabels, colors, maxWidth, radius, space } from '@/lib/theme';

function ContactRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { recordAcuity } = useAppState();
  const resource = resources.find((r) => r.id === id);

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

        {resource.note ? (
          <View style={styles.noteBlock}>
            <Text style={styles.noteLabel}>Worth knowing first</Text>
            <Text style={styles.noteBody}>{resource.note}</Text>
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.blockLabel}>Contact</Text>

          {resource.emergency ? (
            <View style={styles.emergency}>
              <Text style={styles.emergencyLabel}>In an emergency</Text>
              <Text style={styles.emergencyValue} selectable>
                {resource.emergency}
              </Text>
            </View>
          ) : null}

          <ContactRow label="Phone" value={resource.phone} />
          <ContactRow label="Also" value={resource.altPhone} />
          <ContactRow label="Email" value={resource.email} />
          <ContactRow label="Where" value={resource.location} />

          <Pressable
            onPress={() => Linking.openURL(resource.link)}
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
            <Text style={styles.linkButtonText}>Open website</Text>
          </Pressable>
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

  noteBlock: {
    backgroundColor: colors.noteSoft,
    borderRadius: radius,
    borderLeftWidth: 5,
    borderLeftColor: colors.note,
    padding: space.md,
    gap: space.xs,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.note,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteBody: { fontSize: 16, lineHeight: 25, color: colors.text },

  emergency: {
    backgroundColor: colors.background,
    borderRadius: radius - 4,
    borderLeftWidth: 5,
    borderLeftColor: acuityColors.high,
    padding: space.md,
    gap: 2,
  },
  emergencyLabel: { fontSize: 13, fontWeight: '700', color: acuityColors.high },
  emergencyValue: { fontSize: 24, fontWeight: '700', color: colors.text },

  contactRow: { gap: 2 },
  contactLabel: { fontSize: 13, color: colors.textSoft },
  contactValue: { fontSize: 17, lineHeight: 25, color: colors.text },

  linkButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius,
    paddingVertical: space.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    marginTop: space.xs,
  },
  linkButtonText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  pressed: { opacity: 0.75 },
  recorded: { fontSize: 14, lineHeight: 21, color: colors.textSoft, marginTop: space.xs },
});
