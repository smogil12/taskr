import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { getTeamOwnerId } from '../utils/teamUtils';

const router = Router();

// Get activity feed data
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const teamOwnerId = await getTeamOwnerId(req.user!.id);

    // Get recent tasks (created and edited)
    const recentTasks = await prisma.task.findMany({
      where: {
        project: {
          userId: teamOwnerId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
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
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get recent projects (created and edited)
    const recentProjects = await prisma.project.findMany({
      where: {
        userId: teamOwnerId,
      },
      include: {
        lastEditedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent clients (created and edited)
    const recentClients = await prisma.client.findMany({
      where: {
        userId: teamOwnerId,
      },
      include: {
        lastEditedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Combine and format activity items
    const activities: any[] = [];

    // Add task activities
    recentTasks.forEach(task => {
      // Task created
      activities.push({
        id: `task-created-${task.id}`,
        type: 'task_created',
        itemId: task.id,
        itemTitle: task.title,
        itemType: 'task',
        projectName: task.project?.name,
        user: task.createdByUser,
        timestamp: task.createdAt,
        status: task.status,
      });

      // Task edited (if different from created)
      if (task.lastEditedBy && task.lastEditedBy !== task.createdBy && task.lastEditedAt) {
        activities.push({
          id: `task-edited-${task.id}`,
          type: 'task_edited',
          itemId: task.id,
          itemTitle: task.title,
          itemType: 'task',
          projectName: task.project?.name,
          user: task.lastEditedByUser,
          timestamp: task.lastEditedAt,
          status: task.status,
        });
      }
    });

    // Add project activities
    recentProjects.forEach(project => {
      // Project created
      activities.push({
        id: `project-created-${project.id}`,
        type: 'project_created',
        itemId: project.id,
        itemTitle: project.name,
        itemType: 'project',
        user: { id: teamOwnerId, name: 'Team Owner', email: '' }, // Project creator is always team owner
        timestamp: project.createdAt,
        status: project.status,
      });

      // Project edited (if different from created)
      if (project.lastEditedBy && project.lastEditedAt) {
        activities.push({
          id: `project-edited-${project.id}`,
          type: 'project_edited',
          itemId: project.id,
          itemTitle: project.name,
          itemType: 'project',
          user: project.lastEditedByUser,
          timestamp: project.lastEditedAt,
          status: project.status,
        });
      }
    });

    // Add client activities
    recentClients.forEach(client => {
      // Client created
      activities.push({
        id: `client-created-${client.id}`,
        type: 'client_created',
        itemId: client.id,
        itemTitle: client.name,
        itemType: 'client',
        user: { id: teamOwnerId, name: 'Team Owner', email: '' }, // Client creator is always team owner
        timestamp: client.createdAt,
      });

      // Client edited (if different from created)
      if (client.lastEditedBy && client.lastEditedAt) {
        activities.push({
          id: `client-edited-${client.id}`,
          type: 'client_edited',
          itemId: client.id,
          itemTitle: client.name,
          itemType: 'client',
          user: client.lastEditedByUser,
          timestamp: client.lastEditedAt,
        });
      }
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return only the most recent 15 activities
    const recentActivities = activities.slice(0, 15);

    return res.json({ activities: recentActivities });
  } catch (error) {
    console.error('Get activity error:', error);
    return res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export default router;
