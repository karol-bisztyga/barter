import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { ErrorType, handleError } from '../utils/errorHandler';
import {
  GOLD_COLOR_1,
  GOLD_COLOR_3,
  TAB_BAR_BACKGROUND_COLOR,
  TAB_BAR_FONT_COLOR,
} from '../constants';
import { HelmetIcon, PaperIcon, TargetIcon } from '../utils/icons';
import { useJokerContext } from '../context/JokerContext';
import { useSettingsContext } from '../context/SettingsContext';
import { AddPictureContextProvider } from '../context/AddPictureContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useFont } from '../hooks/useFont';
import { useMatchContext } from '../context/MatchContext';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { NotificationIndicator } from './swipe/components/NotificationIndicator';
import { useSocketContext } from '../context/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_SIZE = 28;
const TAB_SHADOW_COLOR = '#5A75D4';
const TAB_BAR_HEIGHT = 65;

const ActiveIndicator = () => {
  return <View style={styles.activeIndicator} />;
};

const getTabNameFromEvent = (eventName?: string): string | undefined => eventName?.split('-')[0];

export default function TabLayout() {
  const { t } = useTranslation();

  useAuth();
  const jokerContext = useJokerContext();
  const settingsContext = useSettingsContext();
  const matchContext = useMatchContext();
  const socketContext = useSocketContext();
  const insets = useSafeAreaInsets();

  const fontFamily = useFont();

  const [routeName, setRouteName] = useState<string>('swipe');
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    settingsContext.loadSettingsFromStorage();
    settingsContext.playBackgroundSound();
    jokerContext.showRandomGreeting();
  }, []);

  useEffect(() => {
    // function to handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // console.log('App state changed', appState, nextAppState);
      if (appState !== 'inactive' && nextAppState === 'active') {
        socketContext.connect();
      } else if (nextAppState === 'background') {
        socketContext.disconnect();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AddPictureContextProvider>
      <Tabs
        initialRouteName="swipe"
        screenOptions={{
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'black',
          headerShown: false,
          tabBarActiveBackgroundColor: TAB_BAR_BACKGROUND_COLOR,
          tabBarInactiveBackgroundColor: TAB_BAR_BACKGROUND_COLOR,
          tabBarStyle: {
            backgroundColor: TAB_BAR_BACKGROUND_COLOR,
            height: TAB_BAR_HEIGHT + insets.bottom,
            alignItems: 'center',
            justifyContent: 'center',
            borderTopWidth: 0,
            shadowColor: GOLD_COLOR_1,
            shadowOpacity: 0.5,
            shadowRadius: 12,
          },
          tabBarLabelStyle: {
            fontFamily: fontFamily.regular,
            color: TAB_BAR_FONT_COLOR,
            fontSize: 12,
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
              const isTabActive = routeName === 'profile';
              return (
                <View style={styles.iconWrapper}>
                  {isTabActive && <ActiveIndicator />}
                  <HelmetIcon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    fill={color}
                    style={isTabActive ? styles.shadowStyle : {}}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="swipe"
          options={{
            title: t('tab_swipe_title'),
            tabBarIcon: ({ color }) => {
              const isTabActive = routeName === 'swipe';
              return (
                <View style={styles.iconWrapper}>
                  {isTabActive && <ActiveIndicator />}
                  <TargetIcon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    fill={color}
                    style={isTabActive ? styles.shadowStyle : {}}
                  />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: t('tab_chats_title'),
            tabBarIcon: ({ color }) => {
              const isTabActive = routeName === 'chats';
              const outdatedMatchesExist: boolean =
                !!matchContext.matchesWithNotificationsIds.length;
              return (
                <View style={styles.iconWrapper}>
                  {isTabActive && <ActiveIndicator />}
                  <PaperIcon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    fill={color}
                    style={isTabActive ? styles.shadowStyle : {}}
                  />
                  {outdatedMatchesExist && (
                    <NotificationIndicator iconSize={ICON_SIZE} mode="tabbar" />
                  )}
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

const styles = StyleSheet.create({
  shadowStyle: {
    shadowColor: TAB_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: ICON_SIZE,
    height: 2,
    backgroundColor: GOLD_COLOR_3,
    shadowColor: GOLD_COLOR_3,
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
