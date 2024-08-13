import http from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './middlewares/authMiddleware';

type UserData = {
  userId: string;
  matchId: string;
};

const socketsToUsers: Record<string, UserData> = {};
const matchesToSockets: Record<string, string[]> = {};

const registerUser = (userId: string, socketId: string, matchId: string) => {
  console.log('registering user', socketId, matchId);
  socketsToUsers[socketId] = { userId, matchId };
  if (!matchesToSockets[matchId] || !matchesToSockets[matchId].length) {
    matchesToSockets[matchId] = [socketId];
  } else {
    matchesToSockets[matchId].push(socketId);
  }
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

const onConnection = (server: Server, socket: Socket) => {
  console.log('A user connected:', socket.id);
  console.log('initial user data', socket.handshake);

  const userToken = socket.handshake.auth.token;
  const matchId: string = socket.handshake.query.matchId as string;

  const verifyTokenResult = verifyToken(userToken);

  const userId = verifyTokenResult.id;
  console.log('verification', userId, matchId);

  registerUser(userId, socket.id, matchId);

  socket.on('message', (data: string) => {
    onMessage(server, socket.id, data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    unregisterUser(socket.id);
  });
};

const onMessage = (server: Server, socketId: string, data: string) => {
  const { matchId, userId } = socketsToUsers[socketId];
  console.log('Message received from[', socketId, userId, '] to match ', matchId, ':', data);
  const socketsInMatch = matchesToSockets[matchId];
  console.log('sockets in this match:', socketsInMatch); // todo test this with 2 devices

  server.emit('message', data);
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
