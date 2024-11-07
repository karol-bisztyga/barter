import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../utils/reusableStuff';
import { useUserContext } from '../context/UserContext';

export default function Onboarding() {
  const sessionContext = useAuth();
  const userContext = useUserContext();

  const userData = userContext.data;

  if (!userData) {
    sessionContext.signOut();
    return <Redirect href="/login" />;
  }
  return <Redirect href={'onboarding/stage_1'} />;
}
