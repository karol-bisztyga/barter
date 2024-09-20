import React from 'react';
import { Stack } from 'expo-router';
import { authorizeUser } from '../utils/reusableStuff';

export default function Layout() {
  authorizeUser();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="stage_1" options={{ headerShown: false }} />
      <Stack.Screen name="stage_2" options={{ headerShown: false }} />
      <Stack.Screen name="stage_3" options={{ headerShown: false }} />
    </Stack>
  );
}
