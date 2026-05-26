export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { title, level, price, teacherUid } = await request.json();

    if (!title || !teacherUid) {
      return NextResponse.json({ error: 'Title and teacherUid are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO courses (teacher_uid, title, level, price, status)
      VALUES (${teacherUid}, ${title}, ${level || 'A1'}, ${price || 0}, 'pending')
      RETURNING id, title, level, price, status
    `;

    return NextResponse.json({ course: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}