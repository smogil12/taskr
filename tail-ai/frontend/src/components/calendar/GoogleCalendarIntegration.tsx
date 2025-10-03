'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface CalendarStatus {
  connected: boolean;
  hasToken: boolean;
}

interface CalendarEvent {
  eventId: string;
  eventSummary: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  estimatedHours?: number;
  priority: string;
  location?: string;
  attendees?: string[];
  calendarEventUrl?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function GoogleCalendarIntegration() {
  const [status, setStatus] = useState<CalendarStatus>({ connected: false, hasToken: false });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkCalendarStatus();
    fetchProjects();
    
    // Check if we just connected (URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      // Refresh the status to show connected state
      setTimeout(() => {
        checkCalendarStatus();
      }, 1000);
    }
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      const response = await fetch('/api/calendar/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking calendar status:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const connectCalendar = async () => {
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      const response = await fetch('/api/calendar/auth-url', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAuthUrl(data.authUrl);
      
      // Open the authorization URL in the same window for better UX
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      // Fetch events from 30 days ago to 90 days in the future
      const now = new Date();
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - 30);
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + 90);

      const response = await fetch(`/api/calendar/events?timeMin=${pastDate.toISOString()}&timeMax=${futureDate.toISOString()}&maxResults=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncEventsToTasks = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    if (selectedEvents.size === 0) {
      alert('Please select at least one event to create tasks');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      // Get selected events data
      const eventsToSync = events.filter(e => selectedEvents.has(e.eventId));
      
      // Create tasks individually for each selected event
      let createdCount = 0;
      for (const event of eventsToSync) {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: event.taskTitle,
            description: event.taskDescription,
            projectId: selectedProject,
            priority: event.priority,
            status: 'TODO',
            dueDate: event.dueDate,
            estimatedHours: event.estimatedHours,
            calendarEventId: event.eventId,
            calendarEventUrl: event.calendarEventUrl
          })
        });
        
        if (response.ok) {
          createdCount++;
        }
      }
      
      alert(`Successfully created ${createdCount} task(s) from calendar events!`);
      
      // Remove created events from the list and clear selection
      setEvents(events.filter(e => !selectedEvents.has(e.eventId)));
      setSelectedEvents(new Set());
    } catch (error) {
      console.error('Error syncing events:', error);
      alert('Error creating tasks from calendar events');
    } finally {
      setLoading(false);
    }
  };

  const toggleEventSelection = (eventId: string) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map(e => e.eventId)));
    }
  };

  const disconnectCalendar = async () => {
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      const response = await fetch('/api/calendar/disconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setStatus({ connected: false, hasToken: false });
        setEvents([]);
        alert('Google Calendar disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
    }
  };

  if (!status.connected) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Connect your Google Calendar to automatically create tasks from calendar events.
          </p>
        </div>
        <div className="p-6">
          <Button onClick={connectCalendar} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Connect Google Calendar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar Integration
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Connected to Google Calendar
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={disconnectCalendar}>
            Disconnect
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={fetchCalendarEvents} 
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Preview Events'}
          </Button>
        </div>

        {events.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedEvents.size === events.length && events.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <h4 className="font-medium">
                  Calendar Events ({selectedEvents.size} of {events.length} selected)
                </h4>
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedProject} 
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-3 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={syncEventsToTasks} 
                  disabled={loading || !selectedProject || selectedEvents.size === 0}
                  size="sm"
                >
                  Create Tasks ({selectedEvents.size})
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.eventId} className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
                  <div className="flex gap-3 items-start">
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.eventId)}
                      onChange={() => toggleEventSelection(event.eventId)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">{event.taskTitle}</h5>
                      {event.taskDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {event.taskDescription.length > 100 
                            ? `${event.taskDescription.substring(0, 100)}...` 
                            : event.taskDescription
                          }
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {event.dueDate && (
                          <span>📅 {new Date(event.dueDate).toLocaleDateString()}</span>
                        )}
                        {event.estimatedHours && (
                          <span>⏱️ {event.estimatedHours}h</span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          event.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {event.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events found</p>
            <p className="text-sm">Click "Preview Events" to load your calendar events</p>
          </div>
        )}
      </div>
    </div>
  );
}
