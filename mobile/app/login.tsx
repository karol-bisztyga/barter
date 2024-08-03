import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

import { useSessionContext } from './SessionContext';
import { useState } from 'react';
import { router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';

import sampleUsers from './(app)/mocks/sampleUsers.json';

export default function SignIn() {
  const { signIn } = useSessionContext();
  const userContext = useUserContext();
  // todo remove default values

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <View style={styles.buttonWrapper}>
          <Button
            title="Login as a mocked user #1"
            onPress={async () => {
              await hadnleSignIn(sampleUsers[0].email, sampleUsers[0].password);
            }}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Login as a mocked user #2"
            onPress={async () => {
              await hadnleSignIn(sampleUsers[1].email, sampleUsers[1].password);
            }}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Login as a mocked user #3"
            onPress={async () => {
              await hadnleSignIn(sampleUsers[2].email, sampleUsers[2].password);
            }}
          />
        </View>
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
