'use client';

import { useState, useEffect, Suspense } from 'react';
import { User } from '@/lib/user-tiers';
import { MainLayout } from '@/components/layout/main-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { useSearchParams } from 'next/navigation';

function PlansPageContent() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if payment was completed
    const paymentCompleted = searchParams.get('payment_completed');
    if (paymentCompleted === 'true') {
      localStorage.setItem('stripe_payment_completed', 'true');
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      window.history.replaceState({}, '', '/plans');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && authUser) {
      // Convert auth user to our User type
      // For testing: if user completed a payment, show them as PAID
      const isPaidUser = authUser.subscriptionTier === 'PAID' || 
                        localStorage.getItem('stripe_payment_completed') === 'true';
      
      const convertedUser: User = {
        id: authUser.id,
        email: authUser.email,
        tier: isPaidUser ? 'PAID' : 'FREE',
        projectCount: authUser._count?.projects || 0,
        stripeCustomerId: undefined, // Will be updated by webhook
        stripeSubscriptionId: undefined, // Will be updated by webhook
        createdAt: new Date(authUser.createdAt),
        updatedAt: new Date(authUser.updatedAt),
      };
      
      setUser(convertedUser);
      setIsLoading(false);
    } else if (!authLoading && !authUser) {
      setIsLoading(false);
    }
  }, [authUser, authLoading]);

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'user_123',
          userEmail: user?.email || 'user@example.com',
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
      alert('Error starting checkout: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      // For testing, use the direct portal URL you provided
      // In production, this would create a proper portal session
      const portalUrl = 'https://billing.stripe.com/p/login/test_eVqdR90Ce6dM8kqdJg9oc00';
      
      console.log('🔍 Opening customer portal:', portalUrl);
      
      // Open the portal in a new tab
      window.open(portalUrl, '_blank');
      
      // Alternative: Try to create a proper portal session first
      try {
        const customerId = localStorage.getItem('stripe_customer_id') || user?.stripeCustomerId || 'cus_test_customer';
        
        const response = await fetch('/api/stripe/create-portal-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerId,
          }),
        });

        const { url, error } = await response.json();
        console.log('🔍 Portal Response:', { url, error });

        if (url && !error) {
          // Use the dynamically created portal URL if successful
          window.open(url, '_blank');
        }
        // If there's an error, we'll fall back to the test URL above
      } catch (portalError) {
        console.log('Portal session creation failed, using test URL:', portalError);
      }

    } catch (error) {
      console.error('Portal error:', error);
      alert('Error opening subscription management: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsManagingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <span className="text-green-600 dark:text-green-400 text-lg mr-3">🎉</span>
              <div>
                <h3 className="text-green-800 dark:text-green-200 font-semibold">
                  Welcome to Pro!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Your subscription is now active. Enjoy unlimited projects!
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-400 hover:text-green-600 dark:hover:text-green-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Plan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your subscription and billing
          </p>
        </div>

        <div className="space-y-6">
          {/* User Tier Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Plan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Tier */}
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.tier === 'PAID' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {user.tier === 'PAID' ? 'Pro' : 'Free'}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Current Plan
                </p>
              </div>

              {/* Project Usage */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.tier === 'PAID' ? `${user.projectCount}/∞` : `${user.projectCount}/4`}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Projects
                </p>
              </div>

              {/* Remaining Projects */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.tier === 'PAID' ? '∞' : Math.max(0, 4 - user.projectCount)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {user.tier === 'FREE' && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Project Usage</span>
                  <span>{user.projectCount}/4</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(user.projectCount / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Plan Management
            </h3>
            <div className="space-y-4">
              {user.tier === 'FREE' && (
                <div>
                  <button 
                    onClick={handleUpgrade}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
              
              {user.tier === 'PAID' && (
                <div>
                  <button 
                    onClick={handleManageSubscription}
                    disabled={isManagingSubscription}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isManagingSubscription ? 'not-allowed' : 'pointer',
                      opacity: isManagingSubscription ? 0.6 : 1
                    }}
                  >
                    {isManagingSubscription ? 'Opening...' : 'Manage Subscription'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function PlansPage() {
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
      <PlansPageContent />
    </Suspense>
  );
}
