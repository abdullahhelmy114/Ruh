import { sql } from '@/lib/db/client';

export async function createNotification(userUid: string, message: string, link?: string) {
  try {
    await sql`
      INSERT INTO notifications (user_uid, message, link)
      VALUES (${userUid}, ${message}, ${link || null})
    `;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}