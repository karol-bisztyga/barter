import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { Card } from '../types';

interface ItemsContextState {
  usersItem: Card | null;
  setUsersItem: React.Dispatch<React.SetStateAction<Card | null>>;
  othersItem: Card | null;
  setOthersItem: React.Dispatch<React.SetStateAction<Card | null>>;
}

const initialState: ItemsContextState = {
  usersItem: null,
  setUsersItem: () => {},
  othersItem: null,
  setOthersItem: () => {},
};

export const ItemsContext = createContext<ItemsContextState | null>(initialState);

export const useItemsContext = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItemsContext must be used within a ItemsContextProvider');
  }
  return context;
};

export const ItemsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [usersItem, setUsersItem] = useState<Card | null>(null);
  const [othersItem, setOthersItem] = useState<Card | null>(null);

  return (
    <ItemsContext.Provider value={{ usersItem, setUsersItem, othersItem, setOthersItem }}>
      {children}
    </ItemsContext.Provider>
  );
};
