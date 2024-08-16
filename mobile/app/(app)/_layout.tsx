import React from 'react';
import { Stack } from 'expo-router/stack';
import { ItemsContextProvider } from './context/ItemsContext';
import { useSessionContext } from '../SessionContext';
import { Redirect } from 'expo-router';
import { MatchContextProvider } from './context/MatchContext';

export default function Layout() {
  const sessionContext = useSessionContext();
  if (sessionContext.session === null) {
    return <Redirect href="/login" />;
  }
  return (
    <ItemsContextProvider>
      <MatchContextProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </MatchContextProvider>
    </ItemsContextProvider>
  );
}
