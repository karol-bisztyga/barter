import http from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  ChatMessage,
  RemoveMatchData,
  AddMatchData,
  ItemData,
  UpdateMatchMatchingItemData,
  UpdatedMatchMatchingItemData,
} from './types';
import {
  addNewMessage,
  getItemsDataByIds,
  getMatches,
  updateMatchMatchingItem,
} from './databaseOperations';

const socketsToUsers: Record<string, string> = {};
const usersToSockets: Record<string, string> = {};

const registerUser = (userId: string, socket: Socket) => {
  const socketId = socket.id;
  socketsToUsers[socketId] = userId;
  usersToSockets[userId] = socketId;
};

const unregisterUser = (socketId: string) => {
  const userId = socketsToUsers[socketId];
  delete usersToSockets[userId];
  delete socketsToUsers[socketId];
};

const sendError = (server: Server, socket: Socket, error: string) => {
  console.error(error);
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
    const matches = await getMatches(userId);
    server.to(usersToSockets[userId]).emit('matches', matches);
  } catch (e) {
    sendError(server, socket, `${e}`);
    return;
  }

  // ON JOIN MATCH
  socket.on('joinMatch', async (matchId: string) => {
    // console.log('user', socketsToUsers[socket.id], 'joining match', matchId);
    socket.join(matchId);
  });

  // ON LEAVE MATCH
  socket.on('leaveMatch', async (matchId: string) => {
    // console.log(
    //   'user',
    //   socketsToUsers[socket.id],
    //   'leaving match',
    //   matchId,
    //   ', current matches matches',
    //   socket.rooms
    // );
    socket.leave(matchId);
    // console.log(
    //   'user',
    //   socketsToUsers[socket.id],
    //   'left match ',
    //   matchId,
    //   ', current matches',
    //   socket.rooms
    // );
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

  // ON ADD MATCH
  socket.on('addMatch', async (data: AddMatchData) => {
    try {
      console.log('add match', data);
      const { matchId, matchingItemId, matchedItemId } = data;
      const itemsData: ItemData[] = await getItemsDataByIds([matchingItemId, matchedItemId]);
      if (!itemsData[0].userId || !itemsData[1].userId) {
        throw new Error('could not find user ids for items');
      }
      // send data to both items' owners
      const ownersIds = [itemsData[0].userId, itemsData[1].userId];
      ownersIds.forEach((ownerId) => {
        if (!ownerId || !usersToSockets[ownerId]) {
          return;
        }
        server.to(usersToSockets[ownerId]).emit('addMatch', {
          id: matchId,
          matchingItem: itemsData[0],
          matchedItem: itemsData[1],
        });
      });
    } catch (e) {
      sendError(server, socket, `error adding a match: ${e}`);
    }
  });

  // ON UPDATE MATCH
  socket.on('updateMatch', async (data: UpdateMatchMatchingItemData) => {
    const newItemsData = await updateMatchMatchingItem(data);
    const ownersIds = newItemsData.owners;
    ownersIds.forEach((ownerId) => {
      if (!ownerId || !usersToSockets[ownerId]) {
        return;
      }
      const dataToSend: UpdatedMatchMatchingItemData = {
        matchId: data.matchId,
        newMatchingItem: newItemsData.newMatchingItem,
      };
      server.to(usersToSockets[ownerId]).emit('updateMatch', dataToSend);
    });
  });

  // ON REMOVE MATCHES
  socket.on('removeMatches', async (data: RemoveMatchData[]) => {
    // ownerId => [matchId1, matchId2, ...]
    const matchesIdsToRemoveForOwners: Record<string, Array<string>> = {};
    data.forEach((match) => {
      if (!matchesIdsToRemoveForOwners[match.owner1Id]) {
        matchesIdsToRemoveForOwners[match.owner1Id] = [];
      }
      if (!matchesIdsToRemoveForOwners[match.owner2Id]) {
        matchesIdsToRemoveForOwners[match.owner2Id] = [];
      }
      matchesIdsToRemoveForOwners[match.owner1Id].push(match.matchId);
      matchesIdsToRemoveForOwners[match.owner2Id].push(match.matchId);
    });
    Object.keys(matchesIdsToRemoveForOwners).forEach((ownerId) => {
      if (!usersToSockets[ownerId]) {
        return;
      }
      // console.log(
      //   'sending remove matches ',
      //   matchesIdsToRemoveForOwners[ownerId],
      //   ' to',
      //   usersToSockets[ownerId]
      // );
      server
        .to(usersToSockets[ownerId])
        .emit('removeMatches', matchesIdsToRemoveForOwners[ownerId]);
    });
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
