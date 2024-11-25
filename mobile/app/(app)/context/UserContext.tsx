import React, { createContext, useState, ReactNode, FC, useContext, useEffect } from 'react';
import { ItemData, UserData } from '../types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_SESSION_KEY } from '../../constants';
import { useSessionContext } from '../../SessionContext';
import { useTranslation } from 'react-i18next';
import { useSettingsContext } from './SettingsContext';

interface UserContextState {
  data: UserData | null;
  setData: React.Dispatch<React.SetStateAction<UserData | null>>;
  items: Array<ItemData>;
  setItems: React.Dispatch<React.SetStateAction<Array<ItemData>>>;
  swipingLeftRightBlockedReason: string | null; // null means it's not blocked
  setSwipingLeftRightBlockedReason: React.Dispatch<React.SetStateAction<string | null>>;

  // this shows a loader on the entire screen blocking the user from interacting with the app
  blockingLoading: boolean;
  setBlockingLoading: React.Dispatch<React.SetStateAction<boolean>>;

  findItemById: (id: string | null) => { item: ItemData; index: number } | null;
}

const initialState: UserContextState = {
  data: null,
  setData: () => {},
  items: [],
  setItems: () => {},
  swipingLeftRightBlockedReason: null,
  setSwipingLeftRightBlockedReason: () => {},
  blockingLoading: false,
  setBlockingLoading: () => {},
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
  const { t } = useTranslation();

  const settingsContext = useSettingsContext();

  const [data, setData] = useState<UserData | null>(null);
  const [items, setItems] = useState<Array<ItemData>>([]);
  const [swipingLeftRightBlockedReason, setSwipingLeftRightBlockedReason] = useState<string | null>(
    null
  );
  const sessionContext = useSessionContext();
  const [blockingLoading, setBlockingLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!items.length) {
      setSwipingLeftRightBlockedReason(
        t('swiping_left_right_reason', { lng: settingsContext.language })
      );
    } else {
      setSwipingLeftRightBlockedReason(null);
    }
  }, [items, settingsContext.language]);

  useEffect(() => {
    try {
      if (!data || !sessionContext.session) {
        return;
      }
      const userDataStr = JSON.stringify(data);
      const storageStr = JSON.stringify({
        session: sessionContext.session,
        userData: userDataStr,
      });
      SecureStore.setItem(STORAGE_SESSION_KEY, storageStr);
    } catch (e) {
      // cannot use error handler due to a Require cycle
      console.error('Error setting the session in the secure store', e);
    }
  }, [data]);

  const findItemById = (id: string | null): { item: ItemData; index: number } | null => {
    if (!id) {
      return null;
    }
    let itemIndex = null;
    const item = items.find((item, index) => {
      if (`${item.id}` === `${id}`) {
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
    <UserContext.Provider
      value={{
        data,
        setData,
        items,
        setItems,
        swipingLeftRightBlockedReason,
        setSwipingLeftRightBlockedReason,
        blockingLoading,
        setBlockingLoading,
        findItemById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
