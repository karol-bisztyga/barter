import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import ChatRightHeaderMenu from './components/ChatRightHeaderMenu';
import { useMatchContext } from '../../context/MatchContext';
import { SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY } from '../../constants';
import Background from '../../components/Background';

export default function Layout() {
  const matchContext = useMatchContext();
  return (
    <>
      <Background tile="sword" forceFullScreen />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
          contentStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
          animation: 'none',
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
    </>
  );
}
