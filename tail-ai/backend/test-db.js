const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'tail_ai_dev',
  user: 'tail_ai_user',
  password: '',
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✅ Connected to database successfully!');
    
    const result = await client.query('SELECT current_user, current_database(), version()');
    console.log('Database info:', result.rows[0]);
    
    // Test a simple query
    const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', tablesResult.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
