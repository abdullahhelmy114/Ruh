export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// GET: جلب جميع البوستات مع عدد التعليقات والإعجابات
export async function GET() {
  try {
    const posts = await sql`
      SELECT p.*,
        (SELECT COUNT(*) FROM blog_comments WHERE post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM blog_likes WHERE post_id = p.id) AS likes_count,
        (SELECT string_agg(user_uid, ',') FROM blog_likes WHERE post_id = p.id) AS liked_by
      FROM blog_posts p
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: إنشاء بوست جديد (للأدمن فقط)
export async function POST(request: Request) {
  try {
    const { adminUid, title, content, imageUrl } = await request.json();
    if (!adminUid || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // التحقق من صلاحية الأدمن
    const [admin] = await sql`SELECT email FROM profiles WHERE firebase_uid = ${adminUid}`;
    if (!admin || (admin.email !== 'abdullahhelmy114@gmail.com' && admin.email !== 'info@ruhulqudus.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [post] = await sql`
      INSERT INTO blog_posts (admin_uid, title, content, image_url)
      VALUES (${adminUid}, ${title}, ${content}, ${imageUrl || null})
      RETURNING id, title, created_at
    `;
    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: حذف بوست (للأدمن فقط)
export async function DELETE(request: Request) {
  try {
    const { postId, adminUid } = await request.json();
    if (!postId || !adminUid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const [admin] = await sql`SELECT email FROM profiles WHERE firebase_uid = ${adminUid}`;
    if (!admin || (admin.email !== 'abdullahhelmy114@gmail.com' && admin.email !== 'info@ruhulqudus.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await sql`DELETE FROM blog_posts WHERE id = ${postId}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}