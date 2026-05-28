export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// GET: جلب بيانات المستخدم
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  const [profile] = await sql`SELECT * FROM profiles WHERE firebase_uid = ${uid}`;
  return NextResponse.json({ profile });
}

// POST: إنشاء ملف شخصي جديد (ويُستخدم أيضًا من صفحة التسجيل) – نسخة متسامحة
export async function POST(request: Request) {
  try {
    // استخراج البيانات بأمان، مع قبول JSON فارغ
    const body = await request.json().catch(() => ({}));
    const uid = body.uid || "";
    const email = body.email || "";

    // إذا كانت البيانات ناقصة، نتجاوز دون خطأ
    if (!uid || !email) {
      return NextResponse.json({ skipped: true });
    }

    await sql`
      INSERT INTO profiles (firebase_uid, email, full_name, role, email_verified)
      VALUES (${uid}, ${email}, ${body.fullName || email.split('@')[0]}, ${body.role || 'student'}, false)
      ON CONFLICT (firebase_uid) DO UPDATE SET email = ${email}
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}