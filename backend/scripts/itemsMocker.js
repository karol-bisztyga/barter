const { generateImage } = require('./imageMocker');
const { generateLoremIpsum } = require('./textMocker');

const MAX_ITEM_PICTURES = 5;

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

const generateMockedImageUrls = (count) => {
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

const generateItem = (userId) => {
  return {
    userId,
    name: generateRandomHouseholdObjectName(),
    description: generateLoremIpsum(200),
  };
};

module.exports = { generateItem, generateMockedImageUrls };
