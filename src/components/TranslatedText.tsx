"use client";

import { useTranslation } from "react-i18next";

export function T({ children }: { children: string }) {
  const { t } = useTranslation();
  return <>{t(children)}</>;
}