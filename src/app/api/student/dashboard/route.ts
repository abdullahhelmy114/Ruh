export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  try {
    const [profile] = await sql`SELECT full_name, email, referral_code, referral_count, credits FROM profiles WHERE firebase_uid = ${uid} AND role = 'student'`;
    if (!profile) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const inProgress = await sql`
      SELECT c.id AS course_id, c.title, p.progress_percent,
             (SELECT l.title FROM lessons l WHERE l.course_id = c.id ORDER BY l.order_index LIMIT 1 OFFSET FLOOR((p.progress_percent / 100.0) * (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)) - 1) AS next_lesson
      FROM progress p JOIN courses c ON p.course_id = c.id
      WHERE p.user_uid = ${uid} AND p.completed = false
      ORDER BY p.updated_at DESC
    `;

    const completed = await sql`
      SELECT c.title, p.completed_at FROM progress p JOIN courses c ON p.course_id = c.id
      WHERE p.user_uid = ${uid} AND p.completed = true ORDER BY p.completed_at DESC
    `;

    const sessions = await sql`
      SELECT l.id, l.title, l.scheduled_at, l.meeting_url, l.course_id, c.title AS course_title,
             t.full_name AS teacher_name
      FROM lessons l JOIN courses c ON l.course_id = c.id
      LEFT JOIN profiles t ON l.teacher_uid = t.firebase_uid
      WHERE l.type = 'zoom' AND l.status = 'approved' AND l.scheduled_at > NOW() - INTERVAL '1 hour'
      ORDER BY l.scheduled_at ASC
    `;

    return NextResponse.json({
      firstName: profile.full_name || profile.email.split('@')[0],
      streak: 0,
      inProgress: inProgress.map((c: any) => ({
        title: c.title, next: c.next_lesson || 'Start course', progress: c.progress_percent, courseId: c.course_id
      })),
      completed: completed.map((c: any) => ({
        title: c.title, date: new Date(c.completed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      })),
      referral: {
        code: profile.referral_code || `ruhulqudus.net/r/${uid.slice(0,6)}`,
        count: profile.referral_count || 0,
        credits: profile.credits || 0,
      },
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}