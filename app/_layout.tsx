// my-app/app/_layout.js

import React from 'react';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="index" options={{ title: 'Swipe' }} />
      <Tabs.Screen name="chats" options={{ title: 'Chats' }} />
    </Tabs>
  );
}
