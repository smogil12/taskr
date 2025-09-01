const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'tail_ai_dev',
  user: 'tail_ai_user',
  password: '',
});

async function testSchema() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully!');
    
    // Test 1: Check database info
    console.log('\n📊 Database Information:');
    const dbInfo = await client.query('SELECT current_user, current_database(), version()');
    console.log('Current User:', dbInfo.rows[0].current_user);
    console.log('Database:', dbInfo.rows[0].current_database);
    console.log('Version:', dbInfo.rows[0].version.split(',')[0]);
    
    // Test 2: List all tables
    console.log('\n📋 Tables in database:');
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Test 3: Test table structure
    console.log('\n🏗️  Table structures:');
    for (const table of tables.rows) {
      const tableName = table.table_name;
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`\n  ${tableName}:`);
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`    ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }
    
    // Test 4: Test basic CRUD operations
    console.log('\n🧪 Testing basic CRUD operations...');
    
    // Create a test user
    const testUserId = 'test_user_' + Date.now();
    await client.query(`
      INSERT INTO users (id, email, name, password) 
      VALUES ($1, $2, $3, $4)
    `, [testUserId, 'test@example.com', 'Test User', 'hashed_password']);
    console.log('✅ Created test user');
    
    // Read the user
    const user = await client.query('SELECT * FROM users WHERE id = $1', [testUserId]);
    console.log('✅ Read test user:', user.rows[0].email);
    
    // Update the user
    await client.query('UPDATE users SET name = $1 WHERE id = $2', ['Updated Test User', testUserId]);
    console.log('✅ Updated test user');
    
    // Delete the user
    await client.query('DELETE FROM users WHERE id = $1', [testUserId]);
    console.log('✅ Deleted test user');
    
    console.log('\n🎉 All database tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

testSchema();
