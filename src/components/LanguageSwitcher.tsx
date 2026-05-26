"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const locales = ["en", "ar", "tr"] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const cycleLocale = () => {
    const currentIndex = locales.indexOf(i18n.language as typeof locales[number]);
    const nextLocale = locales[(currentIndex + 1) % locales.length];
    i18n.changeLanguage(nextLocale);
  };

  return (
    <button
      onClick={cycleLocale}
      aria-label="Change language"
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
    >
      <Globe className="h-4 w-4" />
    </button>
  );
}