import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

export const headerBackButtonOptions = {
  headerShown: true,
  headerTitle: () => <></>,
  headerBackVisible: false,
  headerLeft: () => (
    <TouchableOpacity activeOpacity={1} onPress={() => router.back()}>
      <FontAwesome size={28} name="arrow-left" />
    </TouchableOpacity>
  ),
};

export const handleUnauthorizedAccess = (condition: boolean) => {
  if (!condition) {
    throw new Error('Unauthorized access (todo redirect to login)');
  }
};
