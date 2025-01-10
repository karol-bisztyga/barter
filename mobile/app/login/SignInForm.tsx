import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSessionContext } from '../SessionContext';
import { useState } from 'react';
import { router } from 'expo-router';
import { useUserContext } from '../(app)/context/UserContext';

import ButtonWrapper from '../(app)/genericComponents/ButtonWrapper';
import InputWrapper from '../(app)/genericComponents/InputWrapper';
import TextWrapper from '../(app)/genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import { SECTION_BACKGROUND } from '../(app)/(tabs)/profile/components/items/editing_panels/constants';
import Settings from './Settings';
import { validateEmail, validatePassword } from '../(app)/utils/validators';
import Background from '../(app)/components/Background';
import { useFont } from '../(app)/hooks/useFont';
import { capitalizeFirstLetterOfEveryWord } from '../(app)/utils/reusableStuff';
import { ErrorBox } from '../ErrorBox';
import { translateError } from '../(app)/utils/errorHandler';

export const SingInForm = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation();

  const { signIn } = useSessionContext();
  const userContext = useUserContext();
  const sessionContext = useSessionContext();

  // todo remove default values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fontFamily = useFont();

  const formValid = () => validateEmail(email) && validatePassword(password);

  const hadnleSignIn = async (signInEmail: string, signInPassword: string) => {
    try {
      const userData = await signIn(signInEmail, signInPassword);
      if (!userData) {
        throw new Error('user data is missing');
      }
      userContext.setData({ ...userData });
      router.replace('/');
    } catch (e) {
      sessionContext.setAuthError(`${e}`);
    }
  };

  useEffect(() => {
    sessionContext.setAuthError('');
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          opacity: loading ? 0 : 1,
        },
      ]}
    >
      <ErrorBox message={translateError(t, sessionContext.authError)} />
      <View style={styles.formWrapper}>
        <Background tile="paper" />
        <TextWrapper style={[styles.label, { fontFamily: fontFamily.boldItalic }]}>
          {capitalizeFirstLetterOfEveryWord(t('email'))}
        </TextWrapper>
        <View style={{ marginVertical: 8 }}>
          <InputWrapper
            placeholder={capitalizeFirstLetterOfEveryWord(t('email'))}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            fillColor={SECTION_BACKGROUND}
          />
        </View>
        <TextWrapper style={[styles.label, { fontFamily: fontFamily.boldItalic }]}>
          {capitalizeFirstLetterOfEveryWord(t('password'))}
        </TextWrapper>

        <View style={{ marginVertical: 8 }}>
          <InputWrapper
            placeholder={capitalizeFirstLetterOfEveryWord(t('password'))}
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
            autoCapitalize="none"
            fillColor={SECTION_BACKGROUND}
          />
        </View>

        <ButtonWrapper
          title={t('sign_in')}
          disabled={!formValid()}
          onPress={async () => {
            await hadnleSignIn(email, password);
          }}
          mode="red"
          marginTop={8}
        />

        <ButtonWrapper
          title={t('register')}
          onPress={() => {
            router.replace('/register');
          }}
          mode="black"
          marginTop={8}
        />
      </View>
      <Settings />
      {/* TODO remove buttons below * /}
      {sampleUsers.map((user, index) => {
        if (index > 2) {
          return null;
        }
        return (
          <ButtonWrapper
            key={index}
            title={`Mocked user #${index + 1} login`}
            onPress={async () => {
              await hadnleSignIn(user.email, user.password);
            }}
            marginTop={8}
            mode="black"
          />
        );
      })}
      {/* TODO remove buttons above */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  formWrapper: { overflow: 'hidden', padding: 20 },
  label: { fontSize: 14 },
  inputWrapper: {
    height: 40,
  },
  errorWrapper: {
    opacity: 0.6,
    width: '100%',
    padding: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
