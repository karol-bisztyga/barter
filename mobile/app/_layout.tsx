import React from 'react';
import { Slot } from 'expo-router';
import { SessionContextProvider } from './SessionContext';
import { UserContextProvider } from './(app)/context/UserContext';
import { MenuProvider } from 'react-native-popup-menu';
import { JokerContextProvider } from './(app)/context/JokerContext';
import { SettingsContextProvider } from './(app)/context/SettingsContext';

import '../i18n';
import { SocketContextProvider } from './(app)/context/SocketContext';
import { MatchContextProvider } from './(app)/context/MatchContext';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <JokerContextProvider>
      <SettingsContextProvider>
        <SessionContextProvider>
          <UserContextProvider>
            <MatchContextProvider>
              <SocketContextProvider>
                <MenuProvider>
                  <Slot />
                </MenuProvider>
              </SocketContextProvider>
            </MatchContextProvider>
          </UserContextProvider>
        </SessionContextProvider>
      </SettingsContextProvider>
    </JokerContextProvider>
  );
}
