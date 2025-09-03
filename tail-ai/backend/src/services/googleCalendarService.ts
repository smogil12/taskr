import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export interface TaskFromCalendar {
  title: string;
  description?: string;
  dueDate?: Date;
  estimatedHours?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  calendarEventId?: string;
  calendarEventUrl?: string;
  location?: string;
  attendees?: string[];
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate the authorization URL for Google Calendar access
   */
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass user ID in state for security
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || undefined
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Set credentials for the OAuth2 client
   */
  setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }

  /**
   * Refresh access token if needed
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials.access_token!;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get calendar events for a specific time range
   */
  async getCalendarEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 100
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return (response.data.items || []).filter((item): item is CalendarEvent => !!item.id);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Get a specific calendar event by ID
   */
  async getCalendarEvent(eventId: string, calendarId: string = 'primary'): Promise<CalendarEvent | null> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.get({
        calendarId,
        eventId
      });

      return response.data as CalendarEvent;
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      return null;
    }
  }

  /**
   * Convert a calendar event to a task
   */
  convertEventToTask(event: CalendarEvent, projectId: string): TaskFromCalendar {
    const startTime = event.start.dateTime ? new Date(event.start.dateTime) : 
                     event.start.date ? new Date(event.start.date) : null;
    
    const endTime = event.end.dateTime ? new Date(event.end.dateTime) : 
                   event.end.date ? new Date(event.end.date) : null;

    // Calculate estimated hours based on event duration
    let estimatedHours: number | undefined;
    if (startTime && endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      estimatedHours = Math.max(0.5, Math.round((durationMs / (1000 * 60 * 60)) * 2) / 2); // Round to nearest 0.5 hours, minimum 0.5
    }

    // Determine priority based on event details
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    if (event.summary.toLowerCase().includes('urgent') || 
        event.summary.toLowerCase().includes('asap') ||
        event.summary.toLowerCase().includes('important')) {
      priority = 'HIGH';
    } else if (event.summary.toLowerCase().includes('meeting') ||
               event.summary.toLowerCase().includes('call')) {
      priority = 'MEDIUM';
    }

    // Extract attendees
    const attendees = event.attendees?.map(attendee => attendee.email).filter(Boolean) || [];

    return {
      title: event.summary || 'Untitled Event',
      description: this.formatEventDescription(event),
      dueDate: startTime || undefined,
      estimatedHours,
      priority,
      status: 'TODO',
      calendarEventId: event.id,
      calendarEventUrl: `https://calendar.google.com/calendar/event?eid=${event.id}`,
      location: event.location,
      attendees
    };
  }

  /**
   * Format event description with additional context
   */
  private formatEventDescription(event: CalendarEvent): string {
    let description = event.description || '';
    
    if (event.location) {
      description += `\n\n📍 Location: ${event.location}`;
    }
    
    if (event.attendees && event.attendees.length > 0) {
      const attendeeNames = event.attendees
        .map(attendee => attendee.displayName || attendee.email)
        .join(', ');
      description += `\n\n👥 Attendees: ${attendeeNames}`;
    }
    
    if (event.organizer) {
      description += `\n\n📅 Organized by: ${event.organizer.displayName || event.organizer.email}`;
    }
    
    description += `\n\n📅 Source: Google Calendar Event`;
    
    return description.trim();
  }

  /**
   * Get list of available calendars
   */
  async getCalendars(): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.calendarList.list();
      
      return response.data.items?.map(cal => ({
        id: cal.id!,
        summary: cal.summary!,
        primary: cal.primary || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw new Error('Failed to fetch calendars');
    }
  }
}
