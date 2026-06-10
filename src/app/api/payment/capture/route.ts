import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getPayPalAccessToken } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const { orderID, payerID, type, course_id, bundle_id, plan_id } = await req.json();

    if (!orderID || !type) {
      return NextResponse.json({ error: 'orderID and type are required' }, { status: 400 });
    }

    // 1. تأكيد الدفع عبر PayPal API
    const accessToken = await getPayPalAccessToken();
    const captureResponse = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const captureData = await captureResponse.json();

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const amount = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);

    // 2. الحصول على user_id من الجلسة
    const userId = req.headers.get('x-user-id') || (await getUserIdFromSession(req));

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. تسجيل عملية الشراء
    const purchaseResult = await sql`
      INSERT INTO purchases (user_id, type, course_id, bundle_id, subscription_id, amount, paypal_order_id, paypal_payer_id)
      VALUES (${userId}, ${type}, ${course_id || null}, ${bundle_id || null}, ${null}, ${amount}, ${orderID}, ${payerID || null})
      RETURNING id
    `;
    const purchaseId = purchaseResult[0].id;

    // 4. حسب النوع
    if (type === 'course') {
      // تسجيل في enrollments
      await sql`
        INSERT INTO enrollments (user_id, course_id)
        VALUES (${userId}, ${course_id})
      `;

      // جلب teacher_id
      const teacherRes = await sql`
        SELECT teacher_id FROM courses WHERE id = ${course_id}
      `;
      const teacherId = teacherRes[0]?.teacher_id;

      if (teacherId) {
        const commission = amount * 0.2;
        // purchase_courses
        const pcRes = await sql`
          INSERT INTO purchase_courses (purchase_id, course_id, teacher_id, amount, commission_amount)
          VALUES (${purchaseId}, ${course_id}, ${teacherId}, ${amount}, ${commission})
          RETURNING id
        `;
        const purchaseCourseId = pcRes[0].id;

        await sql`
          INSERT INTO teacher_earnings (teacher_id, purchase_course_id, amount, status)
          VALUES (${teacherId}, ${purchaseCourseId}, ${commission}, 'pending')
        `;
      }
    } else if (type === 'bundle') {
      const bundleRes = await sql`
        SELECT course_ids FROM bundles WHERE id = ${bundle_id}
      `;
      const courseIds = bundleRes[0]?.course_ids; // JSON array

      if (Array.isArray(courseIds)) {
        const courseCount = courseIds.length;
        const amountPerCourse = amount / courseCount;

        for (const cid of courseIds) {
          await sql`
            INSERT INTO enrollments (user_id, course_id)
            VALUES (${userId}, ${cid})
          `;

          const teacherRes = await sql`
            SELECT teacher_id FROM courses WHERE id = ${cid}
          `;
          const tid = teacherRes[0]?.teacher_id;

          if (tid) {
            const commission = amountPerCourse * 0.2;
            const pcRes = await sql`
              INSERT INTO purchase_courses (purchase_id, course_id, teacher_id, amount, commission_amount)
              VALUES (${purchaseId}, ${cid}, ${tid}, ${amountPerCourse}, ${commission})
              RETURNING id
            `;
            const purchaseCourseId = pcRes[0].id;

            await sql`
              INSERT INTO teacher_earnings (teacher_id, purchase_course_id, amount, status)
              VALUES (${tid}, ${purchaseCourseId}, ${commission}, 'pending')
            `;
          }
        }
      }
    } else if (type === 'subscription') {
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 3 شهور
      const subRes = await sql`
        INSERT INTO subscriptions (user_id, plan_id, expires_at, max_courses)
        VALUES (${userId}, ${plan_id}, ${expiresAt}, 3)
        RETURNING id
      `;
      const subscriptionId = subRes[0].id;

      await sql`
        UPDATE purchases SET subscription_id = ${subscriptionId} WHERE id = ${purchaseId}
      `;
    }

    return NextResponse.json({ success: true, redirect: '/payment/success' });
  } catch (error: any) {
    console.error('Capture payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// helper
async function getUserIdFromSession(req: NextRequest) {
  // Placeholder - يجب تنفيذه حسب نظام المصادقة
  return null;
}