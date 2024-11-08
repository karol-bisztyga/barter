import React from 'react';
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
import sampleUsers from './sampleUsers.json';
import Settings from './Settings';

export const SingInForm = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation();

  const { signIn } = useSessionContext();
  const userContext = useUserContext();
  const sessionContext = useSessionContext();

  // todo remove default values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const formValid = () => {
    if (!email || !password) {
      return false;
    }
    // todo validate email
    // todo validate password
    return true;
  };

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

  return (
    <View
      style={[
        styles.container,
        {
          opacity: loading ? 0 : 1,
        },
      ]}
    >
      <View style={styles.inputWrapper}>
        <InputWrapper
          placeholder={t('email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          fillColor={SECTION_BACKGROUND}
        />
      </View>
      <View style={styles.inputWrapper}>
        <InputWrapper
          autoCapitalize="none"
          placeholder={t('password')}
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          fillColor={SECTION_BACKGROUND}
        />
      </View>
      {sessionContext.authError && (
        <View style={styles.errorWrapper}>
          <TextWrapper key={sessionContext.authError} style={styles.errorText}>
            {sessionContext.authError}
          </TextWrapper>
        </View>
      )}
      <ButtonWrapper
        title={t('sign_in')}
        disabled={!formValid()}
        onPress={async () => {
          await hadnleSignIn(email, password);
        }}
        fillColor={SECTION_BACKGROUND}
      />
      <ButtonWrapper
        title={t('register')}
        onPress={() => {
          router.replace('/register');
        }}
        fillColor={SECTION_BACKGROUND}
      />
      {/* TODO remove buttons below */}
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
            fillColor={SECTION_BACKGROUND}
          />
        );
      })}
      {/* TODO remove buttons above */}
      <Settings />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    position: 'absolute',
    width: '100%',
    gap: 8,
  },
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
