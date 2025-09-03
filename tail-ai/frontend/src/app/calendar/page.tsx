import React from 'react';
import GoogleCalendarIntegration from '@/components/calendar/GoogleCalendarIntegration';
import { MainLayout } from '@/components/layout/main-layout';

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">
              Manage your calendar and schedule tasks.
            </p>
          </div>

          <GoogleCalendarIntegration />
        </div>
      </div>
    </MainLayout>
  );
}

// Force deployment Wed Sep  3 18:40:54 EDT 2025
