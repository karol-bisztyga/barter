import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';
import { useSessionContext } from './SessionContext';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { showError, showSuccess } from './(app)/utils/notifications';

export default function Register() {
  const userContext = useUserContext();
  const sessionContext = useSessionContext();

  const [verificationCode, setVerificationCode] = useState('');

  const verificationCodeValid = () => {
    // only digits, only 6 signs
    return /^\d{6}$/.test(verificationCode);
  };

  const verify = async () => {
    try {
      if (!userContext.data?.email) {
        showError('Something went wrong, your email could not be found');
        router.replace('/login');
        return null;
      }
      const response = await executeQuery('auth/verify', 'POST', null, {
        email: userContext.data?.email,
        verificationCode,
      });

      if (response.ok) {
        showSuccess('verification successful');
        const { result, token } = response.data;
        sessionContext.setSessionWithStorage(token, result);
        userContext.setData(result);
        router.replace('/');
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      console.error('error verifying', e);
      showError('Verification failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelsWrapper}>
        <Text style={styles.label}>You need to verify your account</Text>
        <Text style={styles.label}>
          Please check your email for the verification code and enter it below
        </Text>
        <Text style={styles.label}>Thank you</Text>
      </View>
      <TextInput
        placeholder="Verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        style={styles.input}
      />
      <Button title="Submit" disabled={!verificationCodeValid()} onPress={verify} />
      <Button
        title="Back"
        onPress={() => {
          userContext.setData(null);
          sessionContext.signOut();
          router.replace('/login');
        }}
      />
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
  labelsWrapper: {
    margin: 20,
  },
  label: {
    margin: 5,
    textAlign: 'center',
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
});
