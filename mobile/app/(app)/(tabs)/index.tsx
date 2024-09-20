import { Redirect } from 'expo-router';
import React from 'react';
import { useUserContext } from '../context/UserContext';
import { authorizeUser } from '../utils/reusableStuff';

export default function Index() {
  authorizeUser();
  const userContext = useUserContext();
  const userData = userContext.data;
  if (!userData) {
    return <Redirect href="/login" />;
  }
  if (!userData.onboarded) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/swipe" />;
  return null;
}
