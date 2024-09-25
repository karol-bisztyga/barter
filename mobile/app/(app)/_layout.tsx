import React from 'react';
import { Stack } from 'expo-router/stack';
import { ItemsContextProvider } from './context/ItemsContext';
import { useSessionContext } from '../SessionContext';
import { Redirect } from 'expo-router';
import { MatchContextProvider } from './context/MatchContext';
import { useUserContext } from './context/UserContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Layout() {
  const sessionContext = useSessionContext();
  const userContext = useUserContext();

  if (sessionContext.session === null || userContext.data === null) {
    return <Redirect href="/login" />;
  }
  if (userContext.data.verificationCode) {
    return <Redirect href="/verify_account" />;
  }
  return (
    <ItemsContextProvider>
      <MatchContextProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
        {userContext.blockingLoading && (
          <View style={styles.blockingLoader}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </MatchContextProvider>
    </ItemsContextProvider>
  );
}

const styles = StyleSheet.create({
  blockingLoader: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, .7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
