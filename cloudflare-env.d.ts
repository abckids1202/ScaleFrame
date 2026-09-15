declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    SUPABASE_JWKS_URL?: string;
    SUPABASE_JWT_ISSUER?: string;
  }
}
