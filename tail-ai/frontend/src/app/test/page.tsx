import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">This is a test page to verify routing works.</p>
        <p className="text-sm text-gray-500 mt-4">If you can see this, the routing is working!</p>
      </div>
    </div>
  );
}