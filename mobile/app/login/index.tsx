import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSessionContext } from '../SessionContext';
import { useState } from 'react';
import { Redirect } from 'expo-router';
import { useUserContext } from '../(app)/context/UserContext';
import * as SecureStore from 'expo-secure-store';

import { STORAGE_SESSION_KEY } from '../constants';
import { BACKGROUND_COLOR } from '../(app)/constants';
import Background from '../(app)/components/Background';
import { SingInForm } from './SignInForm';

export const Loader = () => {
  return (
    <View style={styles.loaderWrapper}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default function Login() {
  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkingSession) {
      return;
    }
    setLoading(false);
  }, [checkingSession]);

  useEffect(() => {
    try {
      const storageStr = SecureStore.getItem(STORAGE_SESSION_KEY);
      if (!storageStr) {
        setCheckingSession(false);
        return;
      }
      const storageParsed = JSON.parse(storageStr);
      const { session, userData } = storageParsed;
      if (session) {
        sessionContext.setSession(session);
        userContext.setData(JSON.parse(userData));
      }
      setCheckingSession(false);
    } catch (e) {
      sessionContext.setAuthError('session seemed to be malformed, please log in again');
    }
  }, []);

  if (sessionContext.session && userContext.data) {
    return <Redirect href="/" />;
  }
  return (
    <View style={styles.container}>
      <Background tile="main" />
      {loading && <Loader />}
      <SingInForm loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  loaderWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
