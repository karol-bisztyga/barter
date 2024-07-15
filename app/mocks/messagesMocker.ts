import { generateLoremIpsum } from './textMocker';

export const generateMessage = () => {
  return generateLoremIpsum(Math.floor(Math.random() * 100) + 3);
};

export const generateMessages = (count: number): string[] => {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push(generateMessage());
  }
  return messages;
};
