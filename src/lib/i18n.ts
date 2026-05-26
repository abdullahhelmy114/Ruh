import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '@/messages/ar.json';
import tr from '@/messages/tr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: {} },  // الإنجليزية لا تحتاج ترجمة (النص نفسه هو الترجمة)
      ar: { translation: ar },
      tr: { translation: tr },
    },
    fallbackLng: 'en',
    returnObjects: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    parseMissingKeyHandler: (key: string) => key, // إن لم يجد المفتاح، يُرجع النص كما هو
  });

export default i18n;