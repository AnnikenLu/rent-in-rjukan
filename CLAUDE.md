# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vacation rental booking system for a house in Rjukan, Norway. Deployed on Vercel with Neon Postgres database.

**Production URL**: https://rent-in-rjukan.vercel.app

## Development Commands

```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev

# Production mode
npm start

# Deploy to production
vercel --prod
```

## Architecture

### Database Layer (`database.js`)

**IMPORTANT**: This project uses **Neon Postgres** (serverless), NOT JSON files.

- Database connection via `@neondatabase/serverless`
- Auto-initializes tables on first load (`CREATE TABLE IF NOT EXISTS`)
- All database operations are **async** - always use `await`
- Tables: `bookings`, `blocked_dates`, `settings`

**Key Pattern**:
```javascript
// All database operations are async
const bookings = await db.bookings.getAll();
const booking = await db.bookings.create(data);
```

### Server Layer (`server.js`)

Express server with async route handlers. **All routes must be async** because database operations are async.

**Important Functions**:
- `checkDateAvailability(checkIn, checkOut, excludeBookingId)` - Async function that validates booking dates against existing bookings and blocked dates
- `sendEmail(to, subject, html)` - Sends emails via Nodemailer (skips if EMAIL_USER/EMAIL_PASS not configured)

### Frontend

Two main pages:
- `public/index.html` + `public/script.js` - Public booking site
- `public/admin.html` + `public/admin.js` - Admin panel (no authentication)

**Design System** (`public/styles.css`):
- CSS variables: `--accent-primary` (forest green), `--accent-secondary` (terracotta), `--bg-primary` (warm off-white)
- Fonts: Crimson Pro (headings), Manrope (body)
- Mobile-first responsive design

## Environment Variables

**Required in Vercel**:
- `DATABASE_URL` - Neon Postgres connection string (auto-added by Vercel)
- `EMAIL_USER` - Gmail address (e.g., `rentinrjukan@gmail.com`)
- `EMAIL_PASS` - Gmail App Password (16 characters, **no spaces**)
- `ADMIN_EMAIL` - Email to receive booking notifications

**Local Development**:
Create `.env` file (see `.env.example`). Email is optional for local dev - will log to console if not configured.

## Deployment (Vercel)

The project is configured for Vercel serverless deployment:

1. **vercel.json**: Routes API calls to `server.js`, static files to `public/`
2. **Database**: Neon Postgres (serverless) - set up via Vercel Storage
3. **Auto-deploy**: Pushes to `main` branch trigger deployment

**Database Setup** (if recreating):
1. Vercel Dashboard → Storage → Create → Neon Postgres
2. Connect to project → Auto-adds `DATABASE_URL` to environment variables
3. Tables auto-create on first server load

## Email System

Uses Nodemailer with Gmail SMTP:

**Gmail Setup**:
1. Enable 2-factor authentication on Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `EMAIL_PASS` (remove spaces)

**Email Flow**:
- Guest submits booking → Email to `ADMIN_EMAIL` + confirmation to guest
- Admin approves/denies → Email to guest
- If EMAIL_USER/EMAIL_PASS not set → Logs to console instead

## Common Pitfalls

1. **Async/Await**: All database calls must use `await`. Missing `await` causes undefined/promise issues.
2. **Email Password**: Must be Gmail App Password (not regular password), without spaces
3. **Read-Only Filesystem**: Vercel serverless functions can't write to disk - that's why we use Postgres, not JSON files
4. **Admin Panel**: Currently has NO authentication - anyone with URL can access. Consider adding password protection for production use.

## API Endpoints

**Public**:
- `GET /api/unavailable-dates` - Calendar data (approved bookings + blocked dates)
- `POST /api/bookings` - Submit booking request

**Admin** (no auth):
- `GET /api/bookings` - All bookings
- `PATCH /api/bookings/:id` - Update booking status (approve/deny)
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/blocked-dates` - All blocked dates
- `POST /api/blocked-dates` - Create blocked date range
- `DELETE /api/blocked-dates/:id` - Remove blocked date

## Booking Status Flow

```
pending → approved (email sent to guest)
       → denied (email sent to guest)
```

Only `approved` bookings block calendar dates.
