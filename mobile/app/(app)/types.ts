// todo change this type name to `Item`
export type ItemData = {
  id: string;
  name: string;
  images: string[];
  description: string;
};

export type MatchData = {
  id: string;
  matchingItem: ItemData;
  matchedItem: ItemData;
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
  id: string;
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  profilePicture?: string;
};

export enum EditImageType {
  'profile',
  'item',
}
