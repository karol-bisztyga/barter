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
import { ErrorBox } from './ErrorBox';
import { translateError } from './(app)/utils/errorHandler';

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
      <Background tile="main" />
      <View style={styles.errorContainer}>
        <ErrorBox message={translateError(t, error)} />
      </View>
      <View style={styles.innerContainer}>
        <Background tile="paper" />
        <View style={styles.labelsWrapper}>
          <TextWrapper style={styles.label}>{t('verify_account_title')}</TextWrapper>
          <TextWrapper style={styles.label}>{t('verify_account_subtitle_1')}</TextWrapper>
          <TextWrapper style={styles.label}>{t('verify_account_subtitle_2')}</TextWrapper>
        </View>
        <View style={styles.inputsWrapper}>
          <InputWrapper
            placeholder={t('verify_account_code')}
            value={verificationCode}
            onChangeText={setVerificationCode}
            fillColor={SECTION_BACKGROUND}
          />
        </View>
        <View style={styles.buttonsWrapper}>
          <ButtonWrapper
            title={t('confirm')}
            disabled={!verificationCodeValid()}
            onPress={verify}
            mode="black"
          />
          <ButtonWrapper
            title={t('back')}
            onPress={() => {
              sessionContext.signOut();
              router.replace('/login');
            }}
            mode="red"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  innerContainer: {
    flexDirection: 'column',
    padding: 10,
    gap: 8,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  errorContainer: {
    marginHorizontal: 20,
  },
  labelsWrapper: {
    justifyContent: 'flex-end',
  },
  inputsWrapper: {
    marginVertical: 8,
  },
  buttonsWrapper: {
    gap: 12,
    marginTop: 8,
  },
  label: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
});
