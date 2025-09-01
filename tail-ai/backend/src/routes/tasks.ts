import { Router } from 'express';
const { body, validationResult } = require('express-validator');
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateTask = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedHours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
];

// Helper function to update project hours
async function updateProjectHours(projectId: string) {
  try {
    // Calculate consumed hours from completed tasks
    const completedTasks = await prisma.task.findMany({
      where: {
        projectId,
        status: 'COMPLETED'
      },
      select: {
        actualHours: true
      }
    });

    const consumedHours = completedTasks.reduce((total, task) => {
      return total + (task.actualHours || 0);
    }, 0);

    // Update project with new consumed hours and calculate remaining hours
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { allocatedHours: true }
    });

    if (project) {
      const remainingHours = Math.max(0, (project.allocatedHours || 0) - consumedHours);
      
      await prisma.project.update({
        where: { id: projectId },
        data: {
          consumedHours,
          remainingHours
        }
      });
    }
  } catch (error) {
    console.error('Error updating project hours:', error);
  }
}

// Get all tasks for authenticated user
router.get('/', async (req: any, res: any) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;

    const where: any = {
      project: {
        userId: req.user!.id,
      },
    };

    if (projectId) where.projectId = projectId as string;
    if (status) where.status = status as string;
    if (priority) where.priority = priority as string;
    if (assignedTo) where.assignedTo = assignedTo as string;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: req.user!.id,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        timeEntries: {
          take: 10,
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/', validateTask, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, description, priority, status, dueDate, estimatedHours, projectId } = req.body;

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

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', validateTask, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, description, priority, status, dueDate, estimatedHours, assignedTo, actualHours } = req.body;

    // Check if task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: req.user!.id,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(estimatedHours !== undefined && { estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(actualHours !== undefined && { actualHours: parseFloat(actualHours) }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If task status changed to COMPLETED or actualHours were updated, update project hours
    if (status === 'COMPLETED' || actualHours !== undefined) {
      await updateProjectHours(existingTask.projectId);
    }

    return res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if task belongs to user's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: req.user!.id,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id },
    });

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;

