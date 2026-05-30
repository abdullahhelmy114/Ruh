export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { sendEmail } from '@/lib/email';   // ✅ أضف هذا

export async function POST(request: Request) {
  try {
    const { userId, courseId } = await request.json();
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    await sql`
      INSERT INTO enrollments (user_uid, course_id) VALUES (${userId}, ${courseId})
      ON CONFLICT (user_uid, course_id) DO NOTHING
    `;

    // ✅ جلب بيانات المستخدم والكورس للإيميل
    const [user] = await sql`SELECT email, full_name FROM profiles WHERE firebase_uid = ${userId}`;
    const [course] = await sql`SELECT title FROM courses WHERE id = ${courseId}`;

    if (user && course) {
      await sendEmail(
        user.email,
        `Enrolled: ${course.title}`,
        `<p>Dear ${user.full_name},</p><p>You have successfully enrolled in <strong>${course.title}</strong>.</p>`
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}