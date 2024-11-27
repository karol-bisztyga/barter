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
