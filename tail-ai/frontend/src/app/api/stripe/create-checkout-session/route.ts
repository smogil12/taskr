import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getStripeProductId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating checkout session...');
    console.log('🔍 Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 Stripe secret key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));
    
    const { userId, userEmail } = await request.json();
    console.log('🔍 User data:', { userId, userEmail });

    if (!userId || !userEmail) {
      console.log('❌ Missing user data');
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Create a price dynamically for test mode
    console.log('🔍 Creating price for test mode...');
    const price = await stripe.prices.create({
      unit_amount: 1000, // $10.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: 'Pro Plan',
      },
    });
    console.log('🔍 Created price:', price.id);

    // Create a checkout session
    console.log('🔍 Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
             success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}&payment_completed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    console.error('❌ Error details:', error.message);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    );
  }
}
