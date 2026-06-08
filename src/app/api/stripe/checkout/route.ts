import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const { courseId, courseName, price, userId } = await request.json();
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: courseName },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.COOLIFY_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}&userId=${userId}`,
      cancel_url: `${process.env.COOLIFY_URL}/marketplace`,
      metadata: { courseId, userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}