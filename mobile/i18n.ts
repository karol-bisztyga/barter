// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pl from './locales/pl.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en', // Default language
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
