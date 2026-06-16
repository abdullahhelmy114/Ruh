export const runtime = 'nodejs'; // أفضل من edge لتجنب مشاكل التوافق

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  try {
    // 1. بيانات المستخدم
    const [user] = await sql`
      SELECT first_name, last_name, email, referral_code, referral_count, credits
      FROM users WHERE uid = ${uid} AND role = 'student'
    `;
    if (!user) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const firstName = user.first_name || user.email.split('@')[0];

    // 2. الكورسات قيد التقدم (باستخدام جدول enrollments و lessons)
    const inProgress = await sql`
      SELECT c.id AS course_id, c.title,
             COALESCE(e.completed_lessons, 0) AS completed_lessons,
             COALESCE(e.total_lessons, 0) AS total_lessons,
             CASE WHEN e.total_lessons > 0 THEN ROUND((e.completed_lessons::numeric / e.total_lessons) * 100) ELSE 0 END AS progress_percent,
             (SELECT l.title FROM lessons l WHERE l.course_id = c.id ORDER BY l.order_index ASC LIMIT 1 OFFSET COALESCE(e.completed_lessons, 0)) AS next_lesson
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_uid = ${uid} AND e.completed = false
      ORDER BY e.enrolled_at DESC
    `;

    // 3. الكورسات المكتملة
    const completed = await sql`
      SELECT c.title, e.completed_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_uid = ${uid} AND e.completed = true
      ORDER BY e.completed_at DESC
    `;

    // 4. الجلسات المباشرة القادمة (لجميع كورسات الطالب)
    const sessions = await sql`
      SELECT l.id, l.title, l.scheduled_at, l.meeting_url, l.course_id,
             c.title AS course_title,
             CONCAT(t.first_name, ' ', t.last_name) AS teacher_name
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      JOIN users t ON l.teacher_uid = t.uid
      WHERE l.type = 'zoom' AND l.status = 'approved' AND l.scheduled_at IS NOT NULL
        AND c.id IN (SELECT course_id FROM enrollments WHERE user_uid = ${uid})
      ORDER BY l.scheduled_at ASC
    `;

    return NextResponse.json({
      firstName,
      streak: 0, // يمكن حساب الـ streak لاحقاً
      inProgress: inProgress.map((c: any) => ({
        title: c.title,
        next: c.next_lesson || 'Start course',
        progress: c.progress_percent,
        courseId: c.course_id,
      })),
      completed: completed.map((c: any) => ({
        title: c.title,
        date: new Date(c.completed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      })),
      referral: {
        code: user.referral_code || `ruhulqudus.net/r/${uid.slice(0, 6)}`,
        count: user.referral_count || 0,
        credits: user.credits || 0,
      },
      sessions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}