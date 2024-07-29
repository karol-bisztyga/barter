import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

import { useSessionContext } from './SessionContext';
import { useState } from 'react';
import { router } from 'expo-router';

export default function SignIn() {
  const { signIn } = useSessionContext();
  // todo remove default values
  const [userName, setUserName] = useState('qwe123');
  const [password, setPassword] = useState('qwe123');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.inputContainer}>
        <TextInput value={userName} onChangeText={setUserName} style={styles.input} />
        <TextInput
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <View style={styles.buttonWrapper}>
          <Button
            title="Sign in"
            onPress={() => {
              // todo handle sign in
              signIn();
              router.replace('/');
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
