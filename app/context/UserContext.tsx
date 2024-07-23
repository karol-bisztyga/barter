import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { Card, UserData } from '../types';

interface UserContextState {
  data: UserData | null;
  setData: React.Dispatch<React.SetStateAction<UserData | null>>;
  profilePic: string;
  setProfilePic: React.Dispatch<React.SetStateAction<string>>;
  items: Array<Card>;
  setItems: React.Dispatch<React.SetStateAction<Array<Card>>>;
}

const initialState: UserContextState = {
  data: null,
  setData: () => {},
  profilePic: '',
  setProfilePic: () => {},
  items: [],
  setItems: () => {},
};

export const UserContext = createContext<UserContextState | null>(initialState);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

export const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<UserData | null>(null);
  const [profilePic, setProfilePic] = useState<string>('');
  const [items, setItems] = useState<Array<Card>>([]);

  return (
    <UserContext.Provider value={{ data, setData, profilePic, setProfilePic, items, setItems }}>
      {children}
    </UserContext.Provider>
  );
};
