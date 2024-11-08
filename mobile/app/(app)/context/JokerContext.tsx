import React, { createContext, useState, ReactNode, FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

export enum AlertType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
}

export type JokerAlert = {
  type: AlertType;
  message: string;
  blocking: boolean;
};

export interface JokerContextState {
  alerts: Array<JokerAlert>;
  pushAlert: (alert: JokerAlert) => void;
  popAlert: () => JokerAlert | null;

  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showSuccess: (message: string) => void;
  showNonBlockingInfo: (message: string) => void;
  showRandomGreeting: () => void;
}

const initialState: JokerContextState = {
  alerts: [],
  pushAlert: () => {},
  popAlert: () => null,

  showError: () => {},
  showInfo: () => {},
  showSuccess: () => {},
  showNonBlockingInfo: () => {},
  showRandomGreeting: () => {},
};

export const JokerContext = createContext<JokerContextState | null>(initialState);

export const useJokerContext = () => {
  const context = useContext(JokerContext);
  if (!context) {
    throw new Error('useJokerContext must be used within a JokerContextProvider');
  }
  return context;
};

const NUMBER_OF_GREETINGS = 3;

export const JokerContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Array<JokerAlert>>([]);
  const [previousGreetingsIndex, setPreviousGreetingsIndex] = useState<number>(-1);

  const pushAlert = (alert: JokerAlert) => {
    setAlerts([...alerts, alert]);
  };

  const popAlert = () => {
    if (!alerts.length) {
      return null;
    }
    const result = alerts[0];
    setAlerts(alerts.slice(1));
    return result;
  };

  const showError = (message: string) => {
    pushAlert({ type: AlertType.ERROR, message, blocking: true });
  };

  const showInfo = (message: string) => {
    pushAlert({ type: AlertType.INFO, message, blocking: true });
  };

  const showSuccess = (message: string) => {
    pushAlert({ type: AlertType.SUCCESS, message, blocking: false });
  };

  const showNonBlockingInfo = (message: string) => {
    pushAlert({ type: AlertType.INFO, message, blocking: false });
  };

  const showRandomGreeting = () => {
    let randomGreetingIndex = null;
    while (randomGreetingIndex === null || previousGreetingsIndex === randomGreetingIndex) {
      randomGreetingIndex = Math.floor(Math.random() * NUMBER_OF_GREETINGS) + 1;
    }
    setPreviousGreetingsIndex(randomGreetingIndex);
    showNonBlockingInfo(t(`greeting_${randomGreetingIndex}`));
  };

  return (
    <JokerContext.Provider
      value={{
        alerts,
        pushAlert,
        popAlert,
        showError,
        showInfo,
        showSuccess,
        showNonBlockingInfo,
        showRandomGreeting,
      }}
    >
      {children}
    </JokerContext.Provider>
  );
};
