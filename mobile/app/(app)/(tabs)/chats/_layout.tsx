import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import ChatRightHeaderMenu from './components/ChatRightHeaderMenu';

export default function Layout() {
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
          ...headerBackButtonOptions(),
          headerShown: true,
          headerRight: () => <ChatRightHeaderMenu />,
        }}
      />
      <Stack.Screen name="item" options={headerBackButtonOptions()} />
      <Stack.Screen name="send_report" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
