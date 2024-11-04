import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { authorizeUser, updateMatches } from '../utils/reusableStuff';
import { useMatchContext } from '../context/MatchContext';
import { ErrorType, handleError } from '../utils/errorHandler';
import { FONT_COLOR, SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY } from '../constants';
import {
  HelmetIcon,
  HelmetLinealIcon,
  PaperIcon,
  PaperLinealIcon,
  TargetIcon,
  TargetLinealIcon,
} from '../utils/icons';
import { useJokerContext } from '../context/JokerContext';
import { useSoundContext } from '../context/SoundContext';

const getTabNameFromEvent = (eventName?: string): string | undefined => eventName?.split('-')[0];

export default function TabLayout() {
  const sessionContext = authorizeUser();
  const matchContext = useMatchContext();
  const jokerContext = useJokerContext();
  const soundContext = useSoundContext();

  const [routeName, setRouteName] = useState<string>('swipe');

  useEffect(() => {
    soundContext.playBackgroundSound();
  }, []);

  return (
    <Tabs
      initialRouteName="swipe"
      screenOptions={{
        tabBarActiveTintColor: FONT_COLOR,
        tabBarInactiveTintColor: 'rgba(0, 0, 0, .3)',
        headerShown: false,
        tabBarActiveBackgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY,
        tabBarInactiveBackgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY,
        tabBarStyle: {
          backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY,
        },
      }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = getTabNameFromEvent(e?.target);
          if (!routeName) {
            return;
          }
          setRouteName(routeName);
          switch (routeName) {
            case 'swipe':
              soundContext.playSound('click');
              break;
            case 'chats':
              soundContext.playSound('click');
              (async () => {
                try {
                  await updateMatches(sessionContext, matchContext);
                } catch (e) {
                  handleError(jokerContext, ErrorType.UPDATE_MATCHES, `${e}`);
                }
              })();
              break;
            case 'profile':
              soundContext.playSound('click');
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
          tabBarIcon: ({ color }) => {
            const Icon = routeName === 'profile' ? HelmetIcon : HelmetLinealIcon;
            return <Icon width={28} height={28} fill={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => {
            const Icon = routeName === 'swipe' ? TargetIcon : TargetLinealIcon;
            return <Icon width={28} height={28} fill={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => {
            const Icon = routeName === 'chats' ? PaperIcon : PaperLinealIcon;
            return <Icon width={28} height={28} fill={color} />;
          },
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
