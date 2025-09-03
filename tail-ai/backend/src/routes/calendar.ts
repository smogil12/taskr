import { Router } from 'express';
const { body, query, validationResult } = require('express-validator');
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../index';
import { GoogleCalendarService } from '../services/googleCalendarService';

const router = Router();
const googleCalendarService = new GoogleCalendarService();

/**
 * GET /api/calendar/oauth/callback
 * Handle OAuth callback and store tokens
 * This route must be before authentication middleware
 */
router.get('/oauth/callback', async (req: any, res: any) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // For now, we'll use a simple approach - in production you'd want to store state in a secure way
    // and validate it properly. For development, we'll just proceed with the token exchange.

    const tokens = await googleCalendarService.getTokens(code);

    // For development, we'll store tokens for the first user
    // In production, you'd want to properly identify the user from the state parameter
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    // Store tokens in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleCalendarConnected: true
      }
    });

    // Redirect back to the frontend calendar page
    res.redirect('http://localhost:3002/calendar?connected=true');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

// Apply authentication to all other routes
router.use(authenticateToken);

// Validation middleware
const validateCalendarSync = [
  body('projectId').isString().notEmpty().withMessage('Project ID is required'),
  body('calendarId').optional().isString().withMessage('Calendar ID must be a string'),
  body('timeMin').optional().isISO8601().withMessage('Start time must be a valid date'),
  body('timeMax').optional().isISO8601().withMessage('End time must be a valid date'),
  body('maxResults').optional().isInt({ min: 1, max: 250 }).withMessage('Max results must be between 1 and 250'),
  body('autoCreateTasks').optional().isBoolean().withMessage('Auto create tasks must be a boolean'),
  body('defaultPriority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority')
];

/**
 * GET /api/calendar/auth-url
 * Get Google Calendar authorization URL
 */
router.get('/auth-url', async (req: any, res: any) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl(req.user.id);
    
    res.json({
      authUrl,
      message: 'Visit this URL to authorize Google Calendar access'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});



/**
 * GET /api/calendar/status
 * Check Google Calendar connection status
 */
router.get('/status', async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        googleCalendarConnected: true,
        googleAccessToken: true
      }
    });

    res.json({
      connected: user?.googleCalendarConnected || false,
      hasToken: !!user?.googleAccessToken
    });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    res.status(500).json({ error: 'Failed to check calendar status' });
  }
});

/**
 * GET /api/calendar/calendars
 * Get list of available calendars
 */
router.get('/calendars', async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { googleAccessToken: true, googleRefreshToken: true }
    });

    if (!user?.googleAccessToken) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    googleCalendarService.setCredentials(user.googleAccessToken, user.googleRefreshToken || undefined);
    const calendars = await googleCalendarService.getCalendars();

    res.json({ calendars });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
});

/**
 * GET /api/calendar/events
 * Get calendar events (preview before creating tasks)
 */
router.get('/events', [
  query('calendarId').optional().isString(),
  query('timeMin').optional().isISO8601(),
  query('timeMax').optional().isISO8601(),
  query('maxResults').optional().isInt({ min: 1, max: 250 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { googleAccessToken: true, googleRefreshToken: true }
    });

    if (!user?.googleAccessToken) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const { calendarId, timeMin, timeMax, maxResults } = req.query;

    googleCalendarService.setCredentials(user.googleAccessToken, user.googleRefreshToken || undefined);
    const events = await googleCalendarService.getCalendarEvents(
      calendarId || 'primary',
      timeMin,
      timeMax,
      parseInt(maxResults) || 50
    );

    // Convert events to task preview format
    const taskPreviews = events.map(event => {
      const taskData = googleCalendarService.convertEventToTask(event, '');
      return {
        eventId: event.id,
        eventSummary: event.summary,
        taskTitle: taskData.title,
        taskDescription: taskData.description,
        dueDate: taskData.dueDate,
        estimatedHours: taskData.estimatedHours,
        priority: taskData.priority,
        location: taskData.location,
        attendees: taskData.attendees,
        calendarEventUrl: taskData.calendarEventUrl
      };
    });

    res.json({ 
      events: taskPreviews,
      total: taskPreviews.length
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

/**
 * POST /api/calendar/sync
 * Sync calendar events and create tasks
 */
router.post('/sync', validateCalendarSync, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { 
      projectId, 
      calendarId, 
      timeMin, 
      timeMax, 
      maxResults,
      autoCreateTasks = false,
      defaultPriority = 'MEDIUM'
    } = req.body;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { googleAccessToken: true, googleRefreshToken: true }
    });

    if (!user?.googleAccessToken) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    googleCalendarService.setCredentials(user.googleAccessToken, user.googleRefreshToken || undefined);
    const events = await googleCalendarService.getCalendarEvents(
      calendarId || 'primary',
      timeMin,
      timeMax,
      parseInt(maxResults) || 50
    );

    const createdTasks = [];
    const skippedEvents = [];

    for (const event of events) {
      try {
        // Check if task already exists for this calendar event
        const existingTask = await prisma.task.findFirst({
          where: {
            projectId,
            calendarEventId: event.id
          }
        });

        if (existingTask) {
          skippedEvents.push({
            eventId: event.id,
            eventSummary: event.summary,
            reason: 'Task already exists'
          });
          continue;
        }

        const taskData = googleCalendarService.convertEventToTask(event, projectId);
        
        // Override priority if specified
        if (defaultPriority !== 'MEDIUM') {
          taskData.priority = defaultPriority;
        }

        if (autoCreateTasks) {
          const task = await prisma.task.create({
            data: {
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              status: taskData.status,
              dueDate: taskData.dueDate,
              estimatedHours: taskData.estimatedHours,
              projectId,
              calendarEventId: taskData.calendarEventId,
              calendarEventUrl: taskData.calendarEventUrl
            },
            include: {
              project: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });

          createdTasks.push(task);
        } else {
          // Return task data for preview
          createdTasks.push({
            ...taskData,
            projectId,
            calendarEventId: taskData.calendarEventId,
            calendarEventUrl: taskData.calendarEventUrl
          });
        }
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        skippedEvents.push({
          eventId: event.id,
          eventSummary: event.summary,
          reason: 'Processing error'
        });
      }
    }

    res.json({
      message: autoCreateTasks ? 'Calendar events synced successfully' : 'Calendar events preview generated',
      createdTasks: createdTasks.length,
      skippedEvents: skippedEvents.length,
      tasks: createdTasks,
      skipped: skippedEvents
    });
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    res.status(500).json({ error: 'Failed to sync calendar events' });
  }
});

/**
 * DELETE /api/calendar/disconnect
 * Disconnect Google Calendar integration
 */
router.delete('/disconnect', async (req: any, res: any) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleCalendarConnected: false
      }
    });

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
});

export default router;
