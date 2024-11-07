import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSessionContext } from './SessionContext';
import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { useUserContext } from './(app)/context/UserContext';
import * as SecureStore from 'expo-secure-store';

import { STORAGE_SESSION_KEY } from './constants';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import { BACKGROUND_COLOR } from './(app)/constants';
import InputWrapper from './(app)/genericComponents/InputWrapper';
import TextWrapper from './(app)/genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import Background from './(app)/components/Background';
import { SECTION_BACKGROUND } from './(app)/(tabs)/profile/components/items/editing_panels/constants';

const sampleUsers = [
  {
    name: 'Testowy Pierwszy',
    email: 'testowypierwszy@gmail.com',
    phone: '123456789',
    facebook: null,
    instagram: 'testowyyy11',
    profilePicture: 'https://f003.backblazeb2.com/file/profile-pictures-wymianka/profile-pic-1.jpg',
    password: 'testowehaslo111',
    location_coordinate_lat: '50.067570',
    location_coordinate_lon: '19.917868',
    location_city: 'Krakow',
    id: 1,
  },
  {
    name: 'Testowy Drugi',
    email: 'testowydrugi@gmail.com',
    phone: '987654321',
    facebook: 'tojatestowy2',
    instagram: 'testowy22',
    profilePicture: null,
    password: 'testowehaslo222',
    location_coordinate_lat: '50.066331',
    location_coordinate_lon: '19.928390',
    location_city: 'Krakow',
    id: 2,
  },
  {
    name: 'Testowy Trzeci',
    email: 'testowytrzeci@gmail.com',
    phone: '111222333',
    facebook: null,
    instagram: null,
    profilePicture: 'https://f003.backblazeb2.com/file/profile-pictures-wymianka/profile-pic-3.jpg',
    password: 'testowehaslo333',
    location_coordinate_lat: '50.067143',
    location_coordinate_lon: '20.052357',
    location_city: 'Krakow',
    id: 3,
  },
  {
    name: 'Testowy Czwarty',
    email: 'testowyczwarty@gmail.com',
    phone: '444555666',
    facebook: 'testowyy4',
    instagram: 'testowy44',
    profilePicture: null,
    password: 'testowehaslo444',
    id: 4,
  },
  {
    name: 'Testowy Piąty',
    email: 'testowypiaty@gmail.com',
    phone: '777333999',
    facebook: null,
    instagram: 'testowy55555',
    profilePicture: 'https://f003.backblazeb2.com/file/profile-pictures-wymianka/profile-pic-5.jpg',
    password: 'testowehaslo555',
    location_city: 'Krakow',
    id: 5,
  },
  {
    name: 'Karol B',
    email: 'karolbisztyga@gmail.com',
    phone: '000000000',
    facebook: null,
    instagram: null,
    profilePicture: null,
    password: 'admin123456',
    id: 6,
  },
];

const SingInForm = ({ loading }: { loading: boolean }) => {
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
        styles.inputContainer,
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
    </View>
  );
};

export const Loader = () => {
  return (
    <View style={styles.loaderWrapper}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default function Login() {
  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkingSession) {
      return;
    }
    setLoading(false);
  }, [checkingSession]);

  useEffect(() => {
    try {
      const storageStr = SecureStore.getItem(STORAGE_SESSION_KEY);
      if (!storageStr) {
        setCheckingSession(false);
        return;
      }
      const storageParsed = JSON.parse(storageStr);
      const { session, userData } = storageParsed;
      if (session) {
        sessionContext.setSession(session);
        userContext.setData(JSON.parse(userData));
      }
      setCheckingSession(false);
    } catch (e) {
      sessionContext.setAuthError('session seemed to be malformed, please log in again');
    }
  }, []);

  if (sessionContext.session && userContext.data) {
    return <Redirect href="/" />;
  }
  return (
    <View style={styles.container}>
      <Background tile="sword" />
      {loading && <Loader />}
      <SingInForm loading={loading} />
      {/* todo add language choose here */}
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
    height: 40,
  },
  loaderWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
});
