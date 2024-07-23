import React from 'react';
import { Stack } from 'expo-router/stack';
import { ItemsContextProvider } from './context/ItemsContext';
import { UserContextProvider } from './context/UserContext';

export default function Layout() {
  return (
    <UserContextProvider>
      <ItemsContextProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ItemsContextProvider>
    </UserContextProvider>
  );
}
