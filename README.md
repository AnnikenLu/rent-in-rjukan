# Rent in Rjukan - Vacation Rental Booking System

A beautiful, full-stack vacation rental website with booking management system for a house in Rjukan, Norway.

## Features

- **Beautiful Frontend**: Scandinavian-inspired design with elegant typography and smooth animations
- **Booking System**: Guests can request bookings with date validation
- **Admin Approval**: All bookings require admin approval before confirmation
- **Admin Panel**: Manage pending requests, approved bookings, and block dates
- **Email Notifications**: Automatic emails to admin and guests for booking updates
- **Calendar Integration**: Visual representation of unavailable dates
- **Responsive Design**: Works perfectly on all devices

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: JSON file storage (simple and lightweight)
- **Email**: Nodemailer

## Quick Start

1. **Install Dependencies**
   ```bash
   cd rent-in-rjukan
   npm install
   ```

2. **Configure Email (Optional)**
   - Copy `.env.example` to `.env`
   - Update with your email credentials:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_EMAIL=admin@rentinrjukan.com
   ```

   **For Gmail:**
   - Enable 2-factor authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the app password in EMAIL_PASS

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Website**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin.html

The system works without email configuration - it will log emails to console instead of sending them.

## Usage

### For Guests

1. Browse the website to learn about the house and Rjukan attractions
2. Fill out the booking form with your dates and information
3. Submit your booking request
4. Wait for email confirmation from the admin

### For Admins

1. Go to http://localhost:3000/admin.html
2. View pending booking requests in real-time
3. Approve or deny requests (guests receive automatic email notifications)
4. Block dates when the house is unavailable
5. Manage all bookings

## Email Configuration

The system sends emails for:
- New booking requests (to admin)
- Booking confirmations (to guest)
- Booking approvals (to guest)
- Booking denials (to guest)

If email is not configured, all email content will be logged to the console instead.

## Database

The system uses JSON files for data storage in the `data/` directory:
- **bookings.json**: Guest booking requests and their status
- **blocked-dates.json**: Date ranges blocked by admin
- **settings.json**: Configuration (admin email, etc.)

All data is automatically created on first run and persisted between sessions.

## Customization

### Images
- Images are located in `public/images/`
- Replace with your own photos (keep the same filenames for consistency)

### Content
- Edit text content in `public/index.html`
- Modify activities and attractions in the Activities section
- Update practical information distances

### Styling
- Colors are defined as CSS variables in `public/styles.css`:
  - `--accent-primary`: Forest green (#4A6B5C)
  - `--accent-secondary`: Terracotta (#C87B5A)
  - `--bg-primary`: Warm off-white (#FAF8F5)
- Fonts: Crimson Pro (headings), Manrope (body)

### Admin Email
- Update admin email in `data/settings.json` after first run
- Or set ADMIN_EMAIL in `.env` file

## Project Structure

```
rent-in-rjukan/
├── public/
│   ├── images/          # House and location photos
│   ├── index.html       # Main website
│   ├── admin.html       # Admin panel
│   ├── styles.css       # All styles
│   ├── script.js        # Main site JavaScript
│   └── admin.js         # Admin panel JavaScript
├── data/                # JSON database files (auto-created)
├── server.js            # Express server and API routes
├── database.js          # Database operations
├── package.json         # Dependencies
├── .env.example         # Example environment variables
└── README.md           # This file
```

## API Endpoints

### Public Endpoints
- `GET /api/unavailable-dates` - Get all booked and blocked dates
- `POST /api/bookings` - Submit a booking request

### Admin Endpoints
- `GET /api/bookings` - Get all bookings
- `PATCH /api/bookings/:id` - Approve/deny a booking
- `DELETE /api/bookings/:id` - Delete a booking
- `GET /api/blocked-dates` - Get all blocked dates
- `POST /api/blocked-dates` - Block new dates
- `DELETE /api/blocked-dates/:id` - Remove blocked dates

## Design Aesthetic

The website features a **Scandinavian Mountain Lodge** aesthetic:
- Warm, earthy color palette inspired by Norwegian nature
- Editorial typography with Crimson Pro and Manrope fonts
- Large, immersive photography
- Generous white space and clean layouts
- Smooth animations and transitions
- Light theme with excellent readability

## Security Note

This is a simple booking system intended for personal use. For production deployment, consider adding:
- Authentication for the admin panel (password protection)
- HTTPS/SSL certificates
- Rate limiting on API endpoints
- CSRF protection
- Input sanitization and validation
- Backup system for data files

## Troubleshooting

**Server won't start:**
- Make sure port 3000 is not in use
- Check that Node.js is installed (`node --version`)
- Try removing `node_modules` and running `npm install` again

**Emails not sending:**
- Verify your `.env` file has correct credentials
- For Gmail, make sure you're using an App Password, not your regular password
- Check the console for email logs when testing

**Images not showing:**
- Verify images are in `public/images/` directory
- Check that filenames match exactly (case-sensitive)
- Clear browser cache and reload

## License

Private use only. All rights reserved.
