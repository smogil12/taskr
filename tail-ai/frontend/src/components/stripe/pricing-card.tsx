'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { userTiers, UserTier } from '@/lib/stripe-config';
import { CheckIcon } from '@heroicons/react/24/outline';

interface PricingCardProps {
  tier: UserTier;
  currentTier?: UserTier;
  onUpgrade: (tier: UserTier) => void;
  isLoading?: boolean;
}

export function PricingCard({ tier, currentTier, onUpgrade, isLoading }: PricingCardProps) {
  const tierConfig = userTiers[tier];
  const isCurrentTier = currentTier === tier;
  const isFreeTier = tier === 'FREE';
  const isPaidTier = tier === 'PAID';

  return (
    <div className={`relative rounded-2xl border p-8 ${
      isPaidTier 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {isPaidTier && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tierConfig.name}
        </h3>
        
        <div className="mt-4">
          {isFreeTier ? (
            <span className="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
          ) : (
            <div>
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$9.99</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>
          )}
        </div>
        
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {isFreeTier 
            ? 'Perfect for getting started'
            : 'Unlock unlimited potential'
          }
        </p>
      </div>
      
      <ul className="mt-8 space-y-4">
        {tierConfig.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8">
        {isCurrentTier ? (
          <Button 
            disabled 
            className="w-full"
            variant="outline"
          >
            Current Plan
          </Button>
        ) : (
          <Button
            onClick={() => onUpgrade(tier)}
            disabled={isLoading}
            className={`w-full ${
              isPaidTier 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : ''
            }`}
            variant={isPaidTier ? 'default' : 'outline'}
          >
            {isLoading ? 'Processing...' : isFreeTier ? 'Downgrade' : 'Upgrade to Pro'}
          </Button>
        )}
      </div>
    </div>
  );
}
