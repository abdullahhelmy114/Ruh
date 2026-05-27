"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

const localeOptions = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "tr", label: "TR" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
      >
        <Globe className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-24 rounded-2xl border border-border bg-card p-1.5 shadow-elegant z-50">
          {localeOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => { setLocale(opt.code); setOpen(false); }}
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