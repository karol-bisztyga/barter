import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { SessionContextState, useSessionContext } from '../../SessionContext';
import { getUserMatches } from '../db_utils/getUserMatches';
import { MatchContextState } from '../context/MatchContext';

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

export const authorizeUser = (): SessionContextState => {
  const sessionContext = useSessionContext();
  if (!sessionContext.session) {
    throw new Error('Unauthorized access');
  }
  return sessionContext;
};

export const updateMatches = async (
  sessionContext: SessionContextState,
  matchContext: MatchContextState
) => {
  const matchesResult = await getUserMatches(sessionContext, matchContext.localDateUpdated);
  const { matches, dateUpdated } = matchesResult;
  if (matches) {
    matchContext.setMatches(matches);
  }
  matchContext.setLocalDateUpdated(dateUpdated);
};
