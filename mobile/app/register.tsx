import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';
import { validateEmail, validatePassword, validatePasswords } from './(app)/utils/validators';
import { executeQuery } from './(app)/db_utils/executeQuery';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import { BACKGROUND_COLOR } from './(app)/constants';
import InputWrapper from './(app)/genericComponents/InputWrapper';
import TextWrapper from './(app)/genericComponents/TextWrapper';

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'email invalid',
  PASSWORD: 'password invalid, it must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'passwords do not match',
};

export default function Register() {
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const formValid = () => {
    if (!email || !password || !passwordRepeat) {
      return false;
    }
    if (error) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (email && !validateEmail(email)) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
    } else if (password && !validatePassword(password)) {
      setError(ERROR_MESSAGES.PASSWORD);
    } else if (password && passwordRepeat && !validatePasswords(password, passwordRepeat)) {
      setError(ERROR_MESSAGES.PASSWORDS_NOT_MATCH);
    }
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
      let errorStr = 'Registering failed: ';
      if (response && response.status === 400) {
        errorStr += response.data.message;
      }
      setError(errorStr);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder="email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            fillColor="white"
          />
        </View>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder="password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            fillColor="white"
          />
        </View>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder="repeat password"
            secureTextEntry={true}
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            autoCapitalize="none"
            fillColor="white"
          />
        </View>
        {error && (
          <View style={styles.errorWrapper}>
            <TextWrapper key={error} style={styles.errorText}>
              {error}
            </TextWrapper>
          </View>
        )}
        <ButtonWrapper
          title="Register"
          disabled={!formValid()}
          onPress={register}
          fillColor="white"
        />
        <ButtonWrapper
          title="Cancel"
          disabled={loading}
          onPress={async () => {
            router.replace('/login');
          }}
          fillColor="white"
        />
        {loading && (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
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
  inputContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    position: 'absolute',
    width: '100%',
    gap: 8,
  },
  inputWrapper: {
    backgroundColor: 'red',
    height: 40,
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
