"use client";

import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const locales = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "tr", label: "TR" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language?.split("-")[0] || "en";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
      >
        <Globe className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-24 rounded-2xl border border-border bg-card p-1.5 shadow-elegant z-50">
          {locales.map((locale) => {
            const active = currentLang === locale.code;
            return (
              <button
                key={locale.code}
                onClick={() => {
                  i18n.changeLanguage(locale.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{locale.label}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}