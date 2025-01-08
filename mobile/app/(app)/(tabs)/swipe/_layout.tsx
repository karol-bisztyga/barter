import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../../constants';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR },
        animation: 'none',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="item" options={headerBackButtonOptions()} />
      <Stack.Screen name="match" />
      <Stack.Screen name="switch_item" options={headerBackButtonOptions()} />
    </Stack>
  );
}
