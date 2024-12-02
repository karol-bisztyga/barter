import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
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
import { useSettingsContext } from '../context/SettingsContext';
import { AddPictureContextProvider } from '../context/AddPictureContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useFont } from '../hooks/useFont';
import { View } from 'react-native';
import { useMatchContext } from '../context/MatchContext';
import { NotificationIndicator } from './swipe/components/NotificationIndicator';

const ICON_SIZE = 28;

const getTabNameFromEvent = (eventName?: string): string | undefined => eventName?.split('-')[0];

export default function TabLayout() {
  const { t } = useTranslation();

  useAuth();
  const jokerContext = useJokerContext();
  const settingsContext = useSettingsContext();
  const matchContext = useMatchContext();

  const fontFamily = useFont();

  const [routeName, setRouteName] = useState<string>('swipe');

  useEffect(() => {
    settingsContext.loadSettingsFromStorage();
    settingsContext.playBackgroundSound();
    jokerContext.showRandomGreeting();
  }, []);

  return (
    <AddPictureContextProvider>
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
            shadowColor: 'transparent',
          },
          tabBarLabelStyle: { fontFamily },
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
                settingsContext.playSound('click');
                break;
              case 'chats':
                settingsContext.playSound('click');
                break;
              case 'profile':
                settingsContext.playSound('click');
                break;
              default:
                handleError(t, jokerContext, ErrorType.UNKNOWN_ROUTE, `${e}`, '', false);
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
            title: t('tab_profile_title'),
            tabBarIcon: ({ color }) => {
              const Icon = routeName === 'profile' ? HelmetIcon : HelmetLinealIcon;
              return <Icon width={ICON_SIZE} height={ICON_SIZE} fill={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="swipe"
          options={{
            title: t('tab_swipe_title'),
            tabBarIcon: ({ color }) => {
              const Icon = routeName === 'swipe' ? TargetIcon : TargetLinealIcon;
              return <Icon width={ICON_SIZE} height={ICON_SIZE} fill={color} />;
            },
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: t('tab_chats_title'),
            tabBarIcon: ({ color }) => {
              const Icon = routeName === 'chats' ? PaperIcon : PaperLinealIcon;
              const outdatedMatchesExist: boolean =
                !!matchContext.matchesWithNotificationsIds.length;
              return (
                <View>
                  <Icon width={ICON_SIZE} height={ICON_SIZE} fill={color} />
                  {outdatedMatchesExist && <NotificationIndicator iconSize={ICON_SIZE} />}
                </View>
              );
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
    </AddPictureContextProvider>
  );
}
