'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from './checkout-button';
import { UserTierManager } from '@/lib/user-tiers';
import { User } from '@/lib/user-tiers';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UpgradePromptProps {
  user: User;
  onDismiss?: () => void;
  onUpgrade?: () => void;
}

export function UpgradePrompt({ user, onDismiss, onUpgrade }: UpgradePromptProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  if (!UserTierManager.shouldShowUpgradePrompt(user)) {
    return null;
  }

  const remainingProjects = UserTierManager.getRemainingProjects(user);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            You've reached your project limit
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You're currently using {user.projectCount} of {UserTierManager.getMaxProjects(user)} projects 
            in your free plan. Upgrade to Pro for unlimited projects and advanced features.
          </p>
          
          {!showCheckout ? (
            <div className="flex gap-3">
              <CheckoutButton
                userId={user.id}
                userEmail={user.email}
                onSuccess={() => {
                  setShowCheckout(false);
                  onUpgrade?.();
                }}
                onError={(error) => {
                  console.error('Checkout error:', error);
                }}
              />
              <Button
                variant="outline"
                onClick={onDismiss}
              >
                Maybe Later
              </Button>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to checkout...
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
