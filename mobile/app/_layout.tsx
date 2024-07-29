import React from 'react';
import { Slot } from 'expo-router';
import { SessionContextProvider } from './SessionContext';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionContextProvider>
      <Slot />
    </SessionContextProvider>
  );
}
