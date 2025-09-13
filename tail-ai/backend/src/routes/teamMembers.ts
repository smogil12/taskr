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
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signup?invite=${teamMember.id}`;
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

    // Generate new invitation URL
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signup?invite=${teamMember.id}`;

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
