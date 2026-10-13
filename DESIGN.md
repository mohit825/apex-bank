# ApexBank authorization

Authentication proves a user's identity through their credentials and signed session. Authorization decides whether that authenticated user may access a resource.

`/dashboard` permits CUSTOMER and ADMIN users. `/admin` permits only ADMIN users. Public pages, including `/forbidden`, contain no protected user details. The server pages use `requireAuthenticatedUser()` or `requireAdmin()` before rendering protected content.

In Ticket 005B, Next.js Proxy can verify a JWT and make an early request-level redirect. Its signed role claim may become stale after a database role change. The database-backed server helper reloads the current role and is the authority for protected content. Server Actions, Route Handlers, and data-access functions must independently check authorization near each sensitive operation; a Proxy redirect or hidden UI element is insufficient.

Next.js 16 Proxy runs in the Node.js runtime before route rendering. This architecture does **not** satisfy an assignment requirement that literally demands Edge Runtime Middleware.

Logout expires the browser's session cookie. A copied JWT remains usable until its two-hour expiry because this ticket does not include server-side token revocation.

## Dashboard streaming

The dashboard page calls `requireAuthenticatedUser()` before rendering protected content. It passes that database-verified user's ID to three async Server Components. Each component invokes one server-only Drizzle query, and those queries still filter accounts and holdings by owner; transactions join through accounts and filter their owner. The page does not accept a user ID from a URL or form. No private database result is placed in a public cache or fetched in a browser Client Component.

The account, transaction, investment, and market sections are siblings under separate Suspense boundaries. Each async component suspends while its own data is pending, so React can send its section skeleton and stream the finished section independently. The earlier parent `Promise.all()` withheld the whole dashboard until every financial query resolved. A route-level `loading.tsx` would cover the whole page while it loads; these component-level fallbacks match the sections and allow the authenticated header and ready sections to appear sooner. All four sections remain Server Components, with no new client boundary or client-side fetching.

The market service reads `MARKET_FEED_MODE` on the server and returns clearly labeled fictional values. Its response wait uses an `AbortController` with a 2.5-second budget; timeout aborts the pending timer rather than leaving a 5-second task running. The market component handles the expected upstream-failure and timeout errors with generic unavailable UI. It rethrows unexpected errors. Since the market boundary and service are separate from the financial queries, a slow or expected failed feed does not hold up or crash the banking sections. To exercise all modes, set `MARKET_FEED_MODE` to `success`, `slow`, `error`, or `timeout` in `.env.local`, restart the development server, and reload `/dashboard` while signed in. This simulation does not provide live market data or a production-grade external-provider integration.
