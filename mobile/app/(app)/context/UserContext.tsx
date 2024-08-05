import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { ItemData, UserData } from '../types';

interface UserContextState {
  data: UserData | null;
  setData: React.Dispatch<React.SetStateAction<UserData | null>>;
  items: Array<ItemData>;
  setItems: React.Dispatch<React.SetStateAction<Array<ItemData>>>;
  findItemById: (id: string | null) => { item: ItemData; index: number } | null;
}

const initialState: UserContextState = {
  data: null,
  setData: () => {},
  items: [],
  setItems: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findItemById: (_: string | null) => {
    return null;
  },
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
  const [items, setItems] = useState<Array<ItemData>>([]);

  const findItemById = (id: string | null): { item: ItemData; index: number } | null => {
    if (!id) {
      return null;
    }
    let itemIndex = null;
    const item = items.find((item, index) => {
      if (item.id === id) {
        itemIndex = index;
        return true;
      }
    });
    if (!item || itemIndex === null) {
      return null;
    }
    return {
      item,
      index: itemIndex,
    };
  };

  return (
    <UserContext.Provider value={{ data, setData, items, setItems, findItemById }}>
      {children}
    </UserContext.Provider>
  );
};
