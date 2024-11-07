import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../utils/reusableStuff';

export default function Onboarding() {
  useAuth();

  return <Redirect href={'onboarding/stage_1'} />;
}
