export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  try {
    const [course] = await sql`
      SELECT c.*, p.full_name AS teacher_name
      FROM courses c
      JOIN profiles p ON c.teacher_uid = p.firebase_uid
      WHERE c.id = ${courseId}
    `;

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    const lessons = await sql`
      SELECT id, title, type, recording_url
      FROM lessons WHERE course_id = ${courseId} AND status = 'approved'
      ORDER BY created_at ASC
    `;

    return NextResponse.json({ course: { ...course, lessons } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}