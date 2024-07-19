import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: '' }} />
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
    </Stack>
  );
}
