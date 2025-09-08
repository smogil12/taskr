'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UpgradePrompt } from './upgrade-prompt';
import { CheckoutButton } from './checkout-button';
import { UserTierManager } from '@/lib/user-tiers';
import { User, UserTier } from '@/lib/user-tiers';
import { userTiers } from '@/lib/stripe-config';
import { 
  ChartBarIcon, 
  CogIcon, 
  CreditCardIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';

interface UserDashboardProps {
  user: User;
  onProjectCreate?: () => void;
  onProjectDelete?: (projectId: string) => void;
}

export function UserDashboard({ user, onProjectCreate, onProjectDelete }: UserDashboardProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const canCreateProject = UserTierManager.canCreateProject(user);
  const remainingProjects = UserTierManager.getRemainingProjects(user);
  const tierFeatures = UserTierManager.getTierFeatures(user.tier);

  const handleCreateProject = async () => {
    if (!canCreateProject) {
      return;
    }

    setIsCreatingProject(true);
    try {
      // TODO: Implement project creation logic
      await onProjectCreate?.();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user.stripeCustomerId,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to customer portal
      window.location.href = url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <UpgradePrompt
          user={user}
          onDismiss={() => setShowUpgradePrompt(false)}
          onUpgrade={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* User Tier Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Plan
          </h2>
          {user.tier === 'PAID' && user.stripeCustomerId && (
            <Button
              variant="outline"
              onClick={handleCustomerPortal}
              className="flex items-center gap-2"
            >
              <CreditCardIcon className="h-4 w-4" />
              Manage Billing
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Tier */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.tier === 'PAID' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {UserTierManager.getTierName(user.tier)}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current Plan
            </p>
          </div>

          {/* Project Usage */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.projectCount}
              {user.tier === 'PAID' ? '+' : `/${UserTierManager.getMaxProjects(user)}`}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Projects
            </p>
          </div>

          {/* Remaining Projects */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {remainingProjects === -1 ? '∞' : remainingProjects}
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
              <span>{user.projectCount}/{UserTierManager.getMaxProjects(user)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(user.projectCount / UserTierManager.getMaxProjects(user)) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleCreateProject}
            disabled={!canCreateProject || isCreatingProject}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            {isCreatingProject ? 'Creating...' : 'Create New Project'}
          </Button>
          
          {user.tier === 'FREE' && (
            <CheckoutButton
              userId={user.id}
              userEmail={user.email}
              onSuccess={() => {
                // Refresh user data or redirect
                window.location.reload();
              }}
            />
          )}
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Plan Features
        </h3>
        <ul className="space-y-2">
          {tierFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
