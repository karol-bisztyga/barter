// my-app/app/_layout.js

import React from 'react';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs initialRouteName='swipe' screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
      <Tabs.Screen name="swipe" options={{ headerShown: false }} />
      <Tabs.Screen name="chats" options={{ headerShown: false }} />
    </Tabs>
  );
}
