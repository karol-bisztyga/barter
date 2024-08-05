import { MAX_ITEM_PICTURES } from '../constants';
import { ItemData } from '../types';
import { generateImage } from './imageMocker';
import { generateLoremIpsum } from './textMocker';
import uuid from 'react-native-uuid';

export const generateItemId = (maybeId?: number) => {
  const id = maybeId || uuid.v4();
  return `item-${id}`;
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
    count = Math.floor(Math.random() * MAX_ITEM_PICTURES) + 1;
  }
  if (count < 1 || count > MAX_ITEM_PICTURES) {
    throw new Error(`Count must be between 1 and ${MAX_ITEM_PICTURES}.`);
  }

  const urls = [];

  for (let i = 0; i < count; i++) {
    urls.push(generateImage());
  }

  return urls;
};

export const generateItem = (id?: number): ItemData => {
  return {
    id: generateItemId(id),
    name: generateRandomHouseholdObjectName(),
    images: generateMockedImageUrls(),
    description: generateLoremIpsum(200),
  };
};

export const generateChatItems = (
  count: number,
  userItems: Array<ItemData>
): Array<[ItemData, ItemData]> => {
  const items: Array<[ItemData, ItemData]> = [];
  for (let i = 0; i < count; i++) {
    const randomUserItem = userItems[Math.floor(Math.random() * userItems.length)];
    items.push([randomUserItem, generateItem()]);
  }
  return items;
};
