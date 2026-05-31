export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { title, body } = await request.json();
    if (!title || !body) return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });

    // إدراج إشعار لجميع المستخدمين
    const users = await sql`SELECT firebase_uid FROM profiles WHERE email_verified = true`;
    for (const user of users) {
      await sql`INSERT INTO notifications (user_uid, message, link) VALUES (${user.firebase_uid}, ${title + ': ' + body}, '/dashboard')`;
    }

    return NextResponse.json({ success: true, count: users.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}