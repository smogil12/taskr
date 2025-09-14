import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { EmailService } from '../services/emailService';

const router = Router();

// GET /api/team-members - Get all team members for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        invitedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    });

    return res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/team-members - Invite a new team member
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, role = 'MEMBER' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // Check if team member already exists
    const existingTeamMember = await prisma.teamMember.findUnique({
      where: { email }
    });

    if (existingTeamMember) {
      return res.status(400).json({ error: 'User has already been invited' });
    }

    // Create team member invitation
    const teamMember = await prisma.teamMember.create({
      data: {
        email,
        role,
        status: 'PENDING',
        invitedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true
          }
        }
      }
    });

    // Send invitation email
    try {
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/accept-invite?invite=${teamMember.id}`;
      const inviterName = req.user?.name || 'Team Member';
      
      console.log(`📧 Sending team invitation to ${email} by ${inviterName}`);
      console.log(`🔗 Invitation URL: ${invitationUrl}`);
      
      // Send actual invitation email
      const emailResult = await EmailService.sendTeamInvitationEmail({
        email,
        inviterName,
        invitationUrl,
        role
      });
      
      if (emailResult.success) {
        console.log(`✅ Team invitation email sent successfully to ${email}`);
      } else {
        console.error(`❌ Failed to send invitation email to ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json(teamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/team-members/:id - Update team member role
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id,
        invitedBy: userId
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const updatedTeamMember = await prisma.teamMember.update({
      where: { id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true
          }
        }
      }
    });

    return res.json(updatedTeamMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/team-members/:id - Remove team member
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id,
        invitedBy: userId
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await prisma.teamMember.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting team member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invitation details by ID (for frontend to fetch invitation info)
router.get('/invite/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Only return invitation details for pending invitations
    if (teamMember.status !== 'PENDING') {
      return res.status(400).json({ error: 'Invitation has already been accepted or expired' });
    }

    return res.json({
      id: teamMember.id,
      email: teamMember.email,
      role: teamMember.role,
      inviterName: teamMember.inviter?.name || 'Team Admin',
      invitedAt: teamMember.invitedAt
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept team invitation
router.post('/accept-invite', async (req, res) => {
  try {
    const { inviteId, name, password } = req.body;

    if (!inviteId || !name || !password) {
      return res.status(400).json({ error: 'Invite ID, name, and password are required' });
    }

    // Find the invitation
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: inviteId },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (teamMember.status !== 'PENDING') {
      return res.status(400).json({ error: 'Invitation has already been accepted or expired' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: teamMember.email }
    });

    let user;
    let userCreated = false;

    if (existingUser) {
      // User already exists, just add them to the team
      user = existingUser;
    } else {
      // Create new user
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      user = await prisma.user.create({
        data: {
          name,
          email: teamMember.email,
          password: hashedPassword,
          subscriptionTier: 'FREE',
          isEmailVerified: true, // Skip email verification for invited users
        }
      });
      userCreated = true;
    }

    // Update team member to accepted status and link to user
    await prisma.teamMember.update({
      where: { id: inviteId },
      data: {
        status: 'ACCEPTED',
        userId: user.id,
        acceptedAt: new Date()
      }
    });

    console.log(`✅ Team invitation accepted: ${teamMember.email} joined team`);

    return res.json({
      message: 'Invitation accepted successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      },
      userCreated,
      teamMember: {
        id: teamMember.id,
        role: teamMember.role,
        status: 'ACCEPTED'
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend invitation email
router.post('/resend', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const user = req.user;
    
    console.log(`🔄 RESEND REQUEST: Email ${email} from IP ${req.ip}`);
    console.log(`🔄 User: ${user?.email || 'No user'}`);

    if (!user) {
      console.log(`❌ RESEND FAILED: No user found in request`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the team member by email
    const teamMember = await prisma.teamMember.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Check if user has permission to resend invitation
    if (teamMember.invitedBy !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Only resend for pending invitations
    if (teamMember.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only resend pending invitations' });
    }

    // Generate new invitation URL - use accept-invite instead of signup
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/accept-invite?invite=${teamMember.id}`;

    // Send invitation email
    const emailResult = await EmailService.sendTeamInvitationEmail({
      email: teamMember.email,
      inviterName: user.name || 'Team Admin',
      invitationUrl,
      role: teamMember.role
    });

    if (!emailResult.success) {
      console.error('Failed to send resend invitation email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send invitation email' });
    }

    console.log(`📧 Resend invitation email sent to: ${teamMember.email}`);
    console.log(`🔗 Invitation URL: ${invitationUrl}`);

    return res.json({ 
      message: 'Invitation resent successfully',
      email: teamMember.email
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
