# ApexBank

A Next.js App Router project using PostgreSQL on Neon with Drizzle ORM and `pg`.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database setup

1. Create a Neon project and choose a branch for local development.
2. Copy Neon's **pooled** connection string to `DATABASE_URL`. Its hostname contains `-pooler`. Copy the **direct** connection string for the same branch and database to `DATABASE_MIGRATION_URL`.
3. Create a local environment file and replace the placeholders:

   ```bash
   cp .env.example .env.local
   ```

4. Apply the checked-in migration, then seed the two rate plans:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

`src/db/client.ts` uses the pooled URL for application queries. Migration and seed commands use the direct URL and run only when invoked manually. `npm run db:generate` creates a new migration after a schema change; the first migration is already checked in. The seed script can be rerun safely: it updates the two plans by their unique names.

Keep `.env.local` out of Git. The database client is for Node.js server code only; any future route that imports it must use the Node.js runtime, not the Edge runtime.

## Authentication setup

Apply the checked-in users migration to your Neon development branch with `npm run db:migrate`. This does not run automatically during a build, and the existing rate plans are preserved. Apply the same migration separately to the production branch before using registration there.

Generate a distinct random signing secret for each environment:

```bash
openssl rand -base64 32
```

Set the output as `JWT_SECRET` in your ignored `.env.local` and in Vercel's Production environment variables. Keep it private and use a separate value for Preview deployments. Changing it invalidates existing JWT sessions. The application requires at least 32 bytes and signs sessions for two hours.

`/register` validates and hashes passwords on the server, then creates a CUSTOMER. `/login` verifies credentials and creates a session. The session helpers in `src/lib/session.ts` are for use only after credentials have been verified. `/dashboard` verifies the cookie and reloads the current user from the database. Every future Server Action must validate its input and check authentication and authorization as appropriate.

To create the first administrator manually, set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in your ignored `.env.local`. Use a new email, a unique password of at least 12 characters and at most 72 UTF-8 bytes, and confirm `DATABASE_MIGRATION_URL` points to the intended Neon branch. Then run:

```bash
npm run db:seed:admin
```

The command uses the direct migration URL and does not run during builds or migrations. Re-running it leaves an existing ADMIN's password unchanged. If the email belongs to a CUSTOMER, it fails without changing that user. Keep administrator credentials out of Git and use a separate admin identity for each environment.

Deleting the session cookie during logout removes it from that browser, but it cannot revoke a JWT that was already copied. Server-side token revocation is outside this ticket.

## Customer dashboard data foundation

The dashboard tables are `accounts`, `account_transactions`, and `investment_holdings`. Apply their checked-in migration manually to the intended Neon branch before using the new queries or seed script:

```bash
npm run db:migrate
```

This uses `DATABASE_MIGRATION_URL` from `.env.local`; verify that it points to the intended development branch first. The migration does not run during builds or deployments.

To add fictional data, first register a test CUSTOMER in that development branch. In your ignored `.env.local`, set `DASHBOARD_SEED_CUSTOMER_EMAIL` to that customer's email, `DASHBOARD_SEED_DATABASE_URL` to the **direct connection string for that same development branch**, and `DASHBOARD_SEED_CONFIRM=development`. Then run:

```bash
npm run db:seed:dashboard
```

The script refuses a missing user, an ADMIN, or `NODE_ENV=production`. It creates one sample account, three transactions, and two holdings in a database transaction. Stable sample IDs and transaction references make reruns skip existing rows without resetting balances, passwords, or unrelated records. Verify the URL yourself: the script cannot determine whether a Neon URL belongs to a production branch. Never point this fictional seed at production.

`src/lib/dashboard.ts` contains owner-filtered account and transaction reads. In Ticket 006B, pass `user.id` from `requireAuthenticatedUser()` in the dashboard Server Component, implement the holdings query TODO, and render the dashboard UI. Money is stored in paise as PostgreSQL `bigint` and mapped to JavaScript `bigint`; convert deliberately when formatting for display, rather than using floating point arithmetic for balances.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploying on Vercel

Import this repository as a Next.js project. In Project Settings → Environment Variables, set `DATABASE_URL` to the **pooled** connection string for the Production environment. Use a different Neon branch and pooled URL for Preview deployments if you want isolation. Do not prefix database secrets with `NEXT_PUBLIC_`.

Keep `DATABASE_MIGRATION_URL` in the trusted environment where you manually run migrations and seeding. If you run those commands using Vercel environment variables, add the direct URL there for the relevant environment. Neither command is part of the Vercel build. The app uses the same code in local development and production; each environment supplies its own connection strings.

Future database reads can run in standard Next.js Node.js functions without a custom server or Vercel-specific database API. The same environment-variable setup can be used with a Netlify Node.js deployment.
