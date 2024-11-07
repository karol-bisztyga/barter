import { Redirect } from 'expo-router';
import React from 'react';
import { useUserContext } from '../context/UserContext';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  useAuth();
  const userContext = useUserContext();
  const userData = userContext.data;
  if (!userData) {
    return <Redirect href="/login" />;
  }
  if (!userData.onboarded) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/swipe" />;
}
