const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixTeamMemberPasswords() {
  try {
    console.log('🔍 Finding team members with corrupted passwords...');
    
    // Find all team members who have accepted invitations
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        status: 'ACCEPTED',
        userId: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            password: true
          }
        }
      }
    });

    console.log(`Found ${teamMembers.length} team members`);

    for (const teamMember of teamMembers) {
      if (!teamMember.user) {
        console.log(`⚠️  Team member ${teamMember.email} has no associated user`);
        continue;
      }

      const user = teamMember.user;
      console.log(`\n🔧 Checking user: ${user.email} (${user.name})`);
      
      // Test if the current password hash works
      const testPassword = 'TestPassword123!';
      const currentHashWorks = await bcrypt.compare(testPassword, user.password);
      
      if (currentHashWorks) {
        console.log(`✅ Password for ${user.email} is working correctly`);
        continue;
      }

      // Try to verify with a few common test passwords
      const testPasswords = [
        'TestPassword123!',
        'testpassword',
        'password123',
        'Spencermogil94!',
        'davesimmons340@gmail.com'
      ];

      let workingPassword = null;
      for (const testPwd of testPasswords) {
        const works = await bcrypt.compare(testPwd, user.password);
        if (works) {
          workingPassword = testPwd;
          break;
        }
      }

      if (workingPassword) {
        console.log(`✅ Found working password for ${user.email}: ${workingPassword}`);
      } else {
        console.log(`❌ No working password found for ${user.email}. Hash: ${user.password.substring(0, 20)}...`);
        
        // Generate a new password and hash
        const newPassword = 'NewPassword123!';
        const saltRounds = 12;
        const newHash = await bcrypt.hash(newPassword, saltRounds);
        
        // Update the user's password
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash }
        });
        
        console.log(`🔄 Reset password for ${user.email} to: ${newPassword}`);
        console.log(`   New hash: ${newHash.substring(0, 20)}...`);
      }
    }

    console.log('\n✅ Password fix process completed');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTeamMemberPasswords();
