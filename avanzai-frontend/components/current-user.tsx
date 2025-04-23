'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AppSidebar } from '@/components/app-sidebar';

// This component ensures we always show the current user
export function CurrentUser({ 
  serverUser 
}: { 
  serverUser?: User | null 
}) {
  const [user, setUser] = useState<User | null>(serverUser || null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    console.log('CurrentUser: Initial serverUser:', serverUser?.id || 'none');
    
    // Check for current session
    setLoading(true);
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('Error getting user:', error);
        return;
      }
      
      if (data?.user) {
        console.log('CurrentUser: getUser returned user:', data.user.id);
        setUser(data.user);
      } else {
        console.log('CurrentUser: No user from getUser()');
      }
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'no user');
        setUser(session?.user || null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [serverUser]);
  
  // Show loading indicator or user
  return <AppSidebar user={user} />;
} 