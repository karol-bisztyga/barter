import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { Card } from '../types';

/**
 * this context is for storing current target items mainly for navigation
 * we store user's item id because we pull the data from userContext mostly via `findItemById`
 * othersItem - this is any foreign item, so we don't have it in other context nad we have to store the data here
 */

interface ItemsContextState {
  usersItemId: string | null;
  setUsersItemId: React.Dispatch<React.SetStateAction<string | null>>;
  othersItem: Card | null;
  setOthersItem: React.Dispatch<React.SetStateAction<Card | null>>;
}

const initialState: ItemsContextState = {
  usersItemId: null,
  setUsersItemId: () => {},
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
  const [usersItemId, setUsersItemId] = useState<string | null>(null);
  const [othersItem, setOthersItem] = useState<Card | null>(null);

  return (
    <ItemsContext.Provider value={{ usersItemId, setUsersItemId, othersItem, setOthersItem }}>
      {children}
    </ItemsContext.Provider>
  );
};
