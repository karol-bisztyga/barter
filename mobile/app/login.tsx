import React, { useEffect } from 'react';
import { ActivityIndicator, Button, StyleSheet, TextInput, View } from 'react-native';

import { useSessionContext } from './SessionContext';
import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';
import * as SecureStore from 'expo-secure-store';

import sampleUsers from './(app)/mocks/sampleUsers.json';
import { STORAGE_SESSION_KEY } from './constants';
import { ErrorType, handleError } from './(app)/utils/errorHandler';

const SingInForm = () => {
  const { signIn } = useSessionContext();
  const userContext = useUserContext();

  // todo remove default values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const formValid = () => {
    if (!email || !password) {
      return false;
    }
    // todo validate email
    // todo validate password
    return true;
  };

  const hadnleSignIn = async (signInEmail: string, signInPassword: string) => {
    try {
      const userData = await signIn(signInEmail, signInPassword);
      if (!userData) {
        throw new Error('user data is missing');
      }
      userContext.setData({ ...userData });
      router.replace('/');
    } catch (e) {
      handleError(ErrorType.SIGN_IN, `${e}`);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        autoCapitalize="none"
        placeholder="password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <View style={styles.buttonWrapper}>
        <Button
          title="Sign in"
          disabled={!formValid()}
          onPress={async () => {
            await hadnleSignIn(email, password);
          }}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          title="Register"
          onPress={() => {
            router.replace('/register');
          }}
        />
      </View>
      {/* TODO remove buttons below */}
      {sampleUsers.map((user, index) => {
        if (index > 2) {
          return null;
        }
        return (
          <View style={styles.buttonWrapper} key={index}>
            <Button
              title={`Login as a mocked user #${index + 1}`}
              onPress={async () => {
                await hadnleSignIn(user.email, user.password);
              }}
            />
          </View>
        );
      })}
      {/* TODO remove buttons above */}
    </View>
  );
};

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

  useEffect(() => {
    (async () => {
      try {
        const storageStr = await SecureStore.getItem(STORAGE_SESSION_KEY);
        if (!storageStr) {
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
        handleError(ErrorType.READING_FROM_STORAGE, `${e}`);
      }
    })();
  }, []);

  if (sessionContext.session && userContext.data) {
    return <Redirect href="/" />;
  }
  return <View style={styles.container}>{checkingSession ? <Loader /> : <SingInForm />}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    padding: 10,
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 40,
    margin: 10,
    width: '80%',
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },
  loaderWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
