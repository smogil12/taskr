'use client';

import React, { useState } from 'react';
import GoogleCalendarIntegration from '@/components/calendar/GoogleCalendarIntegration';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

export default function CalendarPage() {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your calendar and schedule tasks.
            </p>
          </div>

          <div className="flex justify-end mb-6">
            <Button 
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Open Calendar Integration
            </Button>
          </div>

          {/* Calendar Integration Modal */}
          {showCalendarModal && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && setShowCalendarModal(false)}
            >
              <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Google Calendar Integration
                  </h1>
                  <button
                    type="button"
                    onClick={() => setShowCalendarModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <GoogleCalendarIntegration />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}


