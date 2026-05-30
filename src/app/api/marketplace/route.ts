export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const level = searchParams.get('level') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const courses = await sql`
    SELECT c.*, p.full_name AS teacher_name
    FROM courses c
    JOIN profiles p ON c.teacher_uid = p.firebase_uid
    WHERE c.status = 'published'
    ${search ? sql`AND (c.title ILIKE ${'%' + search + '%'} OR c.description ILIKE ${'%' + search + '%'})` : sql``}
    ${level ? sql`AND c.level = ${level}` : sql``}
    ${minPrice ? sql`AND c.price >= ${parseInt(minPrice)}` : sql``}
    ${maxPrice ? sql`AND c.price <= ${parseInt(maxPrice)}` : sql``}
    ORDER BY c.created_at DESC
  `;

  return NextResponse.json({ courses });
}