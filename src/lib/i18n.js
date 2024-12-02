import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    defaultNS: 'landing',
    interpolation: {
      escapeValue: false,
    },
    lng: 'en',
    resources: {
      en: {
        landing: require('../locales/en/landing.json'),
        auth: require('../locales/en/auth.json'),
        dashboard: require('../locales/en/dashboard.json')
      },
      zh: {
        landing: require('../locales/zh/landing.json'),
        auth: require('../locales/zh/auth.json'),
        dashboard: require('../locales/zh/dashboard.json')
      },
    },
  });

export default i18n; 