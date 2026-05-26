"use client"; // <-- هذا السطر هو الحل

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ar from "@/messages/ar.json";
import tr from "@/messages/tr.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: {} },
      ar: { translation: ar },
      tr: { translation: tr },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    parseMissingKeyHandler: (key: string) => key,
  });

export default i18n;