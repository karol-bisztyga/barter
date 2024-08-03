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

  const [email, setEmail] = useState(sampleUsers[0].email);
  const [password, setPassword] = useState(sampleUsers[0].password);

  const signInEnabled = () => {
    if (!email || !password) {
      return false;
    }
    // todo validate email
    // todo validate password
    return true;
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
              // todo handle sign in
              try {
                const userData = await signIn(email, password);
                if (!userData) {
                  throw new Error('user data is missing');
                }
                console.log('>>>>>>>>> setting user data', userData);
                userContext.setData(userData);
                router.replace('/');
              } catch (e) {
                // todo show error message
                console.error('sign in failed', e);
              }
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
