'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User, AuthResponse } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { mutate } from 'swr';

// Get the Supabase client once for all components
const supabase = createClientSupabaseClient();

// Create context for auth state
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: typeof supabase.auth.signInWithPassword;
  signUp: typeof supabase.auth.signUp;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe fetch function that works in both browser and server
const safeFetch = async (url: string, options: RequestInit): Promise<Response | null> => {
  // Only attempt fetch in browser environment
  if (typeof window !== 'undefined') {
    try {
      // Use the most reliable fetch available
      const fetchFunction = window.fetch || fetch || globalThis.fetch;
      
      if (typeof fetchFunction === 'function') {
        return await fetchFunction(url, options);
      } else {
        console.error('No fetch function available in browser');
        return null;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }
  
  // For server environment, log and return null
  console.log('Fetch not available in this environment, skipping request to', url);
  return null;
};

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to sync user data with custom database
async function syncUserWithDatabase(user: User | null) {
  // Skip completely if we're not in a browser environment
  if (typeof window === 'undefined') {
    console.log('Skipping user sync - server environment');
    return;
  }

  if (!user) {
    console.log('No user provided for database sync');
    return;
  }
  
  if (!user.id) {
    console.error('Cannot sync user with null UUID');
    toast.error('Authentication error: Invalid user ID');
    return;
  }
  
  if (!user.email) {
    console.error('Cannot sync user with null email');
    toast.error('Authentication error: Missing email');
    return;
  }
  
  console.log('Syncing user with database:', { id: user.id, email: user.email });
  
  try {
    // Use our safe fetch utility
    const response = await safeFetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
      }),
    });

    // Only process response if we got one (might be null on server)
    if (response) {
      let responseText;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Error reading response:', textError);
        responseText = 'Failed to read response';
      }
      
      if (!response.ok) {
        console.error('Failed to sync user with database:', { 
          status: response.status, 
          statusText: response.statusText,
          responseText 
        });
        toast.error('Failed to sync user data');
      } else {
        console.log('User sync successful:', responseText);
      }
    }
  } catch (error) {
    console.error('Error syncing user with database:', error);
    toast.error('Failed to sync user data');
  }
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Track sync attempts to avoid duplicate syncs
  const syncAttempted = useRef(false);

  useEffect(() => {
    // Get initial session
    async function getInitialSession() {
      setLoading(true);
      
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      
      setLoading(false);
    }

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        // Force a router refresh to update server components with new session
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          router.refresh();
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Enhanced sign out with proper cleanup
  const enhancedSignOut = async (): Promise<void> => {
    try {
      console.log('Starting enhanced sign out process');
      
      // Clear all SWR caches by clearing specific keys we know about
      await mutate('/api/history', null, false); // Don't revalidate
      await mutate((key) => typeof key === 'string' && key.startsWith('/api/'), null, false);
      
      // Sign out with the Supabase client
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Clear browser storage
      if (typeof window !== 'undefined') {
        console.log('Clearing local storage and cookies');
        
        // Clear all Supabase-related items from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear all cookies
        document.cookie.split(';').forEach(c => {
          const key = c.split('=')[0].trim();
          document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${window.location.hostname}`;
          document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`; // Also try without domain
        });
      }
      
      // Force page reload to clear any remaining state
      console.log('Redirecting to login page');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Error during sign out, forcing navigation');
      // Force navigation even on error
      window.location.href = '/login';
    }
  };

  // Separate effect for user synchronization 
  // This will only run client-side after hydration
  useEffect(() => {
    // Only sync if we have a user and haven't tried yet
    if (user && !syncAttempted.current && typeof window !== 'undefined') {
      syncUserWithDatabase(user);
      syncAttempted.current = true;
    }
  }, [user]);

  // Google OAuth sign in
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn: supabase.auth.signInWithPassword,
    signUp: supabase.auth.signUp,
    signOut: enhancedSignOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 