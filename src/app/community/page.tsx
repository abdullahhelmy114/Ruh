"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function CommunityPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen container mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl mb-4">{t("Community")}</h1>
      <p className="text-muted-foreground">{t("Coming soon")}</p>
    </div>
  );
}