import { Router } from 'express';
const { body, validationResult } = require('express-validator');
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { getTeamOwnerId } from '../utils/teamUtils';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateTask = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  body('dueDate').optional().custom((value: any) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
  }).withMessage('Due date must be a valid date'),
  body('estimatedHours').optional().isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
  body('actualHours').optional().isFloat({ min: 0 }).withMessage('Actual hours must be a positive number'),
];

// Helper function to update project hours
async function updateProjectHours(projectId: string) {
  try {
    console.log('Updating project hours for project:', projectId);
    
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

    console.log('Found completed tasks:', completedTasks.length);

    const consumedHours = completedTasks.reduce((total, task) => {
      return total + (task.actualHours || 0);
    }, 0);

    console.log('Calculated consumed hours:', consumedHours);

    // Update project with new consumed hours and calculate remaining hours
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { allocatedHours: true }
    });

    if (project) {
      const remainingHours = Math.max(0, (project.allocatedHours || 0) - consumedHours);
      
      console.log('Updating project with consumedHours:', consumedHours, 'remainingHours:', remainingHours);
      
      // Ensure values are valid numbers
      const safeConsumedHours = isNaN(consumedHours) ? 0 : consumedHours;
      const safeRemainingHours = isNaN(remainingHours) ? 0 : remainingHours;
      
      await prisma.project.update({
        where: { id: projectId },
        data: {
          consumedHours: safeConsumedHours,
          remainingHours: safeRemainingHours
        }
      });
      
      console.log('Project hours updated successfully');
    } else {
      console.error('Project not found:', projectId);
      throw new Error(`Project not found: ${projectId}`);
    }
  } catch (error) {
    console.error('Error updating project hours:', error);
    console.error('Project hours error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      projectId
    });
  }
}

// Get all tasks for authenticated user
router.get('/', async (req: any, res: any) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;

    // Get the team owner ID (if user is a team member, get the inviter's ID; otherwise, use their own ID)
    const teamOwnerId = await getTeamOwnerId(req.user!.id);

    const where: any = {
      project: {
        userId: teamOwnerId,
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
        createdByUser: {
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

    const { title, description, priority, status, dueDate, estimatedHours, projectId, assignedTo } = req.body;

    // Get the team owner ID (if user is a team member, get the inviter's ID; otherwise, use their own ID)
    const teamOwnerId = await getTeamOwnerId(req.user!.id);

    // Verify project belongs to team owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: teamOwnerId,
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
        assignedTo: assignedTo || null,
        createdBy: req.user!.id,
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
  const { id } = req.params;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, description, priority, status, dueDate, estimatedHours, assignedTo, actualHours } = req.body;

    console.log('Task update request body:', {
      id,
      status,
      actualHours,
      title,
      priority
    });

    // Get the team owner ID (if user is a team member, get the inviter's ID; otherwise, use their own ID)
    const teamOwnerId = await getTeamOwnerId(req.user!.id);

    // Check if task belongs to team owner's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: teamOwnerId,
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
        ...(actualHours !== undefined && { actualHours: actualHours ? parseFloat(actualHours) : null }),
        lastEditedBy: req.user!.id,
        lastEditedAt: new Date(),
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
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lastEditedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('Task updated successfully:', {
      id: updatedTask.id,
      status: updatedTask.status,
      actualHours: updatedTask.actualHours,
      title: updatedTask.title
    });

    // If task status changed to COMPLETED or actualHours were updated, update project hours
    if ((status === 'COMPLETED' || actualHours !== undefined) && existingTask.projectId) {
      console.log('Updating project hours for task completion/actual hours change');
      await updateProjectHours(existingTask.projectId);
    }

    return res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      taskId: id,
      userId: req.user?.id
    });
    return res.status(500).json({ 
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete task
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Get the team owner ID (if user is a team member, get the inviter's ID; otherwise, use their own ID)
    const teamOwnerId = await getTeamOwnerId(req.user!.id);

    // Check if task belongs to team owner's project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: teamOwnerId,
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

