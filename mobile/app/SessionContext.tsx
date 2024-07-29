import React, { createContext, ReactNode, FC, useContext, useEffect } from 'react';
import { useStorageState } from './useStorageState';

/**
 * this context is for storing current target items mainly for navigation
 * we store user's item id because we pull the data from userContext mostly via `findItemById`
 * othersItem - this is any foreign item, so we don't have it in other context nad we have to store the data here
 */

interface SessionContextState {
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}

const initialState: SessionContextState = {
  signIn: () => null,
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

  const signIn = () => {
    setSession('xxx');
  };

  const signOut = () => {
    setSession(null);
  };

  // todo remove this
  useEffect(() => {
    signIn();
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};
