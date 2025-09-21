import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Helper function to get team owner ID
async function getTeamOwnerId(userId: string): Promise<string> {
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: userId,
      status: 'ACCEPTED'
    }
  });
  
  return teamMember ? teamMember.invitedBy : userId;
}

// GET /api/reports/summary - Get reports summary data
router.get('/summary', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the team owner ID
    const teamOwnerId = await getTeamOwnerId(userId);

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Get all team members (including the team owner)
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        OR: [
          { invitedBy: teamOwnerId, status: 'ACCEPTED' },
          { userId: teamOwnerId }
        ]
      },
      select: {
        userId: true,
        invitedBy: true,
      }
    });

    // Create array of all team member user IDs (filter out null values)
    const teamMemberIds = [
      teamOwnerId,
      ...teamMembers.map(member => member.userId).filter(id => id !== null)
    ];

    // Debug: Log team member IDs
    console.log('Team member IDs:', teamMemberIds);
    console.log('Start of week:', startOfWeek);
    console.log('Start of month:', startOfMonth);

    // Get time tracking data from task actualHours (since that's where logged hours are stored)
    const tasksWithActualHours = await prisma.task.findMany({
      where: {
        project: {
          userId: teamOwnerId // Get tasks from team owner's projects
        },
        actualHours: {
          gt: 0 // Only tasks with logged hours
        },
        updatedAt: {
          gte: startOfMonth // Tasks updated since start of month
        }
      },
      select: {
        actualHours: true,
        updatedAt: true,
        status: true
      }
    });

    console.log('Found tasks with actual hours:', tasksWithActualHours.length);
    console.log('Tasks with actual hours:', tasksWithActualHours);

    // Calculate time tracking summary from task actualHours
    const thisWeekHours = tasksWithActualHours
      .filter(task => task.updatedAt >= startOfWeek)
      .reduce((total, task) => {
        return total + (task.actualHours || 0);
      }, 0);

    const thisMonthHours = tasksWithActualHours
      .filter(task => task.updatedAt >= startOfMonth)
      .reduce((total, task) => {
        return total + (task.actualHours || 0);
      }, 0);

    // Get project progress data
    const projects = await prisma.project.findMany({
      where: {
        userId: teamOwnerId
      },
      select: {
        status: true,
        createdAt: true
      }
    });

    const activeProjects = projects.filter(project => 
      project.status === 'PLANNING' || project.status === 'IN_PROGRESS' || project.status === 'REVIEW'
    ).length;

    const completedProjects = projects.filter(project => 
      project.status === 'COMPLETED'
    ).length;

    // Get task completion data
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          userId: teamOwnerId
        }
      },
      select: {
        status: true,
        updatedAt: true
      }
    });

    const completedToday = tasks.filter(task => 
      task.status === 'COMPLETED' && 
      task.updatedAt >= startOfToday
    ).length;

    const completedThisWeek = tasks.filter(task => 
      task.status === 'COMPLETED' && 
      task.updatedAt >= startOfWeek
    ).length;

    return res.json({
      timeTracking: {
        thisWeek: Math.round(thisWeekHours * 10) / 10, // Round to 1 decimal place
        thisMonth: Math.round(thisMonthHours * 10) / 10
      },
      projectProgress: {
        active: activeProjects,
        completed: completedProjects
      },
      taskCompletion: {
        completedToday: completedToday,
        completedThisWeek: completedThisWeek
      }
    });

  } catch (error) {
    console.error('Error fetching reports summary:', error);
    return res.status(500).json({ error: 'Failed to fetch reports summary' });
  }
});

export default router;
