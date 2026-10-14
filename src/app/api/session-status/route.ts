import { getAuthenticatedUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();

  return Response.json(
    { authenticated: Boolean(user) },
    {
      status: user ? 200 : 401,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
