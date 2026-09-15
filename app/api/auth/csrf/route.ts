import { csrfCookie, jsonResponse } from "../../../../lib/http";

export async function GET() {
  const token = crypto.randomUUID().replaceAll("-", "");
  const response = jsonResponse({ csrfToken: token });
  response.headers.append("set-cookie", csrfCookie(token));
  return response;
}
