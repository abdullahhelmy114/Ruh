"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

const localeNames: Record<string, string> = {
  en: "EN",
  ar: "AR",
  tr: "TR",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const cycleLocale = () => {
    const locales = ["en", "ar", "tr"];
    const currentIndex = locales.indexOf(locale);
    const nextLocale = locales[(currentIndex + 1) % locales.length];
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={cycleLocale}
      aria-label="Change language"
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-xs font-bold transition-colors hover:bg-accent"
    >
      {localeNames[locale] || locale.toUpperCase()}
    </button>
  );
}