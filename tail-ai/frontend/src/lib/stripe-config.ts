// Stripe configuration for different environments
export const stripeConfig = {
  development: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_secret_key_here',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here',
    productId: process.env.STRIPE_PRODUCT_ID || 'prod_RSpk9sbDrDqZSu',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here',
  },
  production: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    productId: process.env.STRIPE_PRODUCT_ID || 'prod_RSpk9sbDrDqZSu',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  }
};

// User tier configuration
export const userTiers = {
  FREE: {
    name: 'Free',
    maxProjects: 4,
    features: ['Basic project management', '4 projects max', 'Community support']
  },
  PAID: {
    name: 'Pro',
    maxProjects: -1, // Unlimited
    features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom integrations']
  }
} as const;

export type UserTier = keyof typeof userTiers;
