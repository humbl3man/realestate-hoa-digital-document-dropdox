# Deployment Guide

This document outlines the steps required to deploy the application to production and manage database migrations.

## 1. Environment Variables

Ensure the following environment variables are set in your production environment

### Core

- `NODE_ENV="production"`
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://your-domain.com`)

### Turso Database

- `DATABASE_URL` - The production database URL (e.g., `libsql://your-db-name.turso.io`)
- `DATABASE_AUTH_TOKEN` - The authentication token for the Turso production database.

### Auth (Better Auth)

- `BETTER_AUTH_SECRET` - A strong, random string for signing tokens.
- `BETTER_AUTH_URL` - Should match your production domain.
- OAuth provider credentials (e.g., Google, GitHub) if configured.

### Stripe

- `STRIPE_SECRET_KEY` - Your live Stripe secret key (starts with `sk_live_...`).
- `STRIPE_WEBHOOK_SECRET` - Your live Stripe webhook secret for the production endpoint.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your live Stripe publishable key (starts with `pk_live_...`).

## 2. Database Migrations (Turso)

When you make schema changes to `src/db/schema.ts`, you must run migrations to keep the production database in sync.

### Step A: Generate the migration locally

Run this locally to generate a new `.sql` file in the `drizzle/` directory:

```powershell
npm run db:generate
```

_Commit this new `.sql` file to your git repository._

### Step B: Apply the migration to production

You can apply migrations from your local machine to the production Turso database using Drizzle Kit.

In your terminal, temporarily set your production database credentials and run the migration command:

**For macOS/Linux (Bash/Zsh):**

```bash
export DATABASE_URL="libsql://your-database-url.turso.io"
export DATABASE_AUTH_TOKEN="your-production-auth-token-here"

npx drizzle-kit migrate
```

**For Windows (PowerShell):**

```powershell
$env:DATABASE_URL="libsql://your-database-url.turso.io"
$env:DATABASE_AUTH_TOKEN="your-production-auth-token-here"

npx drizzle-kit migrate
```

_Note: Make sure to wrap the URL and token in quotes._

## 3. Deploying the Application

### Deploying to Vercel (Recommended)

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add all the required Environment Variables in the Vercel dashboard.
4. Click Deploy. Vercel automatically runs `npm run build` and starts the application.

### Manual / VPS Deployment

If you are deploying manually or via a Docker container on a VPS:

1. Install dependencies: `npm install`
2. Build the application: `npm run build`
3. Start the application: `npm start`

## 4. Post-Deployment Checks

- **Webhooks**: Ensure your Stripe Webhook is pointing to your production URL (`https://your-domain.com/api/webhooks/stripe`) and that the secret is updated in your environment variables.
- **Auth Redirects**: Ensure any OAuth providers (Google, GitHub, etc.) have your new production URL added to their allowed redirect URIs.
