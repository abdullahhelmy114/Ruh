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

// POST: إنشاء ملف شخصي جديد (ويُستخدم أيضًا من صفحة التسجيل)
export async function POST(request: Request) {
  try {
    const { uid, email, fullName, role } = await request.json();
    if (!uid || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await sql`
      INSERT INTO profiles (firebase_uid, email, full_name, role, email_verified)
      VALUES (${uid}, ${email}, ${fullName || email.split('@')[0]}, ${role || 'student'}, false)
      ON CONFLICT (firebase_uid) DO UPDATE SET email = ${email}
    `;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}