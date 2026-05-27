"use client";

import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations, defaultLocale } from "@/i18n/translations";

const localeOptions = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "tr", label: "TR" },
];

function getStoredLocale(): string {
  if (typeof window === "undefined") return defaultLocale;
  return localStorage.getItem("preferred-locale") || defaultLocale;
}

function setStoredLocale(locale: string) {
  localStorage.setItem("preferred-locale", locale);
  window.dispatchEvent(new CustomEvent("locale-change", { detail: locale }));
}

export function LanguageSwitcher() {
  const [locale, setLocale] = useState(getStoredLocale);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setLocale(customEvent.detail);
    };
    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const changeLocale = (newLocale: string) => {
    setStoredLocale(newLocale);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
      >
        <Globe className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-24 rounded-2xl border border-border bg-card p-1.5 shadow-elegant z-50">
          {localeOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => changeLocale(opt.code)}
              className={cn(
                "flex items-center justify-between w-full rounded-full px-3 py-2 text-sm font-medium transition-colors",
                locale === opt.code ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
              )}
            >
              {opt.label}
              {locale === opt.code && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}