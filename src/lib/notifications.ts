// lib/notifications.ts
import { sql } from '@/lib/db/client';

/**
 * حفظ إشعار جديد في قاعدة البيانات
 */
export async function createNotification(
  userUid: string,
  message: string,
  link?: string
) {
  try {
    await sql`
      INSERT INTO notifications (user_uid, message, link)
      VALUES (${userUid}, ${message}, ${link || null})
    `;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// ============================================================
// مكان لإرسال الإشعارات الخارجية مستقبلاً
// (مثل واتساب، SMS، Push Notifications...)
// ============================================================
// export async function sendWhatsAppMessage(...) { ... }
// export async function sendPushNotification(...) { ... }