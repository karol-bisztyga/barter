export type UserData = {
  userId: string;
};

export type ChatMessageType = 'message' | 'status';

export type ChatMessage = {
  id?: string;
  content: string;
  type: ChatMessageType;
  userId?: string;
  dateCreated?: number;
};

export type AddNewMessageResult = ChatMessage & {
  matchingUserId: string;
  matchedUserId: string;
  dateMatchNotificationUpdated: number;
};

export type ItemData = {
  id: string;
  name: string;
  images: string[];
  description: string;
  distanceKm?: string;
  ownerLocationCity?: string;
  userName?: string;
  userId?: string;
};

export type MatchData = {
  id: string;
  matchingItem: ItemData;
  matchedItem: ItemData;
  dateUpdated: number;
};

export type AddMatchData = {
  matchId: string;
  matchingItemId: string;
  matchedItemId: string;
};

export type UpdateMatchMatchingItemData = {
  matchId: string;
  newMatchingItemId: string;
};

export type UpdatedMatchMatchingItemData = {
  matchId: string;
  newMatchingItem: ItemData;
};

export type RemoveMatchData = {
  matchId: string;
  owner1Id: string;
  owner2Id: string;
};
