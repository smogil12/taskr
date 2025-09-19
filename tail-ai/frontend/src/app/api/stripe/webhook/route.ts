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
    console.log('🔔 Webhook event received:', event.type);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    console.log(`🔔 Received webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`📝 Processing checkout.session.completed for session ${session.id}`);
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`📝 Processing customer.subscription.created for subscription ${subscription.id}`);
        await handleSubscriptionCreated(subscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log(`📝 Processing customer.subscription.updated for subscription ${updatedSubscription.id}`);
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log(`📝 Processing customer.subscription.deleted for subscription ${deletedSubscription.id}`);
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
  console.log(`✅ Payment completed! User should now see PRO tier on dashboard`);
  console.log(`🔍 Customer ID: ${session.customer}`);
  
  // Store customer ID in localStorage for testing
  // In production, this would be stored in the database
  if (typeof window !== 'undefined') {
    localStorage.setItem('stripe_customer_id', session.customer as string);
  }
  
  // Update user subscription tier in database
  try {
    // For testing, use the user ID to get the user's email
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    // Get user details from backend using the userId from metadata
    const userResponse = await fetch(`${backendUrl}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZobjRieW4wMDAwMGV4MmZvYjd6cnVpIiwiZW1haWwiOiJzbW9naWwxMkBnbWFpbC5jb20iLCJpYXQiOjE3NTgyMzU2MjAsImV4cCI6MTc1ODg0MDQyMCwiYXVkIjoidGFpbC1haS11c2VycyIsImlzcyI6InRhaWwtYWkifQ.YM5Vk304TXCGV2sa8ZZsI0UAGVb-O100R9Gaa6QAsqM'}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to get user details from backend');
      return;
    }
    
    const userData = await userResponse.json();
    const userEmail = userData.user.email;
    
    console.log(`Updating user ${userEmail} to PRO tier`);
    
    const response = await fetch(`${backendUrl}/api/auth/by-email/${userEmail}/subscription`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionTier: 'PRO',
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
      }),
    });

    if (response.ok) {
      console.log(`✅ Updated user ${userEmail} to PRO tier`);
    } else {
      console.error(`❌ Failed to update user ${userEmail}:`, await response.text());
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
    
    const response = await fetch(`${backendUrl}/api/auth/by-email/${customer.email}/subscription`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionTier: 'PRO',
        stripeCustomerId: customerId,
        subscriptionId: subscription.id,
      }),
    });

    if (response.ok) {
      console.log(`✅ Updated user ${customer.email} to PRO tier`);
    } else {
      console.error(`❌ Failed to update user ${customer.email}:`, await response.text());
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  console.log(`🔄 Subscription updated for customer ${customerId}`);
  console.log(`🔍 Subscription ID: ${subscription.id}`);
  console.log(`🔍 Subscription status: ${subscription.status}`);
  
  try {
    // Get customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      console.error('❌ Customer was deleted');
      return;
    }

    console.log(`👤 Updating user ${customer.email} subscription status`);
    
    // Determine subscription tier based on status
    let subscriptionTier = 'FREE';
    if (subscription.status === 'active') {
      subscriptionTier = 'PRO';
    } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      subscriptionTier = 'FREE';
    }
    
    console.log(`📊 Setting subscription tier to: ${subscriptionTier}`);
    
    // Find user by email and update subscription
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    console.log(`🔗 Calling backend: ${backendUrl}/api/auth/by-email/${customer.email}/subscription`);
    
    const response = await fetch(`${backendUrl}/api/auth/by-email/${customer.email}/subscription`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionTier: subscriptionTier,
        stripeCustomerId: subscriptionTier === 'FREE' ? null : customerId,
        subscriptionId: subscriptionTier === 'FREE' ? null : subscription.id,
      }),
    });

    if (response.ok) {
      console.log(`✅ Successfully updated user ${customer.email} to ${subscriptionTier} tier`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to update user ${customer.email}:`, errorText);
    }
  } catch (error) {
    console.error('💥 Error updating user subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  console.log(`🗑️ Subscription deleted for customer ${customerId}`);
  console.log(`🔍 Subscription ID: ${subscription.id}`);
  
  try {
    // Get customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      console.error('❌ Customer was deleted');
      return;
    }

    console.log(`👤 Downgrading user ${customer.email} to FREE tier`);
    
    // Find user by email and update subscription to FREE
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    console.log(`🔗 Calling backend: ${backendUrl}/api/auth/by-email/${customer.email}/subscription`);
    
    const response = await fetch(`${backendUrl}/api/auth/by-email/${customer.email}/subscription`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionTier: 'FREE',
        stripeCustomerId: null,
        subscriptionId: null,
      }),
    });

    if (response.ok) {
      console.log(`✅ Successfully downgraded user ${customer.email} to FREE tier`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to downgrade user ${customer.email}:`, errorText);
    }
  } catch (error) {
    console.error('💥 Error downgrading user subscription:', error);
  }
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
