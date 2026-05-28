"use client";

import { useEffect, useState } from "react";
import { translations, defaultLocale } from "@/i18n/translations";

function getStoredLocale(): string {
  if (typeof window === "undefined") return defaultLocale;
  return localStorage.getItem("preferred-locale") || defaultLocale;
}

export function T({ children: key }: { children: string }) {
  // 🟢 ابدأ دائماً باللغة الافتراضية لتجنب Hydration Mismatch
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    // بعد Hydration، حدث اللغة إلى المفضلة
    setLocale(getStoredLocale());

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setLocale(customEvent.detail);
    };
    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const translated = translations[locale]?.[key] || key;
  return <>{translated}</>;
}