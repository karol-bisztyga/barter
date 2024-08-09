import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="item" options={headerBackButtonOptions()} />
      <Stack.Screen name="match" />
      <Stack.Screen name="switch_item" options={headerBackButtonOptions()} />
    </Stack>
  );
}
