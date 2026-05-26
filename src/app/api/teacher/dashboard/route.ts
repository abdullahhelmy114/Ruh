export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const uid = new URL(request.url).searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  try {
    const [profile] = await sql`
      SELECT full_name, email
      FROM profiles WHERE firebase_uid = ${uid} AND role = 'teacher'
    `;
    if (!profile) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    // عدد الكورسات النشطة فقط (بدون إيرادات)
    const [stats] = await sql`
      SELECT COUNT(*) AS active_courses
      FROM courses WHERE teacher_uid = ${uid} AND status = 'published'
    `;

    const sessions = await sql`
      SELECT l.id, l.title, l.scheduled_at, l.meeting_url, l.course_id, c.title AS course_title
      FROM lessons l JOIN courses c ON l.course_id = c.id
      WHERE l.teacher_uid = ${uid} AND l.type = 'zoom' AND l.status = 'approved' AND l.scheduled_at > NOW() - INTERVAL '1 hour'
      ORDER BY l.scheduled_at ASC
    `;

    return NextResponse.json({
      fullName: profile.full_name || 'Teacher',
      initial: (profile.full_name || 'T').charAt(0).toUpperCase(),
      certificationProgress: 0,
      students: 0,
      activeCourses: stats?.active_courses || 0,
      revenue: 0, // مؤقتاً حتى تجهيز جدول transactions
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}