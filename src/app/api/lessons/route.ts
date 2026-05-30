export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { courseId, title, type, scheduledAt, teacherUid } = body;

    if (!courseId || !title || !teacherUid) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, title, teacherUid' },
        { status: 400 }
      );
    }

    // تحقق سريع من ملكية الكورس
    const [course] = await sql`
      SELECT id FROM courses WHERE id = ${courseId} AND teacher_uid = ${teacherUid}
    `;
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or you do not own this course' },
        { status: 403 }
      );
    }

    const [lesson] = await sql`
      INSERT INTO lessons (course_id, title, type, scheduled_at, teacher_uid, status)
      VALUES (${courseId}, ${title}, ${type}, ${scheduledAt || null}, ${teacherUid}, 'pending')
      RETURNING id, title, status
    `;

    return NextResponse.json({ lesson, message: 'Lesson submitted for review' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}