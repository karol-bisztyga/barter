import React, { createContext, useState, ReactNode, FC, useContext, useEffect } from 'react';
import { useSessionContext } from '../../SessionContext';
import { useTranslation } from 'react-i18next';
import { useUserContext } from './UserContext';
import io, { Socket } from 'socket.io-client';
import { getServerAddress } from '../utils/networkUtils';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { ChatMessage } from '../types';
import { ErrorType, handleError } from '../utils/errorHandler';
import { useJokerContext } from './JokerContext';
import { useMatchContext } from './MatchContext';
import { getUserMatches } from '../db_utils/getUserMatches';

interface SocketContextState {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (matchId: string, message: ChatMessage) => void;

  joinMatch: (matchId: string) => void;
  leaveMatch: () => void;
  messagesFromSocket: ChatMessage[];
  setMessagesFromSocket: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const initialState: SocketContextState = {
  connect: () => {},
  disconnect: () => {},
  sendMessage: () => {},

  joinMatch: () => {},
  leaveMatch: () => {},
  messagesFromSocket: [],
  setMessagesFromSocket: () => {},
};

export const SocketContext = createContext<SocketContextState | null>(initialState);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketContextProvider');
  }
  return context;
};

export const SocketContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const jokerContext = useJokerContext();
  const matchContext = useMatchContext();

  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [messagesFromSocket, setMessagesFromSocket] = useState<ChatMessage[]>([]);

  const onError = (errorMessage: string) => {
    handleError(t, jokerContext, ErrorType.SOCKET, errorMessage);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    connect();
  }, [sessionContext.session]);

  const connect = () => {
    if (!sessionContext.session || socket) {
      return;
    }
    const newSocket = io(getServerAddress(), {
      auth: {
        token: sessionContext.session,
      },
      query: {
        userId: userContext.data?.id,
      },
    });
    setSocket(newSocket);

    newSocket.on('message', (message: ChatMessage) => {
      setMessagesFromSocket((messages) => [...messages, message]);
    });

    newSocket.on('connect', async () => {
      console.log('socket connected', newSocket.connected);
      try {
        const matchesResult = await getUserMatches(sessionContext, null);
        matchContext.setMatches(matchesResult.matches);
        matchContext.setLocalDateUpdated(matchesResult.dateUpdated);
      } catch (e) {
        handleError(t, jokerContext, ErrorType.LOAD_MATCHES, `${e}`);
      }
    });

    newSocket.on('error', (e) => {
      if (e.name === 'TokenExpiredError') {
        sessionContext.signOut();
      }
      onError(`${e}`);
    });
  };

  const disconnect = () => {
    if (!socket) {
      return;
    }
    socket.disconnect();
    setSocket(null);
  };

  const sendMessage = (matchId: string, message: ChatMessage) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('message', matchId, message);
  };

  const joinMatch = (matchId: string) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('joinMatch', matchId);
  };

  const leaveMatch = () => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('leaveMatch');
  };

  return (
    <SocketContext.Provider
      value={{
        connect,
        disconnect,
        sendMessage,

        joinMatch,
        leaveMatch,
        messagesFromSocket,
        setMessagesFromSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
