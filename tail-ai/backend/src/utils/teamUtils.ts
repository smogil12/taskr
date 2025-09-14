import { prisma } from '../index';

/**
 * Get the team owner ID for a team member
 * If the user is a team member, returns the ID of the user who invited them
 * If the user is not a team member, returns their own ID
 */
export async function getTeamOwnerId(userId: string): Promise<string> {
  try {
    // Check if this user is a team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        status: 'ACCEPTED'
      },
      select: {
        invitedBy: true
      }
    });

    // If user is a team member, return the inviter's ID (team owner)
    // If not a team member, return their own ID
    return teamMember?.invitedBy || userId;
  } catch (error) {
    console.error('Error getting team owner ID:', error);
    // Fallback to user's own ID if there's an error
    return userId;
  }
}

/**
 * Check if a user is a team member
 */
export async function isTeamMember(userId: string): Promise<boolean> {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        status: 'ACCEPTED'
      }
    });

    return !!teamMember;
  } catch (error) {
    console.error('Error checking if user is team member:', error);
    return false;
  }
}

/**
 * Get team member role for a user
 */
export async function getTeamMemberRole(userId: string): Promise<string | null> {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        status: 'ACCEPTED'
      },
      select: {
        role: true
      }
    });

    return teamMember?.role || null;
  } catch (error) {
    console.error('Error getting team member role:', error);
    return null;
  }
}
