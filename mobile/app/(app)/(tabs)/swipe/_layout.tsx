import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { BACKGROUND_COLOR } from '../../constants';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: BACKGROUND_COLOR },
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="item" options={headerBackButtonOptions()} />
      <Stack.Screen name="match" />
      <Stack.Screen name="switch_item" options={headerBackButtonOptions()} />
    </Stack>
  );
}
