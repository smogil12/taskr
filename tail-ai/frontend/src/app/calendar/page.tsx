import React from 'react';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">
              Manage your calendar and schedule tasks.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Calendar Integration</h2>
            <p className="text-gray-600">
              Calendar functionality is now accessible! This is a simplified version to test deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


