const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAcceptInvite() {
  try {
    console.log('🧪 Testing accept-invite process...');
    
    const testEmail = 'testuser@example.com';
    const testPassword = 'TestPassword123!';
    const testName = 'Test User';
    
    // First, create a test invitation
    console.log('📧 Creating test invitation...');
    const teamMember = await prisma.teamMember.create({
      data: {
        email: testEmail,
        role: 'MEMBER',
        status: 'PENDING',
        invitedBy: 'cmf36h4pn0001rxu9xcyfowjh', // smogil12@gmail.com
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });
    
    console.log('✅ Test invitation created:', teamMember.id);
    
    // Now simulate the accept-invite process
    console.log('🔐 Testing password hashing...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    
    console.log('Original password:', testPassword);
    console.log('Generated hash:', hashedPassword);
    
    // Test the hash immediately
    const verification = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Immediate verification:', verification);
    
    // Create the user
    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        name: testName,
        email: testEmail,
        password: hashedPassword,
        subscriptionTier: 'FREE',
        isEmailVerified: true
      }
    });
    
    console.log('✅ User created:', user.id);
    
    // Test login with the created user
    console.log('🔍 Testing login simulation...');
    const foundUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (foundUser) {
      console.log('Found user:', foundUser.email);
      console.log('Stored hash:', foundUser.password);
      
      // Test password verification
      const loginVerification = await bcrypt.compare(testPassword, foundUser.password);
      console.log('Login verification:', loginVerification);
      
      if (loginVerification) {
        console.log('✅ Login would succeed!');
      } else {
        console.log('❌ Login would fail!');
      }
    }
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.teamMember.delete({ where: { id: teamMember.id } });
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAcceptInvite();
