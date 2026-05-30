export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { courseId, courseName, price, userId } = await request.json();
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