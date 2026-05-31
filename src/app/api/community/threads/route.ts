export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// GET: جلب كل الثريدات
export async function GET() {
  try {
    const threads = await sql`
      SELECT t.*, p.full_name AS author_name, p.avatar_url
      FROM community_threads t
      JOIN profiles p ON t.author_uid = p.firebase_uid
      ORDER BY t.created_at DESC
    `;
    return NextResponse.json({ threads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: إنشاء ثريد جديد
export async function POST(request: Request) {
  try {
    const { authorUid, title, content } = await request.json();
    if (!authorUid || !title || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const [thread] = await sql`
      INSERT INTO community_threads (author_uid, title, content)
      VALUES (${authorUid}, ${title}, ${content})
      RETURNING id, title, created_at
    `;
    return NextResponse.json({ thread });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: حذف ثريد (للأدمن أو صاحب الثريد)
export async function DELETE(request: Request) {
  try {
    const { threadId, userUid, isAdmin } = await request.json();
    if (!threadId || !userUid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (isAdmin) {
      await sql`DELETE FROM community_threads WHERE id = ${threadId}`;
    } else {
      await sql`DELETE FROM community_threads WHERE id = ${threadId} AND author_uid = ${userUid}`;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}