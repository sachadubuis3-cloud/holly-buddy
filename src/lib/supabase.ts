import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (typeof window !== 'undefined' && supabaseUrl) {
  const originalFetch = window.fetch.bind(window);
  const legacyOrganizationEndpoint = `${supabaseUrl}/functions/v1/create-organization`;
  const safeOrganizationEndpoint = `${supabaseUrl}/functions/v1/create-organization-v2`;

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input === legacyOrganizationEndpoint) {
      return originalFetch(safeOrganizationEndpoint, init);
    }
    if (input instanceof URL && input.toString() === legacyOrganizationEndpoint) {
      return originalFetch(safeOrganizationEndpoint, init);
    }
    if (input instanceof Request && input.url === legacyOrganizationEndpoint) {
      return originalFetch(new Request(safeOrganizationEndpoint, input), init);
    }
    return originalFetch(input, init);
  };
}

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
