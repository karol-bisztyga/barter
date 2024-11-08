// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import language_english from './locales/en.json';
import language_polish from './locales/pl.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'language_english', // Default language
  fallbackLng: 'language_english',
  resources: {
    language_english: { translation: language_english },
    language_polish: { translation: language_polish },
  },
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
