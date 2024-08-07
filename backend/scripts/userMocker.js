const { generateImage } = require('./imageMocker');

const maleFirstNames = [
  'Jan',
  'Piotr',
  'Andrzej',
  'Krzysztof',
  'Marek',
  'Tomasz',
  'Paweł',
  'Adam',
  'Michał',
  'Grzegorz',
  'Stanisław',
  'Marcin',
  'Jarosław',
  'Dariusz',
  'Ryszard',
  'Wojciech',
  'Zbigniew',
  'Sławomir',
  'Mateusz',
  'Robert',
  'Łukasz',
  'Henryk',
  'Kazimierz',
  'Damian',
  'Sebastian',
  'Jakub',
  'Bartosz',
  'Karol',
  'Jacek',
  'Mariusz',
];

const femaleFirstNames = [
  'Anna',
  'Maria',
  'Katarzyna',
  'Małgorzata',
  'Agnieszka',
  'Barbara',
  'Ewa',
  'Elżbieta',
  'Joanna',
  'Dorota',
  'Jadwiga',
  'Halina',
  'Monika',
  'Irena',
  'Beata',
  'Aleksandra',
  'Wanda',
  'Justyna',
  'Sylwia',
  'Magdalena',
  'Grażyna',
  'Danuta',
  'Renata',
  'Izabela',
  'Teresa',
  'Jolanta',
  'Bożena',
  'Urszula',
  'Mariola',
  'Lucyna',
];

const surnames = [
  'Nowak',
  'Kowalski',
  'Wiśniewski',
  'Dąbrowski',
  'Lewandowski',
  'Wójcik',
  'Kamiński',
  'Kowalczyk',
  'Zieliński',
  'Szymański',
  'Woźniak',
  'Kozłowski',
  'Jankowski',
  'Mazur',
  'Wojciechowski',
  'Kwiatkowski',
  'Krawczyk',
  'Kaczmarek',
  'Piotrowski',
  'Grabowski',
  'Zając',
  'Pawłowski',
  'Michalski',
  'Król',
  'Wieczorek',
  'Nowakowski',
  'Kubiak',
  'Adamczyk',
  'Dudek',
  'Pietrzak',
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomElement = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const getRandomDigit = () => {
  return Math.floor(Math.random() * 10);
};

const generateRandomFullName = () => {
  const isMale = Math.random() < 0.5;
  const firstName = isMale ? getRandomElement(maleFirstNames) : getRandomElement(femaleFirstNames);
  const surname = getRandomElement(surnames);
  return `${firstName} ${surname}`;
};

function removePolishDiacritics(str) {
  const diacriticsMap = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
    Ą: 'A',
    Ć: 'C',
    Ę: 'E',
    Ł: 'L',
    Ń: 'N',
    Ó: 'O',
    Ś: 'S',
    Ź: 'Z',
    Ż: 'Z',
  };
  return str.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => diacriticsMap[char]);
}

const generateEmailFromFullName = (fullName) => {
  const [firstName, surname] = fullName.split(' ');
  const firstPart = removePolishDiacritics(firstName).toLowerCase();
  const secondPart = removePolishDiacritics(surname).toLowerCase();
  const randomNum = getRandomInt(10, 99);
  const domain = getRandomElement(emailDomains);
  return `${firstPart}.${secondPart}${randomNum}@${domain}`;
};

const generateRandomPhoneNumber = () => {
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

const maybeGetValue = (callback, ...args) => {
  // Generate a random number between 0 and 1
  const chance = Math.random();

  // 50% chance to return null
  if (chance < 0.5) {
    return null;
  }

  // 50% chance to return a value from the callback
  return callback(...args);
};

function generateRandomPassword(length = 12) {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  // const specialCharacters = "!@#$%^&*()_+[]{}|;:,.<>?";

  // Combine all character sets
  const allCharacters = uppercaseLetters + lowercaseLetters + numbers; // + specialCharacters;

  let password = '';

  // Ensure the password contains at least one character from each set
  password += uppercaseLetters.charAt(Math.floor(Math.random() * uppercaseLetters.length));
  password += lowercaseLetters.charAt(Math.floor(Math.random() * lowercaseLetters.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  // password += specialCharacters.charAt(
  //   Math.floor(Math.random() * specialCharacters.length)
  // );

  // Fill the rest of the password length with random characters from all sets
  for (let i = 4; i < length; i++) {
    password += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
  }

  // Shuffle the password to ensure randomness
  password = password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');

  return password;
}

const generateUserData = () => {
  const name = generateRandomFullName();
  return {
    name,
    email: generateEmailFromFullName(name),
    phone: maybeGetValue(generateRandomPhoneNumber),
    facebook: maybeGetValue(generateRandomUsername, 'fb'),
    instagram: maybeGetValue(generateRandomUsername, 'insta'),
    profilePicture: maybeGetValue(generateImage),
    password: generateRandomPassword(Math.floor(Math.random() * 12) + 8),
  };
};

module.exports = { generateUserData };
