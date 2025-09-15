const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugActivity() {
  console.log('Starting activity route debug...\n');

  try {
    // 1. Check if database is connected
    console.log('1. Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected\n');

    // 2. Check if activity tracking columns exist
    console.log('2. Checking if activity tracking columns exist...');

    // Check tasks table
    const taskColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tasks'
      AND column_name IN ('createdBy', 'lastEditedBy', 'lastEditedAt')
    `;
    console.log('Tasks table columns:', taskColumns);

    // Check projects table
    const projectColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'projects'
      AND column_name IN ('lastEditedBy', 'lastEditedAt')
    `;
    console.log('Projects table columns:', projectColumns);

    // Check clients table
    const clientColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name IN ('lastEditedBy', 'lastEditedAt')
    `;
    console.log('Clients table columns:', clientColumns);

    // 3. Check foreign key constraints
    console.log('\n3. Checking foreign key constraints...');
    const constraints = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('tasks', 'projects', 'clients')
      AND kcu.column_name IN ('createdBy', 'lastEditedBy');
    `;
    console.log('Foreign key constraints:', constraints);

    // 4. Try to fetch some data like the activity route does
    console.log('\n4. Testing activity query...');

    // Get any user to test with
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      return;
    }

    const userId = users[0].id;
    console.log(`Testing with user ID: ${userId}`);

    // Try the same query as the activity route
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          userId: userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lastEditedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 5,
    });

    console.log(`✅ Successfully fetched ${tasks.length} tasks`);

    // Check if any tasks have the new fields
    const tasksWithCreatedBy = tasks.filter(t => t.createdBy);
    const tasksWithLastEditedBy = tasks.filter(t => t.lastEditedBy);

    console.log(`  - Tasks with createdBy: ${tasksWithCreatedBy.length}`);
    console.log(`  - Tasks with lastEditedBy: ${tasksWithLastEditedBy.length}`);

    console.log('\n✅ Debug complete - no errors found!');

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.error('Stack trace:', error.stack);

    if (error.code === 'P2002') {
      console.error('This is a unique constraint violation');
    } else if (error.code === 'P2003') {
      console.error('This is a foreign key constraint violation');
    } else if (error.code === 'P2025') {
      console.error('Record not found');
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugActivity();