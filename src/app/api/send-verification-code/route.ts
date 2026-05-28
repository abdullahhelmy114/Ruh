export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    // إنشاء كود عشوائي من 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // صالح لمدة 15 دقيقة

    // حذف أي كود سابق لنفس البريد
    await sql`DELETE FROM email_verifications WHERE email = ${email}`;

    // تخزين الكود الجديد
    await sql`INSERT INTO email_verifications (email, code, expires_at) VALUES (${email}, ${code}, ${expiresAt})`;

    // إرسال الكود عبر البريد
    await sendEmail(
      email,
      'Your Verification Code',
      `<div style="text-align:center;font-family:sans-serif;">
        <h2>Your verification code is</h2>
        <h1 style="font-size:48px;letter-spacing:8px;color:#d4af37;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
      </div>`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
  console.error(error);
  return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
}
}