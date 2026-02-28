# Jerur — Church Management Platform

Jerur is a full-stack SaaS platform built with **Next.js 15** that helps churches connect members, manage operations, and grow their community — online and in person, on any device.

---

## What It Does

### Member Management
- Add, edit, and remove church members
- Track member roles, statuses, and profiles
- View recent members and member count trends on the dashboard

### Attendance Tracking
- Record service and event attendance
- Analyse attendance trends over time with charts and peak attendance stats

### Event Management
- Create, promote, and manage church events
- Register attendees and track participation

### Fellowship Groups
- Organise and manage small groups / fellowship meetings
- Track group membership and activity

### Service Times
- Display and update regular worship schedules
- Manage service agendas (speakers, order of service, etc.)

### Fundraising & Giving
- Launch and manage fundraising campaigns with target amounts and progress tracking
- Accept online donations and bank transfers
- Configure giving URLs and in-app giving per church

### Push Notifications
- Send targeted push notifications to individual members or the entire congregation
- Manage notification templates and history

### Church Dashboard
- Aggregate stats: total members, events, fellowships, peak attendance
- Attendance trend charts and recent member activity feed

### Church Settings
- Update church profile, address, logo, and contact details
- Configure pastor section, prophetic focus, and social media links
- Enable/disable platform features per church
- Manage image sliders for the church's public-facing site

### Admin Panel
- Super-admin dashboard to view and manage all registered churches
- Monitor subscription statuses (active, trial, past due, cancelled)
- Weekly church sign-on data and aggregate statistics

### Authentication & Security
- Email/password login with NextAuth.js
- Email verification, forgot password, and reset password flows
- Role-based route protection (church admin vs platform admin)
- JWT-based session management

### Subscriptions & Billing
- Stripe-powered subscription management
- Three plans: **Basic** (monthly), **Premium** (every 6 months), **Premium Plus** (yearly)
- Automated welcome, renewal, trial-ending, and cancellation emails via MJML templates
- Customer portal for self-service plan changes

### Task & Document Management
- Project and task tracking for church teams
- Document uploads and team task assignments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript + JavaScript |
| Database | MongoDB via Mongoose |
| Auth | NextAuth.js |
| Payments | Stripe |
| Push Notifications | Firebase Cloud Messaging |
| Email | Nodemailer + MJML |
| Error Tracking | Sentry |
| UI | React Bootstrap + Material UI |
| Deployment | Node.js custom server |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Yarn
- MongoDB instance
- Stripe account
- Firebase project

### Install dependencies

```bash
yarn install
```

### Configure environment

Copy `.env.local` and fill in the required values:

```bash
cp _.env.local_ .env.local
```

Key variables include `MONGODB_URI`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, Firebase credentials, and Sentry DSN.

### Run in development

```bash
yarn dev
```

### Build for production

```bash
yarn build
yarn start
```

---

## Project Structure

```
app/          # Next.js App Router pages and API routes
src/          # UI components, icons, theme, and data
hooks/        # React custom hooks
utils/        # Shared helpers, logger, DB connection
lib/          # Auth and email services
config/       # Pricing and app config
emails/       # Email template helpers
firebase/     # Firebase initialisation
validator/    # Request validators
```

---

## CI

A GitHub Actions workflow runs on every push and pull request to `dev`. It installs dependencies with `yarn install --frozen-lockfile` and runs `yarn build` to validate the production build.
 
