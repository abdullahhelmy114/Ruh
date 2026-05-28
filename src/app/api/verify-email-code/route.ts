export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });

    // البحث عن الكود الصحيح وغير المنتهي الصلاحية
    const [record] = await sql`
      SELECT * FROM email_verifications
      WHERE email = ${email} AND code = ${code} AND expires_at > NOW()
    `;

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // تحديث حالة التحقق في جدول profiles
    await sql`UPDATE profiles SET email_verified = true WHERE email = ${email}`;

    // حذف الكود المستخدم
    await sql`DELETE FROM email_verifications WHERE id = ${record.id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}