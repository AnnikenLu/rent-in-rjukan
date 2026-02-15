const { neon } = require('@neondatabase/serverless');

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database tables (runs on first load)
async function initDatabase() {
  try {
    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INTEGER NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create blocked_dates table
    await sql`
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id SERIAL PRIMARY KEY,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default admin email if not exists
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('admin_email', ${process.env.ADMIN_EMAIL || 'rentinrjukan@gmail.com'})
      ON CONFLICT (key) DO NOTHING
    `;

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run initialization
initDatabase();

// Booking operations
const bookingOps = {
  async getAll() {
    const result = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return result;
  },

  async getById(id) {
    const result = await sql`SELECT * FROM bookings WHERE id = ${id}`;
    return result[0] || null;
  },

  async getPending() {
    const result = await sql`SELECT * FROM bookings WHERE status = 'pending' ORDER BY created_at DESC`;
    return result;
  },

  async getApproved() {
    const result = await sql`SELECT * FROM bookings WHERE status = 'approved' ORDER BY check_in ASC`;
    return result;
  },

  async create(bookingData) {
    const { guest_name, guest_email, guest_phone, check_in, check_out, guests, message } = bookingData;

    const result = await sql`
      INSERT INTO bookings (guest_name, guest_email, guest_phone, check_in, check_out, guests, message, status)
      VALUES (${guest_name}, ${guest_email}, ${guest_phone || null}, ${check_in}, ${check_out}, ${guests}, ${message || null}, 'pending')
      RETURNING *
    `;

    return result[0];
  },

  async updateStatus(id, status) {
    const result = await sql`
      UPDATE bookings
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    return result[0] || null;
  },

  async delete(id) {
    await sql`DELETE FROM bookings WHERE id = ${id}`;
    return true;
  }
};

// Blocked dates operations
const blockedDatesOps = {
  async getAll() {
    const result = await sql`SELECT * FROM blocked_dates ORDER BY start_date ASC`;
    return result;
  },

  async create(dateData) {
    const { start_date, end_date, reason } = dateData;

    const result = await sql`
      INSERT INTO blocked_dates (start_date, end_date, reason)
      VALUES (${start_date}, ${end_date}, ${reason || null})
      RETURNING *
    `;

    return result[0];
  },

  async delete(id) {
    await sql`DELETE FROM blocked_dates WHERE id = ${id}`;
    return true;
  }
};

// Settings operations
const settingsOps = {
  async get(key) {
    const result = await sql`SELECT value FROM settings WHERE key = ${key}`;
    return result[0]?.value || null;
  },

  async set(key, value) {
    await sql`
      INSERT INTO settings (key, value)
      VALUES (${key}, ${value})
      ON CONFLICT (key)
      DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
    `;
    return value;
  }
};

module.exports = {
  bookings: bookingOps,
  blockedDates: blockedDatesOps,
  settings: settingsOps
};
