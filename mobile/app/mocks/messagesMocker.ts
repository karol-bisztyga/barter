import { ChatMessage, ChatMessageUser } from '../types';
import { generateLoremIpsum } from './textMocker';
import uuid from 'react-native-uuid';

export const generateMessage = (
  maxLength: number = 30,
  forcedContent?: string,
  forcedUser?: ChatMessageUser
): ChatMessage => {
  return {
    id: `message-${uuid.v4()}`,
    content: forcedContent || generateLoremIpsum(Math.floor(Math.random() * maxLength) + 3),
    user: forcedUser ?? (Math.random() > 0.5 ? 'self' : 'other'),
  };
};

export const generateMessages = (count: number, forcedUser?: ChatMessageUser): ChatMessage[] => {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push(generateMessage(30, undefined, forcedUser));
  }
  return messages;
};
