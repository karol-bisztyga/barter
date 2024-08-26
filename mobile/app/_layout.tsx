import React from 'react';
import { Slot } from 'expo-router';
import { SessionContextProvider } from './SessionContext';
import { UserContextProvider } from './(app)/context/UserContext';
import DropdownAlert, { DropdownAlertData } from 'react-native-dropdownalert';
import { MenuProvider } from 'react-native-popup-menu';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export let showAlert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>((res) => res);

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionContextProvider>
      <UserContextProvider>
        <MenuProvider>
          <Slot />
          <DropdownAlert alert={(func) => (showAlert = func)} />
        </MenuProvider>
      </UserContextProvider>
    </SessionContextProvider>
  );
}
