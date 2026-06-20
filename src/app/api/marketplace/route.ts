import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let query = sql`
    SELECT lc.id, lc.title, lc.description, lc.level, lc.price,
           lc.lessons_count, lc.status, lc.teacher_id,
           p.full_name AS teacher_name, p.firebase_uid AS teacher_uid
    FROM live_courses lc
    JOIN profiles p ON lc.teacher_id = p.id
    WHERE lc.status = 'active'
  `;

  if (level) query = sql`${query} AND lc.level = ${level}`;
  if (search) query = sql`${query} AND lc.title ILIKE ${'%' + search + '%'}`;
  if (minPrice) query = sql`${query} AND lc.price >= ${parseFloat(minPrice)}`;
  if (maxPrice) query = sql`${query} AND lc.price <= ${parseFloat(maxPrice)}`;

  const courses = await query;
  return NextResponse.json({ courses });
}