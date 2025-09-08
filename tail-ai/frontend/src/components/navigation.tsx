'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Tail.AI
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pricing">
              <Button variant="outline">Pricing</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
