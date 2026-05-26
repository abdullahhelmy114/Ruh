// src/app/api/ai/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message || "OpenRouter error" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}