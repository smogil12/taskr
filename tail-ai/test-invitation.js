const { EmailService } = require('./backend/src/services/emailService');

async function testInvitation() {
  try {
    const invitationData = {
      email: 'smogil@udel.edu',
      inviterName: 'Spencer Mogil',
      invitationUrl: 'https://dev.tailapp.ai/auth/signup?invite=test123',
      role: 'MEMBER'
    };

    console.log('Sending test invitation to:', invitationData.email);
    console.log('Invitation URL:', invitationData.invitationUrl);
    
    const result = await EmailService.sendTeamInvitationEmail(invitationData);
    
    if (result.success) {
      console.log('✅ Invitation email sent successfully!');
    } else {
      console.log('❌ Failed to send invitation:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInvitation();
