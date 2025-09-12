const { PrismaClient } = require('@prisma/client');
const { EmailService } = require('./src/services/emailService');

const prisma = new PrismaClient();

async function sendVerificationEmail(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    if (user.isEmailVerified) {
      console.log('✅ User email is already verified');
      return;
    }

    console.log(`📧 Sending verification email to: ${email}`);
    
    // Generate new verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationExpires = EmailService.getVerificationExpiry();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      }
    });

    // Send verification email
    const result = await EmailService.sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationToken
    });

    if (result.success) {
      console.log('✅ Verification email sent successfully!');
      console.log(`📬 Check ${email} for the verification link`);
    } else {
      console.log('❌ Failed to send verification email:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node send-verification.js <email>');
  process.exit(1);
}

sendVerificationEmail(email);
