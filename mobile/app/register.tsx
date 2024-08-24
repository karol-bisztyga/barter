import React, { useEffect } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';
import { validateEmail, validatePassword, validatePasswords } from './(app)/utils/validators';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { showError } from './(app)/utils/notifications';

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'email invalid',
  PASSWORD: 'password invalid, it must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'passwords do not match',
};

export default function Register() {
  const [errors, setErrors] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const formValid = () => {
    if (!email || !password || !passwordRepeat) {
      return false;
    }
    if (errors.length) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const newErrors = [];
    if (email && !validateEmail(email)) {
      newErrors.push(ERROR_MESSAGES.INVALID_EMAIL);
    }
    if (password && !validatePassword(password)) {
      newErrors.push(ERROR_MESSAGES.PASSWORD);
    }
    if (password && passwordRepeat && !validatePasswords(password, passwordRepeat)) {
      newErrors.push(ERROR_MESSAGES.PASSWORDS_NOT_MATCH);
    }
    setErrors(newErrors);
  }, [email, password, passwordRepeat]);

  const register = async () => {
    setLoading(true);
    let response;
    try {
      response = await executeQuery('auth/register', 'POST', null, { email, password });
      if (!response.ok) {
        throw new Error(response.data.message);
      }
      console.log('register response', response.data);
      router.replace('/register_success');
    } catch (e) {
      console.error('Error registering', e);
      let errorStr = 'Registering failed: ';
      if (response && response.status === 400) {
        errorStr += response.data.message;
      }
      showError(errorStr);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="repeat password"
        secureTextEntry={true}
        value={passwordRepeat}
        onChangeText={setPasswordRepeat}
        style={styles.input}
        autoCapitalize="none"
      />
      {errors.length ? (
        <View style={styles.errorWrapper}>
          {errors.map((error) => {
            return (
              <Text key={error} style={styles.errorText}>
                {error}
              </Text>
            );
          })}
        </View>
      ) : null}
      <View style={styles.buttonWrapper}>
        <Button title="Register" disabled={!formValid()} onPress={register} />
        <Button
          title="Cancel"
          disabled={loading}
          onPress={async () => {
            router.replace('/login');
          }}
        />
      </View>
      {loading && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
  errorWrapper: {
    opacity: 0.6,
    width: '100%',
    padding: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loaderWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
