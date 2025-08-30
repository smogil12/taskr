import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateTimeEntry = [
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').optional().isISO8601().withMessage('End time must be a valid date'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('taskId').optional().isString().withMessage('Task ID must be a string'),
];

// Get all time entries for authenticated user
router.get('/', async (req, res) => {
  try {
    const { projectId, taskId, startDate, endDate } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (projectId) where.projectId = projectId as string;
    if (taskId) where.taskId = taskId as string;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ timeEntries });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

// Get single time entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    res.json({ timeEntry });
  } catch (error) {
    console.error('Get time entry error:', error);
    res.status(500).json({ error: 'Failed to fetch time entry' });
  }
});

// Create new time entry
router.post('/', validateTimeEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { startTime, endTime, description, projectId, taskId } = req.body;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify task belongs to project if provided
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          projectId,
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
    }

    // Calculate duration if end time is provided
    let duration = null;
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      duration = end.getTime() - start.getTime();
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        description,
        userId: req.user!.id,
        projectId,
        taskId: taskId || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Time entry created successfully',
      timeEntry,
    });
  } catch (error) {
    console.error('Create time entry error:', error);
    res.status(500).json({ error: 'Failed to create time entry' });
  }
});

// Update time entry
router.put('/:id', validateTimeEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { startTime, endTime, description, projectId, taskId } = req.body;

    // Check if time entry belongs to user
    const existingTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTimeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    // Calculate duration if end time is provided
    let duration = null;
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      duration = end.getTime() - start.getTime();
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { 
          endTime: endTime ? new Date(endTime) : null,
          duration: duration,
        }),
        ...(description !== undefined && { description }),
        ...(projectId && { projectId }),
        ...(taskId !== undefined && { taskId: taskId || null }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: 'Time entry updated successfully',
      timeEntry: updatedTimeEntry,
    });
  } catch (error) {
    console.error('Update time entry error:', error);
    res.status(500).json({ error: 'Failed to update time entry' });
  }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if time entry belongs to user
    const existingTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTimeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Delete time entry error:', error);
    res.status(500).json({ error: 'Failed to delete time entry' });
  }
});

// Get time tracking statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const [totalEntries, totalHours, projectStats] = await Promise.all([
      prisma.timeEntry.count({ where }),
      prisma.timeEntry.aggregate({
        where: { ...where, duration: { not: null } },
        _sum: { duration: true },
      }),
      prisma.timeEntry.groupBy({
        by: ['projectId'],
        where,
        _sum: { duration: true },
        _count: true,
      }),
    ]);

    const totalHoursValue = totalHours._sum.duration 
      ? Math.round(totalHours._sum.duration / (1000 * 60 * 60) * 100) / 100 
      : 0;

    // Get project names for stats
    const projectIds = projectStats.map(stat => stat.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    });

    const projectStatsWithNames = projectStats.map(stat => {
      const project = projects.find(p => p.id === stat.projectId);
      return {
        projectId: stat.projectId,
        projectName: project?.name || 'Unknown Project',
        totalHours: stat._sum.duration 
          ? Math.round(stat._sum.duration / (1000 * 60 * 60) * 100) / 100 
          : 0,
        entryCount: stat._count,
      };
    });

    res.json({
      stats: {
        totalEntries,
        totalHours: totalHoursValue,
        projectBreakdown: projectStatsWithNames,
      },
    });
  } catch (error) {
    console.error('Get time stats error:', error);
    res.status(500).json({ error: 'Failed to fetch time statistics' });
  }
});

export default router;
