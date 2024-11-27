import http from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middlewares/authMiddleware';
import { ChatMessage, UserData } from './types';
import { addNewMessage } from './databaseOperations';

const socketsToUsers: Record<string, UserData> = {};

const registerUser = (userId: string, socket: Socket) => {
  const socketId = socket.id;
  socketsToUsers[socketId] = { userId };
};

const unregisterUser = (socketId: string) => {
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

  try {
    const verifyTokenResult = verifyToken(userToken);
    const userId = verifyTokenResult.id;

    registerUser(userId, socket);
  } catch (e) {
    sendError(server, socket, `${e}`);
    return;
  }

  // ON JOIN MATCH
  socket.on('joinMatch', async (matchId: string) => {
    console.log('user', socketsToUsers[socket.id].userId, 'joining match', matchId);
    socket.join(matchId);
  });

  // ON LEAVE MATCH
  socket.on('leaveMatch', async () => {
    console.log('user', socketsToUsers[socket.id].userId, 'leaving matches', socket.rooms);
    // leaving all matches, there should be at most 1 match that user is in at one time
    socket.rooms.forEach((room) => {
      socket.leave(room);
    });
  });

  // ON MESSAGE
  socket.on('message', async (matchId: string, chatMessage: ChatMessage) => {
    try {
      console.log('send message', matchId, chatMessage);
      // add to db
      const newMessage: ChatMessage = await addNewMessage(matchId, chatMessage);
      // then emit
      server.to(matchId).emit('message', newMessage);
    } catch (e) {
      sendError(server, socket, `error sending message: ${e}`);
    }
  });

  // ON DISCONNECT
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    unregisterUser(socket.id);
  });
};

export const runSocketServer = (httpServer: http.Server) => {
  const socketServer = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // ON CONNECT
  socketServer.on('connection', (socket: Socket) => {
    onConnection(socketServer, socket);
  });
};
