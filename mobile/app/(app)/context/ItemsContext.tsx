import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { ItemData } from '../types';

/**
 * this context is for storing current target items mainly for navigation
 * we store user's item id because we pull the data from userContext mostly via `findItemById`
 * othersItem - this is any foreign item, so we don't have it in other context nad we have to store the data here
 */

interface ItemsContextState {
  usersItemId: string | null;
  setUsersItemId: React.Dispatch<React.SetStateAction<string | null>>;
  usersItemsLikedByTargetItemOwner: ItemData[];
  setUsersItemsLikedByTargetItemOwner: React.Dispatch<React.SetStateAction<ItemData[]>>;
  othersItem: ItemData | null;
  setOthersItem: React.Dispatch<React.SetStateAction<ItemData | null>>;
  currentMatchId: string | null;
  setCurrentMatchId: React.Dispatch<React.SetStateAction<string | null>>;
}

const initialState: ItemsContextState = {
  usersItemId: null,
  setUsersItemId: () => {},
  usersItemsLikedByTargetItemOwner: [],
  setUsersItemsLikedByTargetItemOwner: () => {},
  othersItem: null,
  setOthersItem: () => {},
  currentMatchId: null,
  setCurrentMatchId: () => {},
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
  const [othersItem, setOthersItem] = useState<ItemData | null>(null);
  const [usersItemsLikedByTargetItemOwner, setUsersItemsLikedByTargetItemOwner] = useState<
    ItemData[]
  >([]);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  return (
    <ItemsContext.Provider
      value={{
        usersItemId,
        setUsersItemId,
        othersItem,
        setOthersItem,
        usersItemsLikedByTargetItemOwner,
        setUsersItemsLikedByTargetItemOwner,
        currentMatchId,
        setCurrentMatchId,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};
