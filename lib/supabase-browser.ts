import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./supabase-config";

export function createSupabaseBrowser() {
  return createBrowserClient(
    supabaseUrl,
    supabasePublishableKey,
  );
}
