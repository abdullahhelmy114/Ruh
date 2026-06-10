import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// GET /api/bundles – عرض الحزم المتاحة
export async function GET() {
  const result = await sql`
    SELECT id, title, description, price, course_ids, created_at
    FROM bundles
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ bundles: result || [] });
}