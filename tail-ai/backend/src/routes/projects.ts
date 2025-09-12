import { Router } from 'express';
const { body, validationResult } = require('express-validator');
import { prisma } from '../index';
import { authenticateToken, checkProjectLimit } from '../middleware/auth';
import { requirePermission, requireProjectAccess } from '../middleware/permissions';
import { Permission, UserRole, PermissionChecker } from '../utils/permissions';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateProject = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Project name must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('status').optional().isIn(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD']).withMessage('Invalid status'),
  body('allocatedHours').optional().isFloat({ min: 0 }).withMessage('Allocated hours must be a positive number'),
  body('clientId').optional().isString().withMessage('Client ID must be a string'),
];

// Get all projects for authenticated user (including team projects)
router.get('/', 
  requirePermission(Permission.VIEW_ALL_PROJECTS),
  async (req: any, res: any) => {
  try {
    // Check if user is a team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: req.user!.id,
        status: 'ACCEPTED'
      }
    });

    let whereClause: any = { userId: req.user!.id };

    // If user is a team member, also include projects from their team owner
    if (teamMember) {
      whereClause = {
        OR: [
          { userId: req.user!.id }, // User's own projects
          { userId: teamMember.ownerId } // Team owner's projects
        ]
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
          },
        },
        tasks: {
          take: 5, // Limit to 5 recent tasks
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate consumed hours for each project
    const projectsWithConsumedHours = await Promise.all(
      projects.map(async (project) => {
        // Get all completed tasks for this project
        const completedTasks = await prisma.task.findMany({
          where: {
            projectId: project.id,
            status: 'COMPLETED'
          },
          select: {
            actualHours: true
          }
        });

        // Also check all tasks for this project to see what exists
        const allTasks = await prisma.task.findMany({
          where: {
            projectId: project.id
          },
          select: {
            id: true,
            title: true,
            status: true,
            actualHours: true
          }
        });

        console.log(`Project ${project.name} (${project.id}): Found ${completedTasks.length} completed tasks out of ${allTasks.length} total tasks`);
        console.log('All tasks:', allTasks);
        console.log('Completed tasks:', completedTasks);

        // Calculate consumed hours from completed tasks
        const consumedHours = completedTasks.reduce((total, task) => {
          return total + (task.actualHours || 0);
        }, 0);

        console.log(`Project ${project.name}: consumedHours = ${consumedHours}`);

        // Calculate remaining hours
        const remainingHours = Math.max(0, (project.allocatedHours || 0) - consumedHours);

        return {
          ...project,
          consumedHours,
          remainingHours
        };
      })
    );

    return res.json({ projects: projectsWithConsumedHours });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by ID
router.get('/:id', 
  requireProjectAccess,
  async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true
          }
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        timeEntries: {
          take: 10,
          orderBy: { startTime: 'desc' },
          include: {
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project (with subscription limit check)
router.post('/', 
  requirePermission(Permission.CREATE_PROJECTS),
  validateProject, 
  checkProjectLimit, 
  async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, description, startDate, endDate, status, allocatedHours, clientId } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'PLANNING',
        allocatedHours: allocatedHours || 0,
        ...(clientId && { client: { connect: { id: clientId } } }),
        user: {
          connect: { id: req.user!.id }
        },
      },
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return res.status(500).json({ error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update project
router.put('/:id', 
  requireProjectAccess,
  validateProject, 
  async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { name, description, startDate, endDate, status, progress, allocatedHours, clientId } = req.body;

    // Check if project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status && { status }),
        ...(progress !== undefined && { progress: Math.max(0, Math.min(100, progress)) }),
        ...(allocatedHours !== undefined && { allocatedHours }),
        ...(clientId !== undefined && { clientId }),
      },
      include: {
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
          },
        },
      },
    });

    return res.json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', 
  requireProjectAccess,
  async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete project (cascades to tasks and time entries)
    await prisma.project.delete({
      where: { id },
    });

    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get project statistics
router.get('/:id/stats', 
  requireProjectAccess,
  async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get project statistics
    const [taskStats, timeStats] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId: id },
        _count: { status: true },
      }),
      prisma.timeEntry.aggregate({
        where: { projectId: id },
        _sum: { duration: true },
        _count: true,
      }),
    ]);

    const totalHours = timeStats._sum.duration ? Math.round(timeStats._sum.duration / (1000 * 60 * 60) * 100) / 100 : 0;

    return res.json({
      stats: {
        tasks: taskStats,
        timeTracking: {
          totalEntries: timeStats._count,
          totalHours,
        },
      },
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
});

export default router;

