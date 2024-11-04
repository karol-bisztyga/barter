import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY } from '../../constants';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
        contentStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="item" options={headerBackButtonOptions()} />
      <Stack.Screen name="match" />
      <Stack.Screen name="switch_item" options={headerBackButtonOptions()} />
    </Stack>
  );
}
