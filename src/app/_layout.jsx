// Root layout. Wraps every route in the shared in-memory state provider
// and sets up a plain stack with a calm header.

import { Stack } from 'expo-router';

import { AppStateProvider } from '@/lib/state';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Steady' }} />
        <Stack.Screen name="resources" options={{ title: 'Find help' }} />
        <Stack.Screen name="resource/[id]" options={{ title: 'Resource' }} />
        <Stack.Screen name="feed" options={{ title: 'Right now' }} />
        <Stack.Screen name="library" options={{ title: 'Your library' }} />
      </Stack>
    </AppStateProvider>
  );
}
