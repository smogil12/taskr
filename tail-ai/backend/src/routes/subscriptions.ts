import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../index';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Apply authentication to all routes
router.use(authenticateToken);

// Get current subscription status
router.get('/status', async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        subscriptionTier: true,
        subscriptionEnds: true,
        stripeCustomerId: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isExpired = user.subscriptionEnds && user.subscriptionEnds < new Date();
    const currentTier = isExpired ? 'FREE' : user.subscriptionTier;

    return res.json({
      subscription: {
        tier: currentTier,
        isExpired,
        expiresAt: user.subscriptionEnds,
        projectCount: user._count.projects,
        projectLimit: currentTier === 'FREE' ? 4 : 'Unlimited',
        canCreateProject: currentTier === 'FREE' ? user._count.projects < 4 : true,
      },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Create checkout session for subscription upgrade
router.post('/create-checkout-session', async (req: any, res: any) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: 'Price ID, success URL, and cancel URL are required' 
      });
    }

    // Get or create Stripe customer
    let customerId = (req.user as any).stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user!.email,
        name: req.user!.name,
        metadata: {
          userId: req.user!.id,
        },
      });

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { stripeCustomerId: customer.id },
      });

      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user!.id,
      },
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session for subscription management
router.post('/create-portal-session', async (req: any, res: any) => {
  try {
    const { returnUrl } = req.body;

    if (!returnUrl) {
      return res.status(400).json({ error: 'Return URL is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Webhook handler for Stripe events (this would be called by Stripe)
router.post('/webhook', async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper functions for webhook handling
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id;
  let tier: 'PRO' | 'ENTERPRISE' = 'PRO';

  if (priceId === process.env.STRIPE_PRICE_ID_ENTERPRISE) {
    tier = 'ENTERPRISE';
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionId: subscription.id,
      subscriptionEnds: new Date((subscription as any).current_period_end * 1000),
    },
  });
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionId: null,
      subscriptionEnds: null,
    },
  });
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  const userId = (invoice.metadata as any)?.userId;
  if (!userId) return;

  // Extend subscription period
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionEnds: new Date((subscription as any).current_period_end * 1000),
      },
    });
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  const userId = (invoice.metadata as any)?.userId;
  if (!userId) return;

  // Could implement retry logic or downgrade user
  console.log(`Payment failed for user ${userId}, invoice ${invoice.id}`);
}

// Get subscription plans
router.get('/plans', async (req: any, res: any) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          'Up to 4 projects',
          'Basic time tracking',
          'Task management',
          'Email support',
        ],
        projectLimit: 4,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        features: [
          'Unlimited projects',
          'Advanced time tracking',
          'Team collaboration',
          'Analytics & reports',
          'Priority support',
        ],
        projectLimit: 'Unlimited',
        stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 29.99,
        features: [
          'Everything in Pro',
          'Advanced team management',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantees',
        ],
        projectLimit: 'Unlimited',
        stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
      },
    ];

    return res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

export default router;

