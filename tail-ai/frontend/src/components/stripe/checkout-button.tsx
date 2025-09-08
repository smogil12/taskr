'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { getStripePublishableKey } from '@/lib/stripe';

interface CheckoutButtonProps {
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CheckoutButton({ userId, userEmail, onSuccess, onError }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Initialize Stripe
      const stripe = await loadStripe(getStripePublishableKey());
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Redirect to checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isLoading ? 'Processing...' : 'Upgrade to Pro - $9.99/month'}
    </Button>
  );
}
