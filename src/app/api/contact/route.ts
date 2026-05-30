export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email, message, captchaToken } = await request.json();
    if (!name || !email || !message || !captchaToken) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // إرسال الإيميل للإدارة
    await sendEmail(
      'info@ruhulqudus.com',
      `New Contact Message from ${name}`,
      `<p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Message:</strong></p>
       <p>${message}</p>`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}