"use client";

import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const localeOptions = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "tr", label: "TR" },
];

const defaultLocale = "en";

export function LanguageSwitcher() {
  const [locale, setLocale] = useState(defaultLocale);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("preferred-locale");
    if (stored) setLocale(stored);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setLocale(customEvent.detail);
    };
    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const changeLocale = (newLocale: string) => {
    localStorage.setItem("preferred-locale", newLocale);
    setLocale(newLocale);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: newLocale }));
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
                locale === opt.code
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
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