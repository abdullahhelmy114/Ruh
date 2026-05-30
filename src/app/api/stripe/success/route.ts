export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@/lib/db/client';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('courseId');   // ✅ استخراج courseId
  const userId = searchParams.get('userId');       // ✅ استخراج userId

  if (!sessionId || !courseId || !userId) return NextResponse.redirect('/marketplace');

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      await sql`
        INSERT INTO enrollments (user_uid, course_id) VALUES (${userId}, ${courseId})
        ON CONFLICT DO NOTHING
      `;

      // إيميل تأكيد الشراء
      const [user] = await sql`SELECT email, full_name FROM profiles WHERE firebase_uid = ${userId}`;
      const [course] = await sql`SELECT title FROM courses WHERE id = ${courseId}`;

      if (user && course) {
        await sendEmail(
          user.email,
          `Purchase Confirmed: ${course.title}`,
          `<p>Dear ${user.full_name},</p><p>Your payment for <strong>${course.title}</strong> was successful. You now have full access.</p>`
        );
      }
    }
  } catch (e) {}

  return NextResponse.redirect(`/dashboard/student/courses/${courseId}`);
}