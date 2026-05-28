export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { uid, courseId, captchaToken } = await request.json();
    if (!uid || !courseId) return NextResponse.json({ error: 'Missing uid or courseId' }, { status: 400 });

    // التحقق من reCAPTCHA
    const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    });
    const recaptchaData = await recaptchaRes.json();
    if (!recaptchaData.success) {
      return NextResponse.json({ error: 'Captcha failed' }, { status: 400 });
    }

    // التسجيل في الكورس
    await sql`INSERT INTO enrollments (user_uid, course_id) VALUES (${uid}, ${courseId}) ON CONFLICT DO NOTHING`;

    // جلب بيانات المستخدم والكورس للإيميل
    const [user] = await sql`SELECT email, full_name FROM profiles WHERE firebase_uid = ${uid}`;
    const [course] = await sql`SELECT title FROM courses WHERE id = ${courseId}`;

    if (user?.email) {
      await sendEmail(
        user.email,
        `Enrolled: ${course?.title || 'Course'}`,
        `<h1>You're enrolled!</h1>
         <p>Hi ${user.full_name || 'Student'},</p>
         <p>You've successfully enrolled in <strong>${course?.title || 'the course'}</strong>.</p>
         <p><a href="https://ruhulqudus.net/dashboard/student">Go to Dashboard</a></p>`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}