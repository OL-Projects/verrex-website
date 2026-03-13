import { createClient } from "@supabase/supabase-js"

// ─── Server-side Supabase client (service role — full access) ───
// Use this in API routes for storage uploads, admin operations
let _serverClient: ReturnType<typeof createClient> | null = null

export function getSupabaseServer() {
  if (_serverClient) return _serverClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  _serverClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _serverClient
}

// ─── Browser-side Supabase client (anon key — limited access) ───
// Use this in client components for realtime subscriptions
let _browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowser() {
  if (_browserClient) return _browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  _browserClient = createClient(url, key, {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  })
  return _browserClient
}

// ─── Storage helpers ───
export const STORAGE_BUCKET = "project-files"

export function getPublicUrl(filePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  return `${url}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`
}
