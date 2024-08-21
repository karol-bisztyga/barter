import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { authorizeUser, updateMatches } from '../utils/reusableStuff';
import { useMatchContext } from '../context/MatchContext';
import { showError } from '../utils/notifications';

const getTabNameFromEvent = (eventName?: string): string | undefined => eventName?.split('-')[0];

export default function TabLayout() {
  const sessionContext = authorizeUser();
  const matchContext = useMatchContext();

  return (
    <Tabs
      initialRouteName="swipe"
      screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = getTabNameFromEvent(e?.target);
          if (!routeName) {
            return;
          }
          switch (routeName) {
            case 'swipe':
              break;
            case 'chats':
              (async () => {
                try {
                  await updateMatches(sessionContext, matchContext);
                } catch (e) {
                  if (!`${e}`.includes('Invalid token')) {
                    showError('error updating matches');
                  }
                  console.error('error updating matches', e);
                }
              })();
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
          /**
           * todo this is a fix for this case:
           *  when an item is deleted and a chat for this item is openend in the chat tab, the chat tab should be reset or navigated to the chat root view
           * the solution here is to unmount chats everytime what may be annoying if we want to have one chat open and jump between tabs
           * idk if closing and opening the socket connection is better than keeping it on all the time also
           *
           * this goes a bit beyond MVP so leaving it as a TODO, the bug is fixed for now
           */
          unmountOnBlur: true,
        }}
      />
    </Tabs>
  );
}
