import React, { useEffect } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

import { useSessionContext } from './SessionContext';
import { useState } from 'react';
import { router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';
import * as SecureStore from 'expo-secure-store';

import sampleUsers from './(app)/mocks/sampleUsers.json';
import { STORAGE_SESSION_KEY } from './constants';

export default function SignIn() {
  const { signIn } = useSessionContext();
  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  // todo remove default values

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const storageStr = await SecureStore.getItem(STORAGE_SESSION_KEY);
        if (!storageStr) {
          console.log('no data in storage');
          return;
        }
        const storageParsed = JSON.parse(storageStr);
        console.log('TOKEN_STORAGE_KEY', storageParsed);
        const { session, userData } = storageParsed;
        if (session) {
          sessionContext.setSession(session);
          userContext.setData(JSON.parse(userData));
          router.replace('/');
        }
      } catch (e) {
        console.error('error reading token from storage');
      }
    })();
  }, []);

  const signInEnabled = () => {
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
      userContext.setData(userData);
      router.replace('/');
    } catch (e) {
      // todo show error message
      console.error('sign in failed', e);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.inputContainer}>
        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <View style={styles.buttonWrapper}>
          <Button
            title="Sign in"
            disabled={!signInEnabled()}
            onPress={async () => {
              await hadnleSignIn(email, password);
            }}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Register"
            onPress={() => {
              console.log('register');
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
