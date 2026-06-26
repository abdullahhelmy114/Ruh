export const runtime = 'nodejs';

import { getAdminAuth } from "@/lib/firebase/admin";
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });

    const trimmedCode = code.trim(); // إزالة المسافات

    const records = await sql`
      SELECT vc.id, vc.email_code, vc.expires_at, u.firebase_uid, u.role
      FROM verification_codes vc
      JOIN profiles u ON vc.user_uid = u.firebase_uid
      WHERE LOWER(u.email) = LOWER(${email})
        AND vc.email_code = ${trimmedCode}
        AND vc.expires_at > NOW()
      ORDER BY vc.created_at DESC
      LIMIT 1
    `;

    if (records.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const { firebase_uid, role } = records[0];

    // 🔥 تفعيل الطالب فقط، أما المعلم فيبقى pending حتى يوافق عليه الإدمن
    if (role === 'student') {
      await sql`UPDATE profiles SET status = 'active' WHERE firebase_uid = ${firebase_uid}`;
    }

    // 🔥 هذا السطر يخبر فايربيز أن الإيميل تم تأكيده نهائياً للطالب والمعلم 🔥
    await getAdminAuth().updateUser(firebase_uid, {
      emailVerified: true,
    });

    // حذف رمز التحقق لأنه تم استخدامه بنجاح
    await sql`DELETE FROM verification_codes WHERE user_uid = ${firebase_uid}`;

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}