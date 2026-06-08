// src/lib/quran-ai.ts
interface MCPResponse {
  result?: { content?: { type: string; text: string }[] };
  error?: { message: string };
}

async function callTool(toolName: string, args: Record<string, any>): Promise<any> {
  const response = await fetch("https://mcp.quran.ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: toolName, arguments: args },
      id: 1,
    }),
  });

  if (!response.ok) throw new Error(`MCP request failed: ${response.statusText}`);

  const json: MCPResponse = await response.json();
  if (json.error) throw new Error(json.error.message);

  const text = json.result?.content?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getWordMorphology(surah: number, ayah: number) {
  return callTool("word_morphology", { surah_number: surah, ayah_number: ayah });
}

export async function getTranslation(
  surah: number,
  ayah: number,
  language: "en" | "tr"
): Promise<string> {
  const translationKey = language === "en" ? "en.abdelhaleem" : "tr.diyanet";
  const result = await callTool("fetch_translation", {
    surah_number: surah,
    ayah_number: ayah,
    translation_key: translationKey,
  });
  // النتيجة قد تكون نصاً مباشراً أو حقل `text`
  return result?.text || result?.translation || result || "";
}

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