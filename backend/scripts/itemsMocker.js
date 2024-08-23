const { generateLoremIpsum } = require('./textMocker');

const masculineAdjectives = [
  'duży',
  'mały',
  'nowy',
  'stary',
  'ładny',
  'brzydki',
  'wygodny',
  'niewygodny',
  'długi',
  'krótki',
  'ciężki',
  'lekki',
  'jasny',
  'ciemny',
  'kolorowy',
  'biały',
  'czarny',
  'szary',
  'zielony',
  'niebieski',
  'czerwony',
  'żółty',
  'pomarańczowy',
  'fioletowy',
  'różowy',
  'drewniany',
  'metalowy',
  'plastikowy',
  'szklany',
  'papierowy',
];

const feminineAdjectives = [
  'duża',
  'mała',
  'nowa',
  'stara',
  'ładna',
  'brzydka',
  'wygodna',
  'niewygodna',
  'długa',
  'krótka',
  'ciężka',
  'lekka',
  'jasna',
  'ciemna',
  'kolorowa',
  'biała',
  'czarna',
  'szara',
  'zielona',
  'niebieska',
  'czerwona',
  'żółta',
  'pomarańczowa',
  'fioletowa',
  'różowa',
  'drewniana',
  'metalowa',
  'plastikowa',
  'szklana',
  'papierowa',
];

const neuterAdjectives = [
  'duże',
  'małe',
  'nowe',
  'stare',
  'ładne',
  'brzydkie',
  'wygodne',
  'niewygodne',
  'długie',
  'krótkie',
  'ciężkie',
  'lekkie',
  'jasne',
  'ciemne',
  'kolorowe',
  'białe',
  'czarne',
  'szare',
  'zielone',
  'niebieskie',
  'czerwone',
  'żółte',
  'pomarańczowe',
  'fioletowe',
  'różowe',
  'drewniane',
  'metalowe',
  'plastikowe',
  'szklane',
  'papierowe',
];

const masculineItems = [
  'krzesło',
  'stół',
  'fotel',
  'telewizor',
  'kuchenka',
  'mikrofalówka',
  'zmywarka',
  'toster',
  'blender',
  'mikser',
  'nóż',
  'widelec',
  'talerz',
  'garnek',
  'patelnia',
  'odkurzacz',
  'klucz',
  'śrubokręt',
  'młotek',
  'prysznic',
];

const feminineItems = [
  'lampa',
  'szafka',
  'komoda',
  'kanapa',
  'zasłona',
  'firanka',
  'poduszka',
  'pościel',
  'suszarka',
  'szklanka',
  'lodówka',
  'kuchenka',
  'zmywarka',
  'pralka',
  'kanapa',
  'dywan',
  'komoda',
  'firanka',
  'żelazko',
  'frytkownica',
];

const neuterItems = [
  'łóżko',
  'lustro',
  'koc',
  'czajnik',
  'kubek',
  'telewizor',
  'lustro',
  'koc',
  'pościel',
  'żelazko',
  'radio',
  'łóżko',
  'lustro',
  'krzesło',
  'koc',
  'czajnik',
  'kubek',
  'szkło',
  'klucz',
  'okno',
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[getRandomInt(0, arr.length - 1)];
}

function generateRandomHouseholdObjectName() {
  const type = getRandomInt(0, 2);
  let adjective;
  let item;

  if (type === 0) {
    adjective = getRandomElement(masculineAdjectives);
    item = getRandomElement(masculineItems);
  } else if (type === 1) {
    adjective = getRandomElement(feminineAdjectives);
    item = getRandomElement(feminineItems);
  } else {
    adjective = getRandomElement(neuterAdjectives);
    item = getRandomElement(neuterItems);
  }

  return `${adjective} ${item}`;
}

const generateItem = (userId) => {
  return {
    userId,
    name: generateRandomHouseholdObjectName(),
    description: generateLoremIpsum(200),
  };
};

module.exports = { generateItem };
