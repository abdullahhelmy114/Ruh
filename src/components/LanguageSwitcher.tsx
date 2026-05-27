"use client";

import useTranslation from "next-translate/useTranslation";
import { Globe } from "lucide-react";
import { useRouter } from "next/router";

const locales = ["en", "ar", "tr"];

export function LanguageSwitcher() {
  const { lang } = useTranslation();
  const router = useRouter();

  const changeLang = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <select
      value={lang}
      onChange={(e) => changeLang(e.target.value)}
      className="rounded-full border border-border bg-card px-2 py-1 text-sm"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}