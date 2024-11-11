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
    </Stack>
  );
}
