import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useSessionContext } from '../../SessionContext';

export const headerBackButtonOptions = (beforeCallback?: () => Promise<boolean>) => {
  return {
    headerShown: true,
    headerTitle: () => <></>,
    headerBackVisible: false,
    headerLeft: () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={async () => {
          if (beforeCallback && !(await beforeCallback())) {
            return;
          }
          router.back();
        }}
      >
        <FontAwesome size={28} name="arrow-left" />
      </TouchableOpacity>
    ),
  };
};

export const handleUnauthorizedAccess = (condition: boolean) => {
  if (!condition) {
    throw new Error('Unauthorized access (todo redirect to login)');
  }
};

export const authorizeUser = (): string => {
  const session = useSessionContext().session;
  if (!session) {
    throw new Error('Unauthorized access');
  }
  return session;
};
