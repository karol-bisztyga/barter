import React, { createContext, useState, ReactNode, FC, useContext, useEffect } from 'react';
import { useSessionContext } from '../../SessionContext';
import { useTranslation } from 'react-i18next';
import { useUserContext } from './UserContext';
import io, { Socket } from 'socket.io-client';
import { getServerAddress } from '../utils/networkUtils';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import {
  ChatMessage,
  RemoveMatchData,
  MatchData,
  AddMatchData,
  UpdateMatchMatchingItemData,
  UpdatedMatchMatchingItemData,
} from '../types';
import { ErrorType, handleError } from '../utils/errorHandler';
import { useJokerContext } from './JokerContext';
import { useMatchContext } from './MatchContext';

interface SocketContextState {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (matchId: string, message: ChatMessage) => void;
  sendAddMatch: (data: AddMatchData) => void;
  sendUpdateMatch: (data: UpdateMatchMatchingItemData) => void;
  sendRemoveMatch: (data: RemoveMatchData[]) => void;

  joinMatch: (matchId: string) => void;
  leaveMatch: (matchId: string) => void;

  messagesFromSocket: ChatMessage[];
  setMessagesFromSocket: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const initialState: SocketContextState = {
  connect: () => {},
  disconnect: () => {},
  sendMessage: () => {},
  sendAddMatch: () => {},
  sendUpdateMatch: () => {},
  sendRemoveMatch: () => {},

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
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (sessionContext.session) {
      connect();
    } else {
      disconnect();
    }
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

    newSocket.on('addMatch', (matchData: MatchData) => {
      matchContext.setMatches((prevMatches) => [matchData, ...prevMatches]);
    });

    newSocket.on('updateMatch', (matchData: UpdatedMatchMatchingItemData) => {
      matchContext.setMatches((prevMatches) => {
        const newMatches = [...prevMatches];
        for (let i = 0; i < newMatches.length; i++) {
          const match = newMatches[i];
          if (match.id === matchData.matchId) {
            match.matchingItem = matchData.newMatchingItem;

            break;
          }
        }
        return newMatches;
      });
    });

    newSocket.on('removeMatches', (matchesIds: string[]) => {
      matchContext.setMatches((prevMatches) => {
        const newMatches = prevMatches.filter((match) => !matchesIds.includes(match.id));
        return newMatches;
      });
    });

    // newSocket.onAny((eventName, ...args) => {
    //   console.log(`+++++ ANY: ${eventName}`, args);
    // });

    newSocket.on('matches', (matchesData: MatchData[]) => {
      console.log('- matches received', matchesData);
      matchContext.setMatches(matchesData);
    });

    newSocket.on('connect', async () => {
      console.log('socket connected', newSocket.connected);
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

  const sendAddMatch = (data: AddMatchData) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('addMatch', data);
  };

  const sendUpdateMatch = (data: UpdateMatchMatchingItemData) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('updateMatch', data);
  };

  const sendRemoveMatch = (data: RemoveMatchData[]) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('removeMatches', data);
  };

  const joinMatch = (matchId: string) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('joinMatch', matchId);
  };

  const leaveMatch = (matchId: string) => {
    if (!socket) {
      handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
      return;
    }
    socket.emit('leaveMatch', matchId);
  };

  return (
    <SocketContext.Provider
      value={{
        connect,
        disconnect,
        sendMessage,
        sendAddMatch,
        sendUpdateMatch,
        sendRemoveMatch,

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
