import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PermissionChecker, Permission, UserRole, getUserRole } from '../utils/permissions';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    subscriptionTier: string;
  };
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permission: Permission) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's role from team members table
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACCEPTED'
        }
      });

      // Check if user is the account owner
      const isAccountOwner = await prisma.project.findFirst({
        where: {
          userId: req.user.id
        }
      }).then(project => !!project);

      const userRole = getUserRole(teamMember, isAccountOwner);

      if (!PermissionChecker.hasPermission(userRole, permission)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          userRole: userRole
        });
      }

      // Add user role to request for use in route handlers
      (req as any).userRole = userRole;
      return next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to check if user can manage another user
 */
export function requireUserManagement() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const targetUserId = req.params.userId || req.body.userId;
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID required' });
      }

      // Get manager's role
      const managerTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACCEPTED'
        }
      });

      const isManagerAccountOwner = await prisma.project.findFirst({
        where: {
          userId: req.user.id
        }
      }).then(project => !!project);

      const managerRole = getUserRole(managerTeamMember, isManagerAccountOwner);

      // Get target user's role
      const targetTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: targetUserId,
          status: 'ACCEPTED'
        }
      });

      const isTargetAccountOwner = await prisma.project.findFirst({
        where: {
          userId: targetUserId
        }
      }).then(project => !!project);

      const targetRole = getUserRole(targetTeamMember, isTargetAccountOwner);

      if (!PermissionChecker.canManageUser(managerRole, targetRole)) {
        return res.status(403).json({ 
          error: 'Cannot manage this user',
          managerRole: managerRole,
          targetRole: targetRole
        });
      }

      (req as any).userRole = managerRole;
      (req as any).targetUserRole = targetRole;
      return next();
    } catch (error) {
      console.error('User management check error:', error);
      return res.status(500).json({ error: 'User management check failed' });
    }
  };
}

/**
 * Middleware to check if user can access a project
 */
export function requireProjectAccess() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      // Get project details
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get user's role
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACCEPTED'
        }
      });

      const isAccountOwner = await prisma.project.findFirst({
        where: {
          userId: req.user.id
        }
      }).then(project => !!project);

      const userRole = getUserRole(teamMember, isAccountOwner);
      
      // Check if user is assigned to this project via team members
      const isAssigned = await prisma.teamMember.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACCEPTED',
          ownerId: project.userId
        }
      }).then(member => !!member);

      if (!PermissionChecker.canAccessProject(userRole, project.userId, req.user.id, isAssigned)) {
        return res.status(403).json({ 
          error: 'Access denied to this project',
          userRole: userRole,
          projectOwner: project.userId
        });
      }

      (req as any).userRole = userRole;
      (req as any).project = project;
      return next();
    } catch (error) {
      console.error('Project access check error:', error);
      return res.status(500).json({ error: 'Project access check failed' });
    }
  };
}

/**
 * Middleware to check if user can access a task
 */
export function requireTaskAccess() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const taskId = req.params.taskId || req.params.id;
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID required' });
      }

      // Get task details with project info
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: true
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get user's role
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACCEPTED'
        }
      });

      const isAccountOwner = await prisma.project.findFirst({
        where: {
          userId: req.user.id
        }
      }).then(project => !!project);

      const userRole = getUserRole(teamMember, isAccountOwner);
      
      // Check if user is assigned to this task or project
      const isAssigned = task.assignedTo === req.user.id || await prisma.teamMember.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACCEPTED',
          ownerId: task.project.userId
        }
      }).then(member => !!member);

      if (!PermissionChecker.canAccessTask(userRole, task.project.userId, req.user.id, isAssigned)) {
        return res.status(403).json({ 
          error: 'Access denied to this task',
          userRole: userRole,
          taskOwner: task.project.userId
        });
      }

      (req as any).userRole = userRole;
      (req as any).task = task;
      return next();
    } catch (error) {
      console.error('Task access check error:', error);
      return res.status(500).json({ error: 'Task access check failed' });
    }
  };
}
