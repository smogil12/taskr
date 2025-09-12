import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requirePermission, requireUserManagement } from '../middleware/permissions'
import { Permission, UserRole, PermissionChecker } from '../utils/permissions'
import { EmailService } from '../services/emailService'
const { body, validationResult } = require('express-validator')

const router = express.Router()
const prisma = new PrismaClient()

// Validation middleware
const validateTeamMember = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().isString().withMessage('Name must be a string'),
  body('role').optional().isIn(['OWNER', 'ADMIN', 'MEMBER']).withMessage('Role must be OWNER, ADMIN, or MEMBER'),
]

// Get all team members for the authenticated user
router.get('/', 
  authenticateToken, 
  requirePermission(Permission.VIEW_TEAM_MEMBERS),
  async (req: any, res: any) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        ownerId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    })

    res.json({ teamMembers })
  } catch (error) {
    console.error('Error fetching team members:', error)
    res.status(500).json({ error: 'Failed to fetch team members' })
  }
})

// Get team members that can be assigned to tasks (accepted members)
router.get('/assignable', 
  authenticateToken, 
  requirePermission(Permission.ASSIGN_TASKS),
  async (req: any, res: any) => {
  try {
    const assignableMembers = await prisma.teamMember.findMany({
      where: {
        ownerId: req.user.id,
        status: 'ACCEPTED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Add the owner (current user) to the list
    const owner = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    const allAssignableMembers = [
      { id: owner?.id, name: owner?.name, email: owner?.email, isOwner: true },
      ...assignableMembers.map(member => ({
        id: member.user?.id || member.id,
        name: member.user?.name || member.name,
        email: member.user?.email || member.email,
        isOwner: false
      }))
    ]

    res.json({ teamMembers: allAssignableMembers })
  } catch (error) {
    console.error('Error fetching assignable team members:', error)
    res.status(500).json({ error: 'Failed to fetch assignable team members' })
  }
})

// Invite a new team member
router.post('/', 
  authenticateToken, 
  requirePermission(Permission.INVITE_TEAM_MEMBERS),
  validateTeamMember, 
  async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      })
    }

    const { email, name, role = 'MEMBER' } = req.body

    // Check if user is trying to invite themselves
    if (email === req.user.email) {
      return res.status(400).json({ error: 'Cannot invite yourself as a team member' })
    }

    // Check if team member already exists
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        ownerId: req.user.id,
        email: email
      }
    })

    if (existingMember) {
      return res.status(409).json({ error: 'Team member with this email already exists' })
    }

    // Check if the email belongs to an existing user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    let userId = existingUser?.id
    let userStatus = existingUser ? 'ACCEPTED' : 'PENDING'
    let joinedAt = existingUser ? new Date() : null

    // If user doesn't exist, create a user account for them
    if (!existingUser) {
      // Generate email verification token
      const verificationToken = EmailService.generateVerificationToken()
      const verificationExpires = EmailService.getVerificationExpiry()

      const newUser = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Use email prefix as name if not provided
          password: 'temp_password_placeholder', // Temporary password, will be set during verification
          subscriptionTier: 'FREE',
          isEmailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        }
      })

      userId = newUser.id

      // Send team invitation email with verification token
      const emailResult = await EmailService.sendTeamInvitationEmail({
        name: newUser.name,
        email: newUser.email,
        verificationToken,
        inviterName: req.user.name,
        role
      })

      if (!emailResult.success) {
        console.error('Failed to send team invitation email:', emailResult.error)
        // Don't fail the invitation, but log the error
      }
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        email,
        name: name || existingUser?.name,
        role,
        ownerId: req.user.id,
        userId: userId,
        status: userStatus,
        joinedAt: joinedAt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    res.status(201).json({
      message: 'Team member invited successfully',
      teamMember
    })
  } catch (error) {
    console.error('Error inviting team member:', error)
    res.status(500).json({ error: 'Failed to invite team member' })
  }
})

