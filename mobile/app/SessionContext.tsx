import React, { createContext, ReactNode, FC, useContext, useState } from 'react';
import { useStorageState } from './storageState';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { UserData } from './(app)/types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_SESSION_KEY } from './constants';
import { convertUserData } from './(app)/db_utils/utils';
import { useSettingsContext } from './(app)/context/SettingsContext';
import { useTranslation } from 'react-i18next';

export interface SessionContextState {
  signIn: (email: string, password: string) => Promise<UserData | null>;
  signOut: () => void;
  session?: string | null;
  setSession: (newSession: string | null) => void;
  setSessionWithStorage: (newSession?: string, userData?: UserData) => void;
  isLoading: boolean;

  authError: string;
  setAuthError: (error: string) => void;
}

const initialState: SessionContextState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signIn: (_email: string, _password: string) => new Promise(() => null),
  signOut: () => null,
  session: null,
  setSession: () => null,
  setSessionWithStorage: () => null,
  isLoading: false,

  authError: '',
  setAuthError: () => null,
};

export const SessionContext = createContext<SessionContextState | null>(initialState);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }
  return context;
};

export const SessionContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  const settingsContext = useSettingsContext();
  const [[isLoading, session], setSession] = useStorageState('session');
  const [authError, setAuthError] = useState('');

  const setSessionWithStorage = (newSession?: string, userData?: UserData) => {
    const userDataStr = JSON.stringify(userData || {});
    const storageStr = JSON.stringify({
      session: newSession || '',
      userData: userDataStr,
    });
    SecureStore.setItem(STORAGE_SESSION_KEY, storageStr);
    setSession(newSession || null);
  };

  const signIn = async (email: string, password: string) => {
    setAuthError('');
    if (!email) {
      throw new Error(t('email_missing'));
    }
    if (!password) {
      throw new Error(t('password_missing'));
    }

    const response = await executeQuery('auth/login', 'POST', null, { email, password });

    if (response.ok) {
      if (!response.data.token) {
        throw new Error(t('token_missing'));
      }

      const userData: UserData = convertUserData(response.data.user);
      await setSessionWithStorage(response.data.token, userData);

      return userData;
    } else {
      throw new Error(t('login_error', { error: response.data.message }));
    }
  };

  const signOut = async () => {
    await setSessionWithStorage();
    settingsContext.stopBackgroundSound();
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        setSessionWithStorage,
        isLoading,
        signIn,
        signOut,
        authError,
        setAuthError,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
