export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    await sendEmail(
      'yeni.hayat2026@gmail.com',
      'Test from Ruhulqudus',
      '<h1>It works!</h1>'
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}