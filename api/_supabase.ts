import { SupabaseClient } from "@supabase/supabase-js"

export const Supabase = new SupabaseClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_TOKEN as string,
)
