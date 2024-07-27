import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { EditImageContextProvider } from '../../context/EditImageContext';

export default function Layout() {
  return (
    <EditImageContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: '' }} />
        <Stack.Screen name="item" options={headerBackButtonOptions} />
        <Stack.Screen name="editItem" options={headerBackButtonOptions} />
        <Stack.Screen name="addPicture" options={headerBackButtonOptions} />
      </Stack>
    </EditImageContextProvider>
  );
}
