import React from 'react';
import { Stack } from 'expo-router/stack';
import { ItemsContextProvider } from './context/ItemsContext';
import { useSessionContext } from '../SessionContext';
import { Redirect } from 'expo-router';

export default function Layout() {
  const sessionContext = useSessionContext();
  if (sessionContext.session === null) {
    return <Redirect href="/login" />;
  }
  return (
    <ItemsContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ItemsContextProvider>
  );
}
