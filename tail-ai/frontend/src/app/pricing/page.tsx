'use client';

import { useState, useEffect, Suspense } from 'react';
import { PricingCard } from '@/components/stripe/pricing-card';
import { UserTier, userTiers } from '@/lib/stripe-config';
import { User } from '@/lib/user-tiers';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

function PricingPageContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const searchParams = useSearchParams();

  // Check for URL parameters and show messages
  useEffect(() => {
    const canceled = searchParams.get('canceled');
    const success = searchParams.get('success');
    
    if (canceled === 'true') {
      setMessage({ type: 'error', text: 'Payment was canceled. You can try again anytime.' });
      // Clear URL parameters
      window.history.replaceState({}, '', '/pricing');
    } else if (success === 'true') {
      setMessage({ type: 'success', text: 'Payment successful! Welcome to Pro!' });
      // Clear URL parameters
      window.history.replaceState({}, '', '/pricing');
    }
  }, [searchParams]);

  // Mock user data - replace with actual user data from your auth system
  useEffect(() => {
    // TODO: Replace with actual user data fetching
    setCurrentUser({
      id: 'user_123',
      email: 'user@example.com',
      tier: 'FREE',
      projectCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }, []);

  const handleUpgrade = async (tier: UserTier) => {
    if (tier === 'FREE') {
      // Handle downgrade to free
      setIsLoading(true);
      try {
        // TODO: Implement downgrade logic
        console.log('Downgrading to free tier');
      } catch (error) {
        console.error('Error downgrading:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (tier === 'PAID') {
      // Handle upgrade to paid - redirect to Stripe checkout
      setIsLoading(true);
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser?.id || 'user_123',
            userEmail: currentUser?.email || 'user@example.com',
          }),
        });

        const { sessionId, error } = await response.json();
        console.log('🔍 API Response:', { sessionId, error });

        if (error) {
          console.error('❌ API Error:', error);
          throw new Error(error);
        }

        // Redirect to Stripe checkout
        const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) => 
          loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OpxBKGdupOTn3w9DZ0ebYoDVVLSpIY4XqflshG0jDPuHJVaAcFBP4ud1pztbAu8Gbg6d8AiXkR8VS6iXaytK06p00jxDtc3CP')
        );
        
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

      } catch (error) {
        console.error('Checkout error:', error);
        setMessage({ 
          type: 'error', 
          text: 'Error starting checkout: ' + (error instanceof Error ? error.message : 'Unknown error') 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <MainLayout>
      <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Start free, upgrade when you need more power
          </p>
        </div>

        {/* Message Display */}
        {message.type && (
          <div className={`mt-8 max-w-2xl mx-auto p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {message.type === 'success' ? '✅' : '❌'}
                </span>
                <span className="font-medium">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage({ type: null, text: '' })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Free
              </h3>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
              </div>
              
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Perfect for getting started
              </p>
            </div>
            
            <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Basic project management</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">4 projects max</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Community support</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <Button 
                disabled 
                className="w-full"
                variant="outline"
              >
                Current Plan
              </Button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border border-blue-500 bg-blue-50 dark:bg-blue-950/20 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pro
              </h3>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$10.00</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Unlock unlimited potential
              </p>
            </div>
            
            <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Unlimited projects</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Priority support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Custom integrations</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <Button
                onClick={() => handleUpgrade('PAID')}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What happens to my projects?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your projects are always safe. When you hit the limit, you'll be prompted to upgrade.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                The free plan is our trial! You can create up to 4 projects at no cost.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <PricingPageContent />
    </Suspense>
  );
}
