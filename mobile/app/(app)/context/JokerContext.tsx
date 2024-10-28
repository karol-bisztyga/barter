import React, { createContext, useState, ReactNode, FC, useContext } from 'react';

export enum AlertType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
}

type Alert = {
  type: AlertType;
  message: string;
};

interface JokerContextState {
  alerts: Array<Alert>;
  pushAlert: (alert: Alert) => void;
  popAlert: () => Alert | undefined;

  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showSuccess: (message: string) => void;
}

const initialState: JokerContextState = {
  alerts: [],
  pushAlert: () => {},
  popAlert: () => undefined,

  showError: () => {
    console.log('asd');
  },
  showInfo: () => {
    console.log('asd');
  },
  showSuccess: () => {
    console.log('asd');
  },
};

export const JokerContext = createContext<JokerContextState | null>(initialState);

export const useJokerContext = () => {
  const context = useContext(JokerContext);
  if (!context) {
    throw new Error('useJokerContext must be used within a JokerContextProvider');
  }
  return context;
};

export const JokerContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Array<Alert>>([]);

  const pushAlert = (alert: Alert) => {
    setAlerts([...alerts, alert]);
  };

  const showError = (message: string) => {
    console.log('here 1');
    pushAlert({ type: AlertType.ERROR, message });
  };

  const showInfo = (message: string) => {
    console.log('here 2');
    pushAlert({ type: AlertType.INFO, message });
  };

  const showSuccess = (message: string) => {
    console.log('here 3');
    pushAlert({ type: AlertType.SUCCESS, message });
  };

  const popAlert = () => {
    const result = alerts[0];
    setAlerts(alerts.slice(1));
    return result;
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
      }}
    >
      {children}
    </JokerContext.Provider>
  );
};
