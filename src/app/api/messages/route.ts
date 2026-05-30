export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getAdminApp } from '@/lib/firebase/admin';
import { getMessaging } from 'firebase-admin/messaging';

// POST: إرسال رسالة جديدة
export async function POST(request: Request) {
  try {
    const { senderUid, receiverUid, message } = await request.json();
    if (!senderUid || !receiverUid || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO messages (sender_uid, receiver_uid, message)
      VALUES (${senderUid}, ${receiverUid}, ${message})
    `;

    // إرسال إشعار للمستقبل
    const [receiver] = await sql`SELECT fcm_token FROM profiles WHERE firebase_uid = ${receiverUid}`;
    if (receiver?.fcm_token) {
      try {
        await getMessaging(getAdminApp()).send({
          token: receiver.fcm_token,
          notification: {
            title: 'New Message',
            body: message.slice(0, 100),
          },
        });
      } catch (e) {
        // قد يكون الرمز منتهي الصلاحية – نتجاهل
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: جلب رسائل المستخدم الحالي (المستقبل)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

  try {
    const messages = await sql`
      SELECT m.*, s.full_name AS sender_name, s.avatar_url AS sender_avatar
      FROM messages m
      JOIN profiles s ON m.sender_uid = s.firebase_uid
      WHERE m.receiver_uid = ${uid}
      ORDER BY m.created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}