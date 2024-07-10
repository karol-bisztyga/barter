// my-app/app/_layout.js

import React from 'react';
import { Stack, Tabs } from 'expo-router';

export default function Layout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' />
        </Stack>
    );
}
