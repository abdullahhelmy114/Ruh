"use client";

import useTranslation from "next-translate/useTranslation";

export function T({ children }: { children: string }) {
  const { t } = useTranslation();
  return <>{t(children)}</>;
}