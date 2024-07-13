import React from 'react';
import { Stack } from 'expo-router/stack';
import { ItemsContextProvider } from './context/ItemsContext';

export default function Layout() {
  return (
    <ItemsContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ItemsContextProvider>
  );
}
