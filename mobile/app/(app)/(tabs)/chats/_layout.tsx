import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import ChatRightHeaderMenu from './components/ChatRightHeaderMenu';
import { useMatchContext } from '../../context/MatchContext';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../../constants';
import Background from '../../components/Background';

export default function Layout() {
  const matchContext = useMatchContext();
  return (
    <>
      <Background tile="main" forceFullScreen />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR },
          animation: 'none',
          headerShadowVisible: false,
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
        <Stack.Screen name="send_report" options={headerBackButtonOptions()} />
      </Stack>
    </>
  );
}
