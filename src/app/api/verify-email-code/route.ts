export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });

    // البحث عن رمز صالح باستخدام LOWER للمقارنة
    const records = await sql`
      SELECT vc.id, vc.email_code, vc.expires_at, u.uid, u.role
      FROM verification_codes vc
      JOIN users u ON vc.user_uid = u.uid
      WHERE LOWER(u.email) = LOWER(${email})
        AND vc.email_code = ${code}
        AND vc.expires_at > NOW()
      ORDER BY vc.created_at DESC
      LIMIT 1
    `;

    if (records.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const { uid, role } = records[0];

    // تحديث حالة المستخدم حسب دوره
    if (role === 'student') {
      await sql`UPDATE users SET is_verified = TRUE, status = 'active' WHERE uid = ${uid}`;
    } else if (role === 'teacher') {
      await sql`UPDATE users SET is_verified = TRUE WHERE uid = ${uid}`;
    } else {
      await sql`UPDATE users SET is_verified = TRUE WHERE uid = ${uid}`;
    }

    // حذف جميع رموز هذا المستخدم
    await sql`DELETE FROM verification_codes WHERE user_uid = ${uid}`;

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}