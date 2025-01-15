import React, {
  createContext,
  useState,
  ReactNode,
  FC,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useSessionContext } from '../../SessionContext';
import { useTranslation } from 'react-i18next';
import { useUserContext } from './UserContext';
import io, { Socket } from 'socket.io-client';
import { getServerAddress } from '../utils/networkUtils';
import {
  ChatMessage,
  RemoveMatchData,
  MatchData,
  AddMatchData,
  UpdateMatchMatchingItemData,
  UpdatedMatchMatchingItemData,
  NotificationInMatchData,
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

  const socketRef = useRef<Socket | null>(null);
  const [messagesFromSocket, setMessagesFromSocket] = useState<ChatMessage[]>([]);

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

  const onMessage = (message: ChatMessage) => {
    setMessagesFromSocket((messages) => [...messages, message]);
  };

  const onAddMatch = (matchData: MatchData) => {
    matchData.dateNotified = 0;
    matchContext.setMatches((prevMatches) => [matchData, ...prevMatches]);
  };

  const onUpdateMatch = (matchData: UpdatedMatchMatchingItemData) => {
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
  };

  const onNotificationInMatch = (notificationInMatchData: NotificationInMatchData) => {
    const { matchId, dateMatchNotificationUpdated } = notificationInMatchData;
    matchContext.setMatches((prevMatches) => {
      const newMatches = [...prevMatches];
      for (let i = 0; i < newMatches.length; i++) {
        const match = newMatches[i];
        if (match.id === matchId) {
          match.dateUpdated = dateMatchNotificationUpdated;
          break;
        }
      }
      return newMatches;
    });
  };

  const onRemoveMatches = (matchesIds: string[]) => {
    matchContext.setMatches((prevMatches) => {
      const newMatches = prevMatches.filter((match) => !matchesIds.includes(match.id));
      return newMatches;
    });
  };

  const onMatches = (matchesData: MatchData[]) => {
    matchContext.setMatches(matchesData);
  };

  const onError = (e: Error) => {
    sessionContext.signOut();
    handleError(t, jokerContext, ErrorType.SOCKET, `${e}`);
  };

  const connect = () => {
    if (!sessionContext.session || socketRef.current) {
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
    socketRef.current = newSocket;

    // newSocket.onAny((eventName, ...args) => {
    //   console.log(`+++++ ANY: ${eventName}`, args);
    // });
    newSocket.on('message', onMessage);
    newSocket.on('addMatch', onAddMatch);
    newSocket.on('updateMatch', onUpdateMatch);
    newSocket.on('notificationInMatch', onNotificationInMatch);
    newSocket.on('removeMatches', onRemoveMatches);
    newSocket.on('matches', onMatches);
    newSocket.on('connect', () => {
      console.log('socket connected', newSocket.connected);
    });
    newSocket.on('error', onError);
  };

  const disconnect = () => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.disconnect();
    socketRef.current = null;
  };

  const handleSocketReconnection = (callback: (socket: Socket) => void) => {
    if (socketRef.current) {
      callback(socketRef.current);
      return;
    }

    handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED);
    connect();
    if (socketRef.current) {
      jokerContext.showSuccess(t('socket_reconnected'));
      callback(socketRef.current);
      return;
    }
    handleError(t, jokerContext, ErrorType.SOCKET_NOT_CONNECTED_RETRY_FAILED);
  };

  const sendMessage = (matchId: string, message: ChatMessage) => {
    handleSocketReconnection((socket: Socket) => {
      socket.emit('message', matchId, message);
    });
  };

  const sendAddMatch = (data: AddMatchData) => {
    handleSocketReconnection((socket: Socket) => {
      socket.emit('addMatch', data);
    });
  };

  const sendUpdateMatch = (data: UpdateMatchMatchingItemData) => {
    handleSocketReconnection((socket: Socket) => {
      socket.emit('updateMatch', data);
    });
  };

  const sendRemoveMatch = (data: RemoveMatchData[]) => {
    handleSocketReconnection((socket: Socket) => {
      socket.emit('removeMatches', data);
    });
  };

  const joinMatch = (matchId: string) => {
    handleSocketReconnection((socket: Socket) => {
      socket.emit('joinMatch', matchId);
    });
  };

  const leaveMatch = (matchId: string) => {
    handleSocketReconnection((socket: Socket) => {
      socket.emit('leaveMatch', matchId);
    });
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
