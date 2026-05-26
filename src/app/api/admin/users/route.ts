export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, full_name, email, role, plan, status, created_at FROM profiles ORDER BY created_at DESC
    `;
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}