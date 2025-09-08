import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { stripeConfig } from '@/lib/stripe-config';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.NODE_ENV === 'production' 
      ? stripeConfig.production.webhookSecret 
      : stripeConfig.development.webhookSecret;

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('No user ID in session metadata');
    return;
  }

  console.log(`User ${userId} completed checkout session ${session.id}`);
  console.log(`✅ Payment completed! User should now see PAID tier on dashboard`);
  console.log(`🔍 Customer ID: ${session.customer}`);
  
  // Store customer ID in localStorage for testing
  // In production, this would be stored in the database
  if (typeof window !== 'undefined') {
    localStorage.setItem('stripe_customer_id', session.customer as string);
  }
  
  // For testing: we'll use localStorage to track payment completion
  // In production, this would update the database
  try {
    // Update user subscription tier
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/update-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        tier: 'PAID',
        customerId: session.customer
      }),
    });

    if (response.ok) {
      console.log(`✅ Updated user ${userId} to PAID tier`);
    } else {
      console.error(`❌ Failed to update user ${userId}:`, await response.text());
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer details from Stripe
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    console.error('Customer was deleted');
    return;
  }

  console.log(`Subscription created for customer ${customerId}`);
  
  try {
    // Find user by email and update subscription
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    const response = await fetch(`${backendUrl}/api/users/by-email/${customer.email}/subscription`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionTier: 'PAID',
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      }),
    });

    if (response.ok) {
      console.log(`✅ Updated user ${customer.email} to PAID tier`);
    } else {
      console.error(`❌ Failed to update user ${customer.email}:`, await response.text());
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  console.log(`Subscription updated for customer ${customerId}`);
  // TODO: Update user subscription status in database
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  console.log(`Subscription deleted for customer ${customerId}`);
  // TODO: Downgrade user to free tier in database
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  console.log(`Invoice payment succeeded for customer ${customerId}`);
  // TODO: Ensure user remains on paid tier
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  console.log(`Invoice payment failed for customer ${customerId}`);
  // TODO: Handle failed payment (maybe send notification, suspend account, etc.)
}
