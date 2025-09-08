import Stripe from 'stripe';
import { stripeConfig } from './stripe-config';

// Server-side Stripe instance
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_secret_key_here',
  {
    apiVersion: '2023-10-16',
    typescript: true,
  }
);

// Client-side Stripe instance
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';
};

export const getStripeProductId = () => {
  return process.env.STRIPE_PRODUCT_ID || 'prod_RSpk9sbDrDqZSu';
};
