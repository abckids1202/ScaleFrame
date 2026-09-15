import { getCurrentUser } from "../../../lib/auth";
import { jsonResponse } from "../../../lib/http";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  return jsonResponse({ authenticated: Boolean(user), user: user ? { subject: user.subject, email: user.email, role: user.role } : null });
}
