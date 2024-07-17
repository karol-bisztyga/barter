import { ChatMessage } from '../types';
import { generateLoremIpsum } from './textMocker';
import uuid from 'react-native-uuid';

export const generateMessage = (maxLength: number = 30): ChatMessage => {
  return {
    id: `message-${uuid.v4()}`,
    content: generateLoremIpsum(Math.floor(Math.random() * maxLength) + 3),
    user: Math.random() > 0.5 ? 'self' : 'other',
  };
};

export const generateMessages = (count: number): ChatMessage[] => {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push(generateMessage());
  }
  return messages;
};
