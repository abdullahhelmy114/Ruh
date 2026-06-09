export async function getWords(
  verseKey: string,
  language: "en" | "tr" = "en"
): Promise<{ word: string; translation: string }[]> {
  const translationsMap: Record<string, number> = { en: 85, tr: 77 };
  const translationId = translationsMap[language];
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&translations=${translationId}`
    );
    const data = await res.json();
    if (!data.verse?.words) return [];
    return data.verse.words.map((w: any) => ({
      word: w.text_uthmani,
      translation: w.translation?.text || "",
    }));
  } catch {
    return [];
  }
}

export async function getTafsirFromQurancom(verseKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/2/by_verse_key/${verseKey}`
    );
    const data = await res.json();
    return data.tafsir?.text || "";
  } catch {
    return "";
  }
}