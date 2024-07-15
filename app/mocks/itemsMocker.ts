import { Card } from '../types';
import { generateLoremIpsum } from './textMocker';

const generateId = (id?: number) => {
  if (id !== undefined) {
    return `item-${id}`;
  }
  return `item-${Date.now()}`;
};

const generateRandomHouseholdObjectName = () => {
  const adjectives = [
    'Cozy',
    'Shiny',
    'Sturdy',
    'Vintage',
    'Modern',
    'Elegant',
    'Sleek',
    'Rustic',
    'Compact',
    'Charming',
    'Handy',
    'Portable',
    'Luxurious',
    'Minimalist',
    'Classic',
    'Durable',
    'Colorful',
    'Functional',
    'Stylish',
    'Innovative',
  ];

  const objects = [
    'Chair',
    'Table',
    'Lamp',
    'Sofa',
    'Shelf',
    'Bed',
    'Cabinet',
    'Desk',
    'Stool',
    'Cupboard',
    'Rug',
    'Curtain',
    'Cushion',
    'Mirror',
    'Clock',
    'Vase',
    'Blender',
    'Toaster',
    'Kettle',
    'Mug',
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomObject = objects[Math.floor(Math.random() * objects.length)];

  return `${randomAdjective} ${randomObject}`;
};

const generateMockedImageUrls = (count?: number) => {
  if (count === undefined) {
    count = Math.floor(Math.random() * 5) + 1;
  }
  if (count < 1 || count > 5) {
    throw new Error('Count must be between 1 and 5.');
  }

  const urls = [];

  for (let i = 0; i < count; i++) {
    // Using `https://picsum.photos` to generate random image URLs
    const width = 200 + i * 50; // Slightly vary the size to ensure distinct images
    const height = 200 + i * 50;
    const url = `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
    urls.push(url);
  }

  return urls;
};

export const generateItem = (id?: number): Card => {
  return {
    id: generateId(id),
    name: generateRandomHouseholdObjectName(),
    images: generateMockedImageUrls(),
    description: generateLoremIpsum(),
  };
};

export const generateChatItems = (count: number): Array<[Card, Card]> => {
  const items: Array<[Card, Card]> = [];
  for (let i = 0; i < count; i++) {
    items.push([generateItem(), generateItem()]);
  }
  return items;
};
