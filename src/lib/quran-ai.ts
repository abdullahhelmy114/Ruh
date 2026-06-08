// src/lib/quran-ai.ts

interface MCPResponse {
  result?: {
    content?: { type: string; text: string }[];
  };
  error?: { message: string };
}

async function callTool(toolName: string, args: Record<string, any>): Promise<any> {
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
    throw new Error(`MCP request failed: ${response.statusText}`);
  }

  const json: MCPResponse = await response.json();
  if (json.error) {
    throw new Error(json.error.message);
  }

  // النص عادةً JSON string داخل content[0].text
  const text = json.result?.content?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // بعض الأدوات قد ترجع نصًا عاديًا
    return text;
  }
}

export interface WordMorphology {
  word: string;
  root?: string;
  lemma?: string;
  pos?: string;
  features?: string; // description
}

export async function getWordMorphology(surah: number, ayah: number): Promise<WordMorphology[]> {
  // tool name may be "word_morphology" or "morphology"
  return callTool("word_morphology", { surah_number: surah, ayah_number: ayah });
}

export async function getTranslation(
  surah: number,
  ayah: number,
  language: "en" | "tr"
): Promise<string> {
  // استخدم الترجمة المدمجة: للتركية "tr.diyanet" أو "tr.abdulbakigolpinarli"
  // للانجليزية "en.sahih" أو "en.abdelhaleem"
  const translationKey = language === "en" ? "en.abdelhaleem" : "tr.diyanet";
  const result = await callTool("fetch_translation", {
    surah_number: surah,
    ayah_number: ayah,
    translation_key: translationKey,
  });
  // النتيجة عادةً تحتوي على حقل `text`
  return result?.text || result?.translation || "";
}
// أضف هذه الدالة في ملف lib/quran-ai.ts
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
  return result?.text || result?.tafsir || "";
}