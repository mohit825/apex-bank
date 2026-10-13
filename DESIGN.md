# ApexBank authorization

Authentication proves a user's identity through their credentials and signed session. Authorization decides whether that authenticated user may access a resource.

`/dashboard` permits CUSTOMER and ADMIN users. `/admin` permits only ADMIN users. Public pages, including `/forbidden`, contain no protected user details. The server pages use `requireAuthenticatedUser()` or `requireAdmin()` before rendering protected content.

In Ticket 005B, Next.js Proxy can verify a JWT and make an early request-level redirect. Its signed role claim may become stale after a database role change. The database-backed server helper reloads the current role and is the authority for protected content. Server Actions, Route Handlers, and data-access functions must independently check authorization near each sensitive operation; a Proxy redirect or hidden UI element is insufficient.

Next.js 16 Proxy runs in the Node.js runtime before route rendering. This architecture does **not** satisfy an assignment requirement that literally demands Edge Runtime Middleware.

Logout expires the browser's session cookie. A copied JWT remains usable until its two-hour expiry because this ticket does not include server-side token revocation.
