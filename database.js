const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const bookingsFile = path.join(dataDir, 'bookings.json');
const blockedDatesFile = path.join(dataDir, 'blocked-dates.json');
const settingsFile = path.join(dataDir, 'settings.json');

// Initialize data directory and files
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

if (!fs.existsSync(bookingsFile)) {
  fs.writeFileSync(bookingsFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(blockedDatesFile)) {
  fs.writeFileSync(blockedDatesFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(settingsFile)) {
  fs.writeFileSync(settingsFile, JSON.stringify({
    admin_email: 'admin@rentinrjukan.com'
  }, null, 2));
}

// Helper functions to read and write data
function readJSON(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
  }
}

// Booking operations
const bookingOps = {
  getAll() {
    return readJSON(bookingsFile);
  },

  getById(id) {
    const bookings = this.getAll();
    return bookings.find(b => b.id === id);
  },

  getPending() {
    const bookings = this.getAll();
    return bookings.filter(b => b.status === 'pending');
  },

  getApproved() {
    const bookings = this.getAll();
    return bookings.filter(b => b.status === 'approved');
  },

  create(bookingData) {
    const bookings = this.getAll();
    const id = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;

    const newBooking = {
      id,
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    bookings.push(newBooking);
    writeJSON(bookingsFile, bookings);
    return newBooking;
  },

  updateStatus(id, status) {
    const bookings = this.getAll();
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) return null;

    bookings[index].status = status;
    writeJSON(bookingsFile, bookings);
    return bookings[index];
  },

  delete(id) {
    const bookings = this.getAll();
    const filtered = bookings.filter(b => b.id !== id);
    writeJSON(bookingsFile, filtered);
    return true;
  }
};

// Blocked dates operations
const blockedDatesOps = {
  getAll() {
    return readJSON(blockedDatesFile);
  },

  create(dateData) {
    const blockedDates = this.getAll();
    const id = blockedDates.length > 0 ? Math.max(...blockedDates.map(b => b.id)) + 1 : 1;

    const newBlockedDate = {
      id,
      ...dateData,
      created_at: new Date().toISOString()
    };

    blockedDates.push(newBlockedDate);
    writeJSON(blockedDatesFile, blockedDates);
    return newBlockedDate;
  },

  delete(id) {
    const blockedDates = this.getAll();
    const filtered = blockedDates.filter(b => b.id !== id);
    writeJSON(blockedDatesFile, filtered);
    return true;
  }
};

// Settings operations
const settingsOps = {
  get(key) {
    const settings = readJSON(settingsFile);
    return settings[key];
  },

  set(key, value) {
    const settings = readJSON(settingsFile);
    settings[key] = value;
    writeJSON(settingsFile, settings);
    return value;
  }
};

module.exports = {
  bookings: bookingOps,
  blockedDates: blockedDatesOps,
  settings: settingsOps
};
