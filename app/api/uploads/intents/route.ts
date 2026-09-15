import { getCurrentUser } from "../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../../lib/http";
import { newId } from "../../../../lib/ids";

const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin write rejected.", 403, "origin_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in before uploading media.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { fileName?: unknown; contentType?: unknown; byteSize?: unknown; provenance?: unknown } | null;
  const fileName = safeText(payload?.fileName, 160); const contentType = safeText(payload?.contentType, 80); const byteSize = Number(payload?.byteSize);
  if (!fileName || !allowed.has(contentType) || !Number.isSafeInteger(byteSize) || byteSize <= 0 || byteSize > 15_000_000) return errorResponse("Upload type, provenance, or size is invalid.", 400, "invalid_upload");
  return jsonResponse({ intentId: newId("upload"), objectKey: `accounts/${user.subject}/${crypto.randomUUID()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`, contentType, byteSize, status: "awaiting_signed_upload", provenanceRequired: true, signedUrl: null, message: "R2 signing is enabled when the BUCKET binding and upload scanner are configured." }, { status: 202 });
}
