import { getDb } from "../db";
import { accounts, profiles } from "../db/schema";

export async function syncAccount(user: { id: string; email?: string | null; email_confirmed_at?: string | null }) {
  const db = getDb();
  await db.insert(accounts).values({ id: user.id, authSubject: user.id, email: user.email ?? "", emailVerifiedAt: user.email_confirmed_at ?? null }).onConflictDoUpdate({ target: accounts.id, set: { email: user.email ?? "", emailVerifiedAt: user.email_confirmed_at ?? null, updatedAt: new Date().toISOString() } });
  await db.insert(profiles).values({ id: `profile_${user.id}`, accountId: user.id, handle: `reader-${user.id.slice(0, 8)}`, displayName: user.email?.split("@")[0] || "Reader" }).onConflictDoNothing();
}
