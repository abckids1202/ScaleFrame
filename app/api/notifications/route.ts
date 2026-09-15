import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { notifications } from "../../../db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { errorResponse, jsonResponse } from "../../../lib/http";

export async function GET(request: Request) {
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to view notifications.", 401, "authentication_required");
  try { return jsonResponse({ notifications: await getDb().select().from(notifications).where(eq(notifications.accountId, user.subject)).orderBy(desc(notifications.createdAt)).limit(50) }); }
  catch { return errorResponse("Notifications are temporarily unavailable.", 503, "storage_unavailable"); }
}
