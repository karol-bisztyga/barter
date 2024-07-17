export type Card = {
  id: string;
  name: string;
  images: string[];
  description: string;
};

export enum ItemBorderRadius {
  'all',
  'up-only',
}

export type ChatMessageUser = 'self' | 'other';

export type ChatMessage = {
  id: string;
  content: string;
  user: ChatMessageUser;
};
