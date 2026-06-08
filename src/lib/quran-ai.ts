// src/lib/quran-ai.ts

/**
 * واجهة استجابة MCP القياسية
 */
interface MCPResponse {
  result?: {
    content?: { type: string; text: string }[];
  };
  error?: { message: string };
}

/**
 * دالة مساعدة لاستدعاء أدوات MCP (Model Context Protocol) من quran.ai
 */
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

    // محتوى الرد يكون عادةً JSON stringified داخل content[0].text
    const text = json.result?.content?.[0]?.text;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      // إذا لم يكن JSON، نعيد النص مباشرة
      return text;
    }
  } catch (error) {
    console.error(`Error calling MCP tool "${toolName}":`, error);
    return null;
  }
}

/**
 * جلب التحليل الصرفي للكلمات من MCP quran.ai
 */
export async function getWordMorphology(surah: number, ayah: number): Promise<any[]> {
  const result = await callTool("word_morphology", {
    surah_number: surah,
    ayah_number: ayah,
  });
  // النتيجة المتوقعة هي مصفوفة من الكائنات { word, root, pos, features... }
  return Array.isArray(result) ? result : [];
}

/**
 * جلب التفسير من MCP quran.ai
 */
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
  // النتيجة قد تكون كائن { text: "..." } أو نص مباشر
  if (typeof result === "string") return result;
  if (result && typeof result.text === "string") return result.text;
  return "";
}

/**
 * جلب الترجمة من api.alquran.cloud (موثوقة وسريعة)
 * @param ayahNumber رقم الآية العالمي (edition key)
 * @param edition اسم النسخة (مثلاً en.asad أو tr.diyanet)
 */
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