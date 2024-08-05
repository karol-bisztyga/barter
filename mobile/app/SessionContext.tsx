import React, { createContext, ReactNode, FC, useContext } from 'react';
import { useStorageState } from './useStorageState';
import { executeQuery } from './(app)/db_utils/executeQuery';
import { UserData } from './(app)/types';

/**
 * this context is for storing current target items mainly for navigation
 * we store user's item id because we pull the data from userContext mostly via `findItemById`
 * othersItem - this is any foreign item, so we don't have it in other context nad we have to store the data here
 */

interface SessionContextState {
  signIn: (email: string, password: string) => Promise<UserData | null>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}

const initialState: SessionContextState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signIn: (_email: string, _password: string) => new Promise(() => null),
  signOut: () => null,
  session: null,
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

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('email or password is missing');
    }

    const response = await executeQuery('auth/login', 'POST', null, { email, password });

    if (response.ok) {
      if (!response.data.token) {
        throw new Error('token is missing');
      }
      console.log('setting session', response.data.token);
      setSession(response.data.token);

      const userData: UserData = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        phone: response.data.user.phone,
        facebook: response.data.user.facebook,
        instagram: response.data.user.instagram,
        profilePicture: response.data.user.profile_picture,
      };

      return userData;
    } else {
      throw new Error('login error: ' + response.data.message);
    }
  };

  const signOut = () => {
    setSession(null);
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};
