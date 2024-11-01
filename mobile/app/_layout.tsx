import React from 'react';
import { Slot } from 'expo-router';
import { SessionContextProvider } from './SessionContext';
import { UserContextProvider } from './(app)/context/UserContext';
import { MenuProvider } from 'react-native-popup-menu';
import { JokerContextProvider } from './(app)/context/JokerContext';
import { SoundContextProvider } from './(app)/context/SoundContext';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <JokerContextProvider>
      <SessionContextProvider>
        <UserContextProvider>
          <SoundContextProvider>
            <MenuProvider>
              <Slot />
            </MenuProvider>
          </SoundContextProvider>
        </UserContextProvider>
      </SessionContextProvider>
    </JokerContextProvider>
  );
}
