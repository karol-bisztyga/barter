// todo change this type name to `Item`
export type ItemData = {
  id: string;
  name: string;
  images: string[];
  description: string;
  distanceKm?: string;
  ownerLocationCity?: string;
  userName?: string;
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

export type ChatMessageType = 'message' | 'status';

export type ChatMessage = {
  id?: string;
  content: string;
  type: ChatMessageType;
  userId?: string;
  dateCreated?: number;
};

export type UserData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  profilePicture?: string;
  userLocationCity?: string;
  userLocationCoordinates?: string;
  verificationCode?: string;
  onboarded: string;
};

export enum EditImageType {
  'profile',
  'item',
}

export enum SwipeDirection {
  'LEFT',
  'RIGHT',
  'DOWN',
}

export type SwipeCallbacks = {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeDown: () => void;
};

export const defaultSwipeCallbacks = {
  onSwipeLeft: () => {},
  onSwipeRight: () => {},
  onSwipeDown: () => {},
};

export type ViewDimensions = {
  width: number;
  height: number;
};
