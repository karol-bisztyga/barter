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

export enum ItemNamePlacement {
  'above',
  'below',
}

export type ChatMessageUser = 'self' | 'other';

export type ChatMessage = {
  id: string;
  content: string;
  user: ChatMessageUser;
};

export type UserData = {
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
};

export enum EditImageType {
  'profile',
  'item',
}
