export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET() {
  try {
    const applications = await sql`
      SELECT id, full_name, email, country, years_experience, specialization, applied_at, cv_url, status
      FROM teacher_applications WHERE status = 'pending'
      ORDER BY applied_at DESC
    `;
    return NextResponse.json({ applications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}