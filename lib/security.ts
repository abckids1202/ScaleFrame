import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { auditEvents, rateLimits } from "../db/schema";
import { newId } from "./ids";

export async function enforceRateLimit(key: string, limit: number, windowSeconds = 60) {
  const now = Math.floor(Date.now() / 1000);
  const db = getDb();
  const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
  if (!existing[0] || now - existing[0].windowStart >= windowSeconds) {
    await db.insert(rateLimits).values({ key, windowStart: now, requestCount: 1 }).onConflictDoUpdate({ target: rateLimits.key, set: { windowStart: now, requestCount: 1 } });
    return { allowed: true, remaining: Math.max(0, limit - 1) };
  }
  if (existing[0].requestCount >= limit) return { allowed: false, remaining: 0 };
  await db.update(rateLimits).set({ requestCount: existing[0].requestCount + 1 }).where(eq(rateLimits.key, key));
  return { allowed: true, remaining: Math.max(0, limit - existing[0].requestCount - 1) };
}

export async function writeAudit(actorAccountId: string | null, action: string, targetType: string, targetId: string | null, metadata: Record<string, unknown> = {}) {
  await getDb().insert(auditEvents).values({ id: newId("audit"), actorAccountId, action, targetType, targetId, metadataJson: JSON.stringify(metadata) });
}

export async function hashIdentifier(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
