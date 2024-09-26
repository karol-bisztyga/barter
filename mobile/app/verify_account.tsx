import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';
import { useSessionContext } from './SessionContext';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { showSuccess } from './(app)/utils/notifications';
import { ErrorType, handleError } from './(app)/utils/errorHandler';
import { convertUserData } from './(app)/db_utils/utils';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import { BACKGROUND_COLOR } from './(app)/constants';
import InputWrapper from './(app)/genericComponents/InputWrapper';

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
        handleError(ErrorType.VERIFY, 'Email could not be found');
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
        const newUserData = convertUserData(result);
        sessionContext.setSessionWithStorage(token, newUserData);

        userContext.setData(newUserData);
        router.replace('/');
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      handleError(ErrorType.VERIFY, `${e}`);
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
      <InputWrapper
        placeholder="Verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        style={styles.input}
      />
      <ButtonWrapper title="Submit" disabled={!verificationCodeValid()} onPress={verify} />
      <ButtonWrapper
        title="Back"
        onPress={() => {
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
    backgroundColor: BACKGROUND_COLOR,
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
    textAlign: 'center',
  },
});
