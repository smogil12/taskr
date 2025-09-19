import { userTiers, UserTier } from './stripe-config';

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  projectCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserTierManager {
  static canCreateProject(user: User): boolean {
    if (user.tier === 'PRO') {
      return true; // Unlimited projects
    }
    
    if (user.tier === 'FREE') {
      return user.projectCount < userTiers.FREE.maxProjects;
    }
    
    return false;
  }

  static getMaxProjects(user: User): number {
    return userTiers[user.tier].maxProjects;
  }

  static getRemainingProjects(user: User): number {
    if (user.tier === 'PRO') {
      return -1; // Unlimited
    }
    
    return Math.max(0, userTiers[user.tier].maxProjects - user.projectCount);
  }

  static shouldShowUpgradePrompt(user: User): boolean {
    return user.tier === 'FREE' && user.projectCount >= userTiers.FREE.maxProjects;
  }

  static getTierFeatures(tier: UserTier): string[] {
    return userTiers[tier].features;
  }

  static getTierName(tier: UserTier): string {
    return userTiers[tier].name;
  }
}

// Database helper functions (you'll need to implement these based on your database setup)
export async function updateUserTier(userId: string, tier: UserTier): Promise<void> {
  // TODO: Update user tier in your database
  console.log(`Updating user ${userId} to tier ${tier}`);
}

export async function incrementProjectCount(userId: string): Promise<void> {
  // TODO: Increment project count in your database
  console.log(`Incrementing project count for user ${userId}`);
}

export async function decrementProjectCount(userId: string): Promise<void> {
  // TODO: Decrement project count in your database
  console.log(`Decrementing project count for user ${userId}`);
}
