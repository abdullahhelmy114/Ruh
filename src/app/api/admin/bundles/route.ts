import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(req: Request) {
  try {
    const { title, description, price, course_ids } = await req.json();
    if (!Array.isArray(course_ids) || course_ids.length !== 3) {
      return NextResponse.json({ error: 'يجب اختيار 3 كورسات' }, { status: 400 });
    }

    await sql`
      INSERT INTO bundles (title, description, price, course_ids)
      VALUES (${title}, ${description}, ${price}, ${JSON.stringify(course_ids)})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}