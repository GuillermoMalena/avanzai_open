import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session, User } from "@supabase/supabase-js";

/**
 * Synchronize session state between client localStorage and cookies
 * This helps ensure API routes can access the session via cookies
 */
export async function syncSessionState(): Promise<{user: User | null, session: Session | null, error: Error | null}> {
  // Skip completely if we're not in a browser environment
  if (typeof window === 'undefined') {
    console.log('syncSessionState: Not in browser environment');
    return { user: null, session: null, error: new Error('Not in browser environment') };
  }

  try {
    console.log('Syncing session state between localStorage and cookies');
    
    // Create a client that can access cookies
    const supabase = createClientComponentClient();

    // Use getUser() instead of getSession() for improved security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Also get session for backwards compatibility
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (userError) {
      console.error('Error getting user:', userError.message);
      return { user: null, session: null, error: userError };
    }

    if (sessionError) {
      console.error('Error getting session:', sessionError.message);
      return { user: null, session: null, error: sessionError };
    }

    // If we have a session, ensure it's in both localStorage and cookies
    if (session) {
      const token = session.access_token;
      const refreshToken = session.refresh_token;
      
      // Set cookies manually as fallback - no need to JSON.stringify as cookie values
      try {
        if (token) {
          document.cookie = `sb-access-token=${token};path=/;max-age=${60 * 60};SameSite=Lax`;
        }
        
        if (refreshToken) {
          document.cookie = `sb-refresh-token=${refreshToken};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
        }
        
        // Also sync our custom cookie that middleware checks
        document.cookie = `sb-auth-token=true;path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
        
        console.log('Session synchronized between localStorage and cookies');
      } catch (cookieError) {
        console.error('Error setting cookies during session sync:', cookieError);
      }
    } else {
      // Clear cookies if no session
      try {
        document.cookie = 'sb-access-token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sb-refresh-token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sb-auth-token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        console.log('No session found, cookies cleared');
      } catch (cookieError) {
        console.error('Error clearing cookies during session sync:', cookieError);
      }
    }
    
    return { user, session, error: null };
  } catch (error) {
    console.error('Error synchronizing session:', error);
    return { user: null, session: null, error: error as Error };
  }
} 