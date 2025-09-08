import Stripe from 'stripe';
import { stripeConfig } from './stripe-config';

// Server-side Stripe instance
export const stripe = new Stripe(
  process.env.NODE_ENV === 'production' 
    ? stripeConfig.production.secretKey 
    : stripeConfig.development.secretKey,
  {
    apiVersion: '2023-10-16',
    typescript: true,
  }
);

// Client-side Stripe instance
export const getStripePublishableKey = () => {
  return process.env.NODE_ENV === 'production' 
    ? stripeConfig.production.publishableKey 
    : stripeConfig.development.publishableKey;
};

export const getStripeProductId = () => {
  return process.env.NODE_ENV === 'production' 
    ? stripeConfig.production.productId 
    : stripeConfig.development.productId;
};
