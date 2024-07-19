import React from 'react';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="item"
        options={{
          headerShown: true,
          headerTitle: () => <></>,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity activeOpacity={1} onPress={() => router.back()}>
              <FontAwesome size={28} name="arrow-left" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="match" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
