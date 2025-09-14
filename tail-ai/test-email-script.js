const { EmailService } = require('./backend/dist/services/emailService');

async function testEmailSending() {
  console.log('🧪 Testing Email Service from dev.tailapp.ai backend...\n');

  // Test 1: Team Invitation Email
  console.log('📧 Test 1: Team Invitation Email');
  console.log('=' .repeat(50));
  
  const invitationData = {
    email: 'test@example.com',
    inviterName: 'Spencer Mogil',
    invitationUrl: 'https://dev.tailapp.ai/auth/signup?invite=test123',
    role: 'MEMBER'
  };

  console.log('📤 Sending invitation email to:', invitationData.email);
  console.log('🔗 Invitation URL:', invitationData.invitationUrl);
  console.log('👤 Inviter:', invitationData.inviterName);
  console.log('🎭 Role:', invitationData.role);
  console.log('');

  try {
    const result = await EmailService.sendTeamInvitationEmail(invitationData);
    
    if (result.success) {
      console.log('✅ Team invitation email sent successfully!');
    } else {
      console.log('❌ Failed to send team invitation:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending team invitation:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('');

  // Test 2: Email Verification
  console.log('📧 Test 2: Email Verification');
  console.log('=' .repeat(50));
  
  const verificationData = {
    email: 'test@example.com',
    name: 'Test User',
    verificationToken: 'test-verification-token-123'
  };

  console.log('📤 Sending verification email to:', verificationData.email);
  console.log('🔗 Verification URL: https://dev.tailapp.ai/auth/verify-email?token=' + verificationData.verificationToken);
  console.log('');

  try {
    const result = await EmailService.sendVerificationEmail(verificationData);
    
    if (result.success) {
      console.log('✅ Verification email sent successfully!');
    } else {
      console.log('❌ Failed to send verification email:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending verification email:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('');

  // Test 3: Password Reset
  console.log('📧 Test 3: Password Reset Email');
  console.log('=' .repeat(50));
  
  const resetData = {
    email: 'test@example.com',
    name: 'Test User',
    resetToken: 'test-reset-token-123'
  };

  console.log('📤 Sending password reset email to:', resetData.email);
  console.log('🔗 Reset URL: https://dev.tailapp.ai/auth/reset-password?token=' + resetData.resetToken);
  console.log('');

  try {
    const result = await EmailService.sendPasswordResetEmail(resetData);
    
    if (result.success) {
      console.log('✅ Password reset email sent successfully!');
    } else {
      console.log('❌ Failed to send password reset email:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending password reset email:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('');

  // Show email templates
  console.log('📄 Email Templates Preview:');
  console.log('=' .repeat(50));
  
  console.log('\n🔗 Team Invitation Template:');
  console.log('-'.repeat(30));
  const invitationTemplate = EmailService.getTeamInvitationEmailTemplate(
    invitationData.inviterName,
    invitationData.invitationUrl,
    invitationData.role
  );
  console.log(invitationTemplate.substring(0, 500) + '...');
  
  console.log('\n🔗 Verification Template:');
  console.log('-'.repeat(30));
  const verificationTemplate = EmailService.getVerificationEmailTemplate(
    verificationData.name,
    'https://dev.tailapp.ai/auth/verify-email?token=' + verificationData.verificationToken
  );
  console.log(verificationTemplate.substring(0, 500) + '...');

  console.log('\n✅ Email testing complete!');
  console.log('📝 Note: In staging mode, emails are logged but not actually sent to avoid using up quota.');
}

// Run the test
testEmailSending().catch(console.error);



