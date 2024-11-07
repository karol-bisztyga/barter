import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';
import { useSessionContext } from './SessionContext';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { convertUserData } from './(app)/db_utils/utils';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import InputWrapper from './(app)/genericComponents/InputWrapper';
import TextWrapper from './(app)/genericComponents/TextWrapper';
import { useJokerContext } from './(app)/context/JokerContext';
import { useTranslation } from 'react-i18next';
import Background from './(app)/components/Background';
import { SECTION_BACKGROUND } from './(app)/(tabs)/profile/components/items/editing_panels/constants';

export default function Register() {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const jokerContext = useJokerContext();

  const [error, setError] = useState<string>('');

  const [verificationCode, setVerificationCode] = useState('');

  const verificationCodeValid = () => {
    // only digits, only 6 signs
    return /^\d{6}$/.test(verificationCode);
  };

  const verify = async () => {
    try {
      if (!userContext.data?.email) {
        setError('Email could not be found');
        router.replace('/login');
        return null;
      }
      const response = await executeQuery('auth/verify', 'POST', null, {
        email: userContext.data?.email,
        verificationCode,
      });

      if (response.ok) {
        jokerContext.showSuccess(t('verification_successful'));
        const { result, token } = response.data;
        const newUserData = convertUserData(result);
        sessionContext.setSessionWithStorage(token, newUserData);

        userContext.setData(newUserData);
        router.replace('/');
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      setError(`${e}`);
    }
  };

  return (
    <View style={styles.container}>
      <Background tile="sword" />
      {error ? (
        <View style={styles.errorWrapper}>
          <TextWrapper key={error} style={styles.errorText}>
            {error}
          </TextWrapper>
          <ButtonWrapper
            title={t('back')}
            onPress={() => {
              sessionContext.signOut();
              router.replace('/login');
            }}
            fillColor={SECTION_BACKGROUND}
          />
        </View>
      ) : (
        <>
          <View style={styles.labelsWrapper}>
            <TextWrapper style={styles.label}>{t('verify_account_title')}</TextWrapper>
            <TextWrapper style={styles.label}>{t('verify_account_subtitle_1')}</TextWrapper>
            <TextWrapper style={styles.label}>{t('verify_account_subtitle_2')}</TextWrapper>
          </View>
          <View>
            <View style={styles.inputWrapper}>
              <InputWrapper
                placeholder={t('verify_account_code')}
                value={verificationCode}
                onChangeText={setVerificationCode}
                fillColor={SECTION_BACKGROUND}
              />
            </View>
          </View>
          <View style={styles.buttonsWrapper}>
            <ButtonWrapper
              title={t('confirm')}
              disabled={!verificationCodeValid()}
              onPress={verify}
              fillColor={SECTION_BACKGROUND}
            />
            <ButtonWrapper
              title={t('back')}
              onPress={() => {
                sessionContext.signOut();
                router.replace('/login');
              }}
              fillColor={SECTION_BACKGROUND}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  labelsWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputWrapper: {
    height: 60,
    padding: 10,
  },
  buttonsWrapper: {
    flex: 1,
    gap: 12,
    padding: 12,
  },
  label: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  errorWrapper: {
    flex: 1,
    padding: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 20,
    margin: 12,
  },
});
