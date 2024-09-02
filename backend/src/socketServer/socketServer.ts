import http from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middlewares/authMiddleware';
import { ChatMessage, UserData } from '../types';
import { addNewMessage, getMessages } from './databaseOperations';

const socketsToUsers: Record<string, UserData> = {};
const matchesToSockets: Record<string, string[]> = {};

const registerUser = (userId: string, socket: Socket, matchId: string) => {
  const socketId = socket.id;
  console.log('registering user', socketId, matchId);
  socketsToUsers[socketId] = { userId, matchId };
  if (!matchesToSockets[matchId] || !matchesToSockets[matchId].length) {
    matchesToSockets[matchId] = [socketId];
  } else {
    matchesToSockets[matchId].push(socketId);
  }
  socket.join(matchId);
};

const unregisterUser = (socketId: string) => {
  console.log('unregistering user', socketId);
  const { matchId } = socketsToUsers[socketId];

  const index = matchesToSockets[matchId].indexOf(socketId);
  if (index === -1) {
    throw new Error(`socket [${socketId}] not found in match ${matchId}`);
  }
  matchesToSockets[matchId].splice(index, 1);

  delete socketsToUsers[socketId];
};

const sendError = (server: Server, socket: Socket, error: string) => {
  console.error('error verifying token', error);
  server.to(socket.id).emit('error', error);
  socket.disconnect();
};

const onConnection = async (server: Server, socket: Socket) => {
  console.log('A user connected:', socket.id);

  const userToken = socket.handshake.auth.token;
  const matchId: string = socket.handshake.query.matchId as string;

  let verifyTokenResult;
  try {
    verifyTokenResult = verifyToken(userToken);
    const userId = verifyTokenResult.id;
    console.log('verification', userId, matchId);

    registerUser(userId, socket, matchId);

    const initialMessages = await getMessages(matchId);

    console.log('sending initial messages to', socket.id);
    server.to(socket.id).emit('initialMessages', JSON.stringify(initialMessages));
  } catch (e) {
    sendError(server, socket, `${e}`);
    return;
  }

  socket.on('message', async (data: ChatMessage) => {
    try {
      await onMessage(server, socket.id, data);
    } catch (e) {
      sendError(server, socket, `error sending message: ${e}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    unregisterUser(socket.id);
  });
};

const onMessage = async (server: Server, socketId: string, data: ChatMessage) => {
  const { matchId, userId } = socketsToUsers[socketId];
  console.log('Message received from[', socketId, userId, '] to match', matchId, ':', data);
  const socketsInMatch = matchesToSockets[matchId];
  console.log('sockets in this match:', socketsInMatch);

  const dbResult = await addNewMessage(matchId, {
    content: data.content,
    type: 'message',
    userId: userId,
  });
  console.log('added message to database', dbResult);

  server.to(matchId).emit('message', data);
};

export const runSocketServer = (httpServer: http.Server) => {
  const socketServer = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  socketServer.on('connection', (socket: Socket) => {
    onConnection(socketServer, socket);
  });
};
