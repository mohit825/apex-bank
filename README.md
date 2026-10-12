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

`/register` validates and hashes passwords on the server, then creates a CUSTOMER. `/login` is a disabled form scaffold for the login Server Action. The session helpers in `src/lib/session.ts` are for use only after credentials have been verified. `/dashboard` verifies the cookie and reloads the current user from the database. Every future Server Action must validate its input and check authentication and authorization as appropriate.

Deleting the session cookie during logout removes it from that browser, but it cannot revoke a JWT that was already copied. Server-side token revocation is outside this ticket.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploying on Vercel

Import this repository as a Next.js project. In Project Settings → Environment Variables, set `DATABASE_URL` to the **pooled** connection string for the Production environment. Use a different Neon branch and pooled URL for Preview deployments if you want isolation. Do not prefix database secrets with `NEXT_PUBLIC_`.

Keep `DATABASE_MIGRATION_URL` in the trusted environment where you manually run migrations and seeding. If you run those commands using Vercel environment variables, add the direct URL there for the relevant environment. Neither command is part of the Vercel build. The app uses the same code in local development and production; each environment supplies its own connection strings.

Future database reads can run in standard Next.js Node.js functions without a custom server or Vercel-specific database API. The same environment-variable setup can be used with a Netlify Node.js deployment.
