import GoogleCalendarIntegration from '@/components/calendar/GoogleCalendarIntegration';

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Calendar Integration</h1>
          <p className="text-gray-600 mt-2">
            Connect your Google Calendar and automatically create tasks from your calendar events.
          </p>
        </div>
        
        <GoogleCalendarIntegration />
      </div>
    </div>
  );
}
