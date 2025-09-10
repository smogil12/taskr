import Stripe from 'stripe';
import { stripeConfig } from './stripe-config';

// Server-side Stripe instance
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2023-10-16',
    typescript: true,
  }
);

// Client-side Stripe instance
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
};

export const getStripeProductId = () => {
  return process.env.STRIPE_PRODUCT_ID || 'prod_RSpk9sbDrDqZSu';
};
