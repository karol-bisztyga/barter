import { Card } from '../(tabs)/swipe/index';

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

const generateLoremIpsum = (wordCount: number = 50) => {
  const loremIpsumWords = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'ut',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'ut',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'dolor',
    'in',
    'reprehenderit',
    'in',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'dolore',
    'eu',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'in',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
  ];

  const result = [];

  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * loremIpsumWords.length);
    result.push(loremIpsumWords[randomIndex]);
  }

  return result.join(' ');
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
