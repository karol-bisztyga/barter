import React from 'react';
import { Stack } from 'expo-router';
import { BACKGROUND_COLOR } from '../constants';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  useAuth();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
        animation: 'none',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="stage_1" options={{ headerShown: false }} />
      <Stack.Screen name="stage_2" options={{ headerShown: false }} />
      <Stack.Screen name="stage_3" options={{ headerShown: false }} />
    </Stack>
  );
}
