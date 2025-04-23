import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for Server Components with proper cookie handling
 * that works with Next.js 15+ async cookies API.
 */
export async function createServerComponentClient() {
  // Since Next.js 15, cookies() returns a Promise that must be awaited
  const cookieStore = await cookies();
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value ?? null;
        },
        set() {
          // Server Components cannot set cookies
        },
        remove() {
          // Server Components cannot set cookies
        },
      },
    }
  );
} 