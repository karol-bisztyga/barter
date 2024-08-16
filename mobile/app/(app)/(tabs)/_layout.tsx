import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { authorizeUser, updateMatches } from '../utils/reusableStuff';
import { useMatchContext } from '../context/MatchContext';

export default function TabLayout() {
  const sessionContext = authorizeUser();
  const matchContext = useMatchContext();

  return (
    <Tabs
      initialRouteName="swipe"
      screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e?.target?.split('-')[0];
          console.log('tab press', routeName);
          if (!routeName) {
            return;
          }
          switch (routeName) {
            case 'swipe':
              break;
            case 'chats':
              updateMatches(sessionContext, matchContext);
              break;
            case 'profile':
              break;
            default:
              console.error('unknown route', routeName);
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="eye" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="comment" color={color} />,
        }}
      />
    </Tabs>
  );
}
