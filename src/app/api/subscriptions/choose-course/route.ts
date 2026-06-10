import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(req: Request) {
  try {
    const { course_id } = await req.json();
    const userId = getUserIdFromSession(); // Placeholder

    // البحث عن اشتراك نشط
    const subResult = await sql`
      SELECT id, max_courses, courses_used FROM subscriptions 
      WHERE user_id = ${userId} AND expires_at > NOW() 
      LIMIT 1
    `;
    if (subResult.length === 0) {
      return NextResponse.json({ error: 'لا اشتراك نشط' }, { status: 403 });
    }

    const subscription = subResult[0];
    if (subscription.courses_used >= subscription.max_courses) {
      return NextResponse.json({ error: 'وصلت للحد الأقصى' }, { status: 400 });
    }

    // إضافة الكورس للاشتراك
    await sql`
      INSERT INTO subscription_courses (subscription_id, course_id) 
      VALUES (${subscription.id}, ${course_id})
    `;
    // زيادة العداد
    await sql`
      UPDATE subscriptions SET courses_used = courses_used + 1 WHERE id = ${subscription.id}
    `;
    // تسجيل الطالب في الكورس
    await sql`
      INSERT INTO enrollments (user_id, course_id) VALUES (${userId}, ${course_id})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ' }, { status: 500 });
  }
}

// Placeholder – استبدلها بالجلسة الفعلية
function getUserIdFromSession() {
  return null;
}