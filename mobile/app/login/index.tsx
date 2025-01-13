import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSessionContext } from '../SessionContext';
import { useState } from 'react';
import { Redirect } from 'expo-router';
import { useUserContext } from '../(app)/context/UserContext';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_SESSION_KEY } from '../constants';
import Background from '../(app)/components/Background';
import { SingInForm } from './SignInForm';

export default function Login() {
  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storageStr = SecureStore.getItem(STORAGE_SESSION_KEY);
      if (!storageStr) {
        setLoading(false);
        return;
      }
      const storageParsed = JSON.parse(storageStr);
      const { session, userData } = storageParsed;
      if (session) {
        sessionContext.setSession(session);
        userContext.setData(JSON.parse(userData));
      }
      setLoading(false);
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
      <SingInForm loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
});
