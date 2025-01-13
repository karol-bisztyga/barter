import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';
import { validateEmail, validatePassword, validatePasswords } from './(app)/utils/validators';
import { executeQuery } from './(app)/db_utils/executeQuery';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import InputWrapper from './(app)/genericComponents/InputWrapper';
import TextWrapper from './(app)/genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import Background from './(app)/components/Background';
import { SECTION_BACKGROUND } from './(app)/(tabs)/profile/components/items/editing_panels/constants';
import { useFont } from './(app)/hooks/useFont';
import { capitalizeFirstLetterOfEveryWord } from './(app)/utils/reusableStuff';
import { ErrorBox } from './ErrorBox';

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'error_email_invalid',
  PASSWORD: 'error_password_incorrect',
  PASSWORDS_NOT_MATCH: 'error_passwords_do_not_match',
};

export default function Register() {
  const { t } = useTranslation();

  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const fontFamily = useFont();

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
      setError(t(ERROR_MESSAGES.INVALID_EMAIL));
    } else if (password && !validatePassword(password)) {
      setError(t(ERROR_MESSAGES.PASSWORD));
    } else if (password && passwordRepeat && !validatePasswords(password, passwordRepeat)) {
      setError(t(ERROR_MESSAGES.PASSWORDS_NOT_MATCH));
    } else {
      setError('');
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
      <Background tile="main" />
      <View style={styles.errorContainer}>
        <ErrorBox message={error} />
      </View>
      <View style={styles.inputContainer}>
        <Background tile="paper" />
        <TextWrapper style={[styles.label, { fontFamily: fontFamily.boldItalic }]}>
          {capitalizeFirstLetterOfEveryWord(t('email'))}
        </TextWrapper>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            fillColor={SECTION_BACKGROUND}
          />
        </View>
        <TextWrapper style={[styles.label, { fontFamily: fontFamily.boldItalic }]}>
          {capitalizeFirstLetterOfEveryWord(t('password'))}
        </TextWrapper>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder={t('password')}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            fillColor={SECTION_BACKGROUND}
          />
        </View>
        <TextWrapper style={[styles.label, { fontFamily: fontFamily.boldItalic }]}>
          {capitalizeFirstLetterOfEveryWord(t('repeat_password'))}
        </TextWrapper>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder={capitalizeFirstLetterOfEveryWord(t('repeat_password'))}
            secureTextEntry={true}
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            autoCapitalize="none"
            fillColor={SECTION_BACKGROUND}
          />
        </View>
        <ButtonWrapper
          title={t('confirm')}
          disabled={!formValid()}
          onPress={register}
          mode="black"
        />
        <ButtonWrapper
          title={t('cancel')}
          disabled={loading}
          onPress={async () => {
            router.replace('/login');
          }}
          mode="black"
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
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  errorContainer: {
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'column',
    padding: 10,
    gap: 8,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  label: { fontSize: 14 },
  inputWrapper: { marginVertical: 8 },
  loaderWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