// Update team member role
router.put('/:id', 
  authenticateToken, 
  requirePermission(Permission.CHANGE_TEAM_ROLES),
  async (req: any, res: any) => {
  try {
    const { role } = req.body

    if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    })

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' })
    }

    // Check if user can change this role
    const currentRole = teamMember.role as UserRole
    const newRole = role as UserRole
    const userRole = req.userRole as UserRole

    if (!PermissionChecker.canChangeRole(currentRole, newRole, userRole)) {
      return res.status(403).json({ 
        error: 'Cannot change role',
        currentRole,
        newRole,
        userRole
      })
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    res.json({
      message: 'Team member updated successfully',
      teamMember: updatedMember
    })
  } catch (error) {
    console.error('Error updating team member:', error)
    res.status(500).json({ error: 'Failed to update team member' })
  }
})

// Remove team member
router.delete('/:id', 
  authenticateToken, 
  requirePermission(Permission.REMOVE_TEAM_MEMBERS),
  async (req: any, res: any) => {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    })

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' })
    }

    await prisma.teamMember.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Team member removed successfully' })
  } catch (error) {
    console.error('Error removing team member:', error)
    res.status(500).json({ error: 'Failed to remove team member' })
  }
})

// Accept team invitation (for invited users)
router.post('/accept/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: req.params.id,
        email: req.user.email,
        status: 'PENDING'
      }
    })

    if (!teamMember) {
      return res.status(404).json({ error: 'Team invitation not found' })
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: {
        status: 'ACCEPTED',
        userId: req.user.id,
        joinedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    res.json({
      message: 'Team invitation accepted successfully',
      teamMember: updatedMember
    })
  } catch (error) {
    console.error('Error accepting team invitation:', error)
    res.status(500).json({ error: 'Failed to accept team invitation' })
  }
})

// Resend team invitation email
router.post('/:id/resend', authenticateToken, async (req: any, res: any) => {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id,
        status: 'PENDING'
      }
    })

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found or not pending' })
    }

    // Check if user account exists, if not create one
    let user = await prisma.user.findUnique({
      where: { email: teamMember.email }
    })

    if (!user) {
      // Create user account for the team member
      const verificationToken = EmailService.generateVerificationToken()
      const verificationExpires = EmailService.getVerificationExpiry()

      user = await prisma.user.create({
        data: {
          email: teamMember.email,
          name: teamMember.name || teamMember.email.split('@')[0],
          password: 'temp_password_placeholder',
          subscriptionTier: 'FREE',
          isEmailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        }
      })

      // Update team member with user ID
      await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: { userId: user.id }
      })
    } else {
      // User exists, generate new verification token
      const verificationToken = EmailService.generateVerificationToken()
      const verificationExpires = EmailService.getVerificationExpiry()

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        }
      })
    }

    // Send team invitation email
    const emailResult = await EmailService.sendTeamInvitationEmail({
      name: teamMember.name || user.name,
      email: teamMember.email,
      verificationToken: user.emailVerificationToken!,
      inviterName: req.user.name,
      role: teamMember.role
    })

    if (!emailResult.success) {
      console.error('Failed to send team invitation email:', emailResult.error)
      return res.status(500).json({ 
        error: 'Failed to send invitation email',
        details: emailResult.error 
      })
    }

    res.json({ message: 'Team invitation email sent successfully' })
  } catch (error) {
    console.error('Error resending team invitation:', error)
    res.status(500).json({ error: 'Failed to resend team invitation' })
  }
})

// Decline team invitation
router.post('/decline/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: req.params.id,
        email: req.user.email,
        status: 'PENDING'
      }
    })

    if (!teamMember) {
      return res.status(404).json({ error: 'Team invitation not found' })
    }

    await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { status: 'DECLINED' }
    })

    res.json({ message: 'Team invitation declined successfully' })
  } catch (error) {
    console.error('Error declining team invitation:', error)
    res.status(500).json({ error: 'Failed to decline team invitation' })
  }
})

export default router
