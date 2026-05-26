export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET() {
  try {
    const courses = await sql`
      SELECT c.id, c.title, c.level, c.price, c.status,
             (SELECT full_name FROM profiles WHERE firebase_uid = c.teacher_uid) AS teacher_name
      FROM courses c
      WHERE c.status = 'published'
      ORDER BY c.created_at DESC
    `;
    return NextResponse.json({ courses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}