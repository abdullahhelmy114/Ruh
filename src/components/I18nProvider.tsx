"use client";

import React from "react";
import { I18nextProvider } from "react-i18next";
import { i18next, initReactI18next, LanguageDetector } from "@/lib/i18n";

import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import tr from "@/messages/tr.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  tr: { translation: tr },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [i18n] = React.useState(() => {
    const instance = i18next.createInstance();
    instance
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        detection: {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
        },
        parseMissingKeyHandler: (key: string) => key,
      });
    return instance;
  });

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}