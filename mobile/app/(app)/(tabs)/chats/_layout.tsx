import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import ChatRightHeaderMenu from './components/ChatRightHeaderMenu';
import { useMatchContext } from '../../context/MatchContext';

export default function Layout() {
  const matchContext = useMatchContext();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          ...headerBackButtonOptions(undefined, matchContext.unmatching),
          headerShown: true,
          headerRight: () => <ChatRightHeaderMenu />,
        }}
      />
      <Stack.Screen name="item" options={headerBackButtonOptions()} />
      <Stack.Screen name="send_report" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
