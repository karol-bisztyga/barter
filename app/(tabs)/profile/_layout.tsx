import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: '' }} />
      <Stack.Screen name="item" options={headerBackButtonOptions} />
      <Stack.Screen name="addItem" options={headerBackButtonOptions} />
    </Stack>
  );
}
