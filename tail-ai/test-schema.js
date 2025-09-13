const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const teamMembers = await prisma.teamMember.findMany();
    console.log('✅ TeamMember table accessible, count:', teamMembers.length);
    console.log('🎉 Staging database schema test successful!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
