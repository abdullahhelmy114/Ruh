import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  // إذا لم يكن هناك مفتاح Stripe، نتخطى بهدوء
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ skipped: true, reason: 'Stripe not configured' });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');

    if (!sessionId || !courseId || !userId) {
      return NextResponse.redirect('/marketplace');
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      await sql`
        INSERT INTO enrollments (user_uid, course_id) VALUES (${userId}, ${courseId})
        ON CONFLICT DO NOTHING
      `;

      const [user] = await sql`SELECT email, full_name FROM profiles WHERE firebase_uid = ${userId}`;
      const [course] = await sql`SELECT title FROM courses WHERE id = ${courseId}`;

      if (user && course) {
        await sendEmail(
          user.email,
          `Purchase Confirmed: ${course.title}`,
          `<p>Dear ${user.full_name},</p><p>Your payment for <strong>${course.title}</strong> was successful.</p>`
        );
      }
    }

    return NextResponse.redirect(`/dashboard/student/courses/${courseId}`);
  } catch (e: any) {
    return NextResponse.redirect('/marketplace');
  }
}