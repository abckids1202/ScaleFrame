import { env } from "cloudflare:workers";
import { jsonResponse } from "../../../lib/http";

export async function GET() {
  return jsonResponse({ ok: true, service: "scaleframe", version: "2.0.0-foundation", capabilities: { database: Boolean(env.DB), storage: Boolean(env.BUCKET), auth: Boolean(env.SUPABASE_URL) } });
}
