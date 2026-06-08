export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const uid = new URL(request.url).searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  try {
    const courses = await sql`
      SELECT id, title, level, price, status
      FROM courses WHERE teacher_uid = ${uid}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ courses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}