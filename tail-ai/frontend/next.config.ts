import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Determine the backend URL based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isStaging = process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';
    
    let backendUrl: string;
    
    if (isDevelopment) {
      // Local development - proxy to local backend
      backendUrl = 'http://localhost:3002';
    } else if (isStaging) {
      // Staging environment - proxy to DigitalOcean backend
      backendUrl = 'http://167.99.115.97:3001';
    } else {
      // Production environment - proxy to production backend
      backendUrl = 'http://167.99.115.97:3002';
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  env: {
    // Set environment variables based on the current environment
    NEXT_PUBLIC_ENVIRONMENT: process.env.VERCEL_ENV === 'preview' ? 'staging' : 
                            process.env.NODE_ENV === 'development' ? 'development' : 'production',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' :
                              process.env.VERCEL_ENV === 'preview' ? 'https://staging.tailapp.ai' :
                              'https://frontend-seven-pi-62.vercel.app',
  },
};

export default nextConfig;
