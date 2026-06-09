// src/lib/quran-ai.ts

// ============== أنواع الاستجابة من MCP ==============
interface MCPResponse {
  result?: {
    content?: { type: string; text: string }[];
  };
  error?: { message: string };
}

// ============== دالة استدعاء موحدة لـ MCP (quran.ai) ==============
async function callTool(toolName: string, args: Record<string, any>): Promise<any> {
  try {
    const response = await fetch("https://mcp.quran.ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP request failed with status ${response.status}`);
    }

    const json: MCPResponse = await response.json();

    if (json.error) {
      throw new Error(json.error.message || "MCP tool error");
    }

    const text = json.result?.content?.[0]?.text;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.error(`Error calling MCP tool "${toolName}":`, error);
    return null;
  }
}

// ============== جلب التحليل الصرفي للكلمات ==============
export async function getWordMorphology(surah: number, ayah: number): Promise<any[]> {
  const result = await callTool("word_morphology", {
    surah_number: surah,
    ayah_number: ayah,
  });
  return Array.isArray(result) ? result : [];
}

// ============== جلب التفسير من MCP quran.ai ==============
export async function getTafsir(
  surah: number,
  ayah: number,
  tafsirKey: string = "ar-tafsir-al-jalalayn"
): Promise<string> {
  const result = await callTool("fetch_tafsir", {
    surah_number: surah,
    ayah_number: ayah,
    tafsir_key: tafsirKey,
  });
  if (typeof result === "string") return result;
  if (result && typeof result.text === "string") return result.text;
  return "";
}

// ============== جلب الترجمة من api.alquran.cloud ==============
export async function getTranslationFromAlquranCloud(
  ayahNumber: number,
  edition: string
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/${edition}`
    );
    const data = await res.json();
    if (data.data && data.data.length > 0 && data.data[0].text) {
      return data.data[0].text;
    }
    return "";
  } catch {
    return "";
  }
}

// ============== جلب الكلمات والترجمة من api.quran.com ==============
export async function getWords(
  verseKey: string,
  language: "en" | "tr" = "en"
): Promise<{ word: string; translation: string }[]> {
  const translationsMap: Record<string, number> = {
    en: 85,  // English (Mohsin Khan)
    tr: 77,  // Turkish (Diyanet)
  };
  const translationId = translationsMap[language];
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&translations=${translationId}`
    );
    const data = await res.json();
    if (!data.verse || !data.verse.words) return [];
    return data.verse.words.map((w: any) => ({
      word: w.text_uthmani,
      translation: w.translation?.text || "",
    }));
  } catch {
    return [];
  }
}

// ============== جلب التفسير من api.quran.com (تفسير الجلالين - رقم 2) ==============
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