"use client";

import React, { useEffect, useState } from "react";

// استيراد كل ملفات الترجمة دفعة واحدة (آمنة للحجم)
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import tr from "@/messages/tr.json";

const dictionaries: Record<string, Record<string, string>> = { en, ar, tr };

interface TProps {
  children: string;
}

export function T({ children }: TProps) {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    // قراءة اللغة المخزّنة
    const stored = localStorage.getItem("preferred-locale") || "en";
    setLocale(stored);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setLocale(customEvent.detail);
    };
    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const dict = dictionaries[locale] || dictionaries.en;
  const translated = dict[children] || children;

  return React.createElement(React.Fragment, null, translated);
}

export default T;