require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Setting up database tables...');

    // Read SQL file
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-db.sql'), 'utf8');

    // Execute SQL
    await sql(sqlScript);

    console.log('✅ Database setup complete!');
    console.log('Tables created: bookings, blocked_dates, settings');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
