import React from 'react';
import { Tabs } from 'expo-router';
import { authorizeUser, updateMatches } from '../utils/reusableStuff';
import { useMatchContext } from '../context/MatchContext';
import { ErrorType, handleError } from '../utils/errorHandler';
import { BACKGROUND_COLOR, FONT_COLOR } from '../constants';
import { HelmetIcon, PaperIcon, TargetIcon } from '../utils/icons';
import { useJokerContext } from '../context/JokerContext';
import { useSoundContext } from '../context/SoundContext';

const getTabNameFromEvent = (eventName?: string): string | undefined => eventName?.split('-')[0];

export default function TabLayout() {
  const sessionContext = authorizeUser();
  const matchContext = useMatchContext();
  const jokerContext = useJokerContext();
  const soundContext = useSoundContext();

  return (
    <Tabs
      initialRouteName="swipe"
      screenOptions={{
        tabBarActiveTintColor: FONT_COLOR,
        tabBarInactiveTintColor: 'rgba(0, 0, 0, .3)',
        headerShown: false,
        tabBarActiveBackgroundColor: BACKGROUND_COLOR,
        tabBarInactiveBackgroundColor: BACKGROUND_COLOR,
        tabBarStyle: {
          backgroundColor: BACKGROUND_COLOR,
        },
      }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = getTabNameFromEvent(e?.target);
          if (!routeName) {
            return;
          }
          switch (routeName) {
            case 'swipe':
              soundContext.setOneShotSound('click');
              break;
            case 'chats':
              soundContext.setOneShotSound('click');
              (async () => {
                try {
                  await updateMatches(sessionContext, matchContext);
                } catch (e) {
                  handleError(jokerContext, ErrorType.UPDATE_MATCHES, `${e}`);
                }
              })();
              break;
            case 'profile':
              soundContext.setOneShotSound('click');
              break;
            default:
              handleError(jokerContext, ErrorType.UNKNOWN_ROUTE, `${e}`, '', false);
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
          tabBarIcon: ({ color }) => <HelmetIcon width={28} height={28} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => <TargetIcon width={28} height={28} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <PaperIcon width={28} height={28} fill={color} />,
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
