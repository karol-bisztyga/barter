import { UserData } from '../types';

const firstNames = [
  'John',
  'Jane',
  'Alex',
  'Emily',
  'Michael',
  'Sarah',
  'David',
  'Laura',
  'Robert',
  'Emma',
  'Daniel',
  'Olivia',
  'James',
  'Sophia',
  'Joseph',
  'Isabella',
  'Thomas',
  'Mia',
  'Charles',
  'Ava',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Brown',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Garcia',
  'Martinez',
  'Robinson',
  'Clark',
  'Rodriguez',
  'Lewis',
  'Lee',
  'Walker',
  'Hall',
];
const adjectives = [
  'Cool',
  'Happy',
  'Bright',
  'Quick',
  'Lively',
  'Brave',
  'Calm',
  'Charming',
  'Cheerful',
  'Clever',
  'Creative',
  'Daring',
  'Elegant',
  'Funky',
  'Gentle',
  'Graceful',
  'Jolly',
  'Joyful',
  'Lucky',
  'Magical',
];

const nouns = [
  'Lion',
  'Tiger',
  'Panther',
  'Eagle',
  'Hawk',
  'Wolf',
  'Fox',
  'Bear',
  'Shark',
  'Dolphin',
  'Phoenix',
  'Dragon',
  'Unicorn',
  'Wizard',
  'Knight',
  'Samurai',
  'Ninja',
  'Pirate',
  'Alien',
  'Robot',
];

const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];

const getRandomElement = (array: string[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const getRandomDigit = () => {
  return Math.floor(Math.random() * 10);
};

export const generateRandomFullName = (): string => {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  return `${firstName} ${lastName}`;
};

export const generateEmailFromFullName = (fullName: string) => {
  const lowerCaseName = fullName.toLowerCase();
  const nameParts = lowerCaseName.split(' ');
  const localPart = nameParts.join('.');
  const domain = getRandomElement(emailDomains);
  return `${localPart}@${domain}`;
};

export const generateRandomPhoneNumber = () => {
  const areaCode = `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}`;
  const centralOfficeCode = `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}`;
  const lineNumber = `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}`;

  return `(${areaCode}) ${centralOfficeCode}-${lineNumber}`;
};

const generateRandomUsername = (platform = 'fb') => {
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  const number = Math.floor(Math.random() * 1000);

  if (platform === 'insta') {
    // Instagram nicknames often use underscores
    return `${adjective}_${noun}_${number}`;
  }

  // Facebook nicknames tend to be more straightforward
  return `${adjective}${noun}${number}`;
};

const maybeGetValue = (callback: (...args: string[]) => string, ...args: string[]) => {
  // Generate a random number between 0 and 1
  const chance = Math.random();

  // 50% chance to return null
  if (chance < 0.5) {
    return;
  }

  // 50% chance to return a value from the callback
  return callback(...args);
};

export const generateUserData = (): UserData => {
  const name = generateRandomFullName();
  return {
    name,
    email: generateEmailFromFullName(name),
    phone: maybeGetValue(generateRandomPhoneNumber),
    facebook: maybeGetValue(generateRandomUsername, 'fb'),
    instagram: maybeGetValue(generateRandomUsername, 'insta'),
  };
};
