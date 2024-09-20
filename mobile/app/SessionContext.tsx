import React, { createContext, ReactNode, FC, useContext } from 'react';
import { useStorageState } from './storageState';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { UserData } from './(app)/types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_SESSION_KEY } from './constants';

export interface SessionContextState {
  signIn: (email: string, password: string) => Promise<UserData | null>;
  signOut: () => void;
  session?: string | null;
  setSession: (newSession: string | null) => void;
  setSessionWithStorage: (newSession?: string, userData?: UserData) => void;
  isLoading: boolean;
}

const initialState: SessionContextState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signIn: (_email: string, _password: string) => new Promise(() => null),
  signOut: () => null,
  session: null,
  setSession: () => null,
  setSessionWithStorage: () => null,
  isLoading: false,
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
  const [[isLoading, session], setSession] = useStorageState('session');

  const setSessionWithStorage = async (newSession?: string, userData?: UserData) => {
    const userDataStr = JSON.stringify(userData || {});
    const storageStr = JSON.stringify({
      session: newSession || '',
      userData: userDataStr,
    });
    await SecureStore.setItem(STORAGE_SESSION_KEY, storageStr);
    setSession(newSession || null);
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('email or password is missing');
    }

    const response = await executeQuery('auth/login', 'POST', null, { email, password });

    if (response.ok) {
      if (!response.data.token) {
        throw new Error('token is missing');
      }

      const userData: UserData = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        phone: response.data.user.phone,
        facebook: response.data.user.facebook,
        instagram: response.data.user.instagram,
        profilePicture: response.data.user.profile_picture,
        location: response.data.user.location,
        verificationCode: response.data.user.verification_code,
        onboarded: response.data.user.onboarded,
      };
      await setSessionWithStorage(response.data.token, userData);

      return userData;
    } else {
      throw new Error('login error: ' + response.data.message);
    }
  };

  const signOut = async () => {
    await setSessionWithStorage();
  };

  return (
    <SessionContext.Provider
      value={{ session, setSession, setSessionWithStorage, isLoading, signIn, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
};
