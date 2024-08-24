import React from 'react';
import { Stack } from 'expo-router/stack';
import { ItemsContextProvider } from './context/ItemsContext';
import { useSessionContext } from '../SessionContext';
import { Redirect } from 'expo-router';
import { MatchContextProvider } from './context/MatchContext';
import { useUserContext } from './context/UserContext';

export default function Layout() {
  const sessionContext = useSessionContext();
  const userContext = useUserContext();

  if (sessionContext.session === null) {
    return <Redirect href="/login" />;
  }
  if (userContext.data?.verificationCode) {
    return <Redirect href="/verify_account" />;
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
