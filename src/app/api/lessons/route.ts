export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const lessons = await sql`
      SELECT l.*, c.title as course_title
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.status = ${status}
      ORDER BY l.created_at DESC
    `;

    return NextResponse.json({ lessons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}