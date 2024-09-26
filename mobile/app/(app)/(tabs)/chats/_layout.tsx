import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import ChatRightHeaderMenu from './components/ChatRightHeaderMenu';
import { useMatchContext } from '../../context/MatchContext';
import { BACKGROUND_COLOR } from '../../constants';

export default function Layout() {
  const matchContext = useMatchContext();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: BACKGROUND_COLOR },
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
      }}
    >
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
