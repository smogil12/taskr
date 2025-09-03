'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      
      // Open the authorization URL in a new window
      window.open(data.authUrl, '_blank', 'width=600,height=600');
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      const response = await fetch('/api/calendar/events', {
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

    setLoading(true);
    try {
      const token = localStorage.getItem('taskr_token');
      if (!token) return;

      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: selectedProject,
          autoCreateTasks: true,
          maxResults: 50
        })
      });
      const data = await response.json();
      
      if (data.tasks) {
        alert(`Successfully created ${data.createdTasks} tasks from calendar events!`);
        setEvents([]); // Clear the events list
      }
    } catch (error) {
      console.error('Error syncing events:', error);
    } finally {
      setLoading(false);
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically create tasks from calendar events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectCalendar} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar Integration
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Connected to Google Calendar
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={disconnectCalendar}>
            Disconnect
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <h4 className="font-medium">Upcoming Events ({events.length})</h4>
              <div className="flex gap-2">
                <select 
                  value={selectedProject} 
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
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
                  disabled={loading || !selectedProject}
                  size="sm"
                >
                  Create Tasks
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.eventId} className="p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium">{event.taskTitle}</h5>
                      {event.taskDescription && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {event.taskDescription}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        {event.dueDate && (
                          <span>📅 {new Date(event.dueDate).toLocaleDateString()}</span>
                        )}
                        {event.estimatedHours && (
                          <span>⏱️ {event.estimatedHours}h</span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          event.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.priority}
                        </span>
                      </div>
                    </div>
                    {event.calendarEventUrl && (
                      <a 
                        href={event.calendarEventUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    )}
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
      </CardContent>
    </Card>
  );
}
