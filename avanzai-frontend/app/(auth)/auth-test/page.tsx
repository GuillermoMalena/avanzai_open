'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthTest() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [log, setLog] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [fetchAvailable, setFetchAvailable] = useState<boolean>(false);
  const [windowAvailable, setWindowAvailable] = useState<boolean>(false);

  // Log helper
  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  // Check environment capabilities
  useEffect(() => {
    addLog('Testing environment capabilities...');
    
    // Check if window is available
    if (typeof window !== 'undefined') {
      setWindowAvailable(true);
      addLog('✅ Window is available');
    } else {
      addLog('❌ Window is not available');
    }
    
    // Check if fetch is available
    if (typeof fetch !== 'undefined') {
      setFetchAvailable(true);
      addLog('✅ Fetch is available globally');
    } else {
      addLog('❌ Fetch is not available globally');
    }
    
    // Check if window.fetch is available
    if (typeof window !== 'undefined' && typeof window.fetch !== 'undefined') {
      addLog('✅ Window.fetch is available');
    } else if (typeof window !== 'undefined') {
      addLog('❌ Window.fetch is not available');
    }
    
    // Initialize Supabase client
    try {
      // Get credentials from meta tags
      const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
      const supabaseKey = document.querySelector('meta[name="supabase-anon-key"]')?.getAttribute('content');
      
      if (!supabaseUrl || !supabaseKey) {
        addLog('❌ Supabase credentials not found in meta tags');
        setStatus('Failed to get Supabase credentials');
        return;
      }
      
      addLog(`Found Supabase URL: ${supabaseUrl.substring(0, 10)}...`);
      
      // Create custom fetch function
      const customFetch = (...args: Parameters<typeof fetch>) => {
        addLog(`🔄 Fetch called with: ${typeof args[0] === 'string' ? args[0] : 'Request object'}`);
        return window.fetch.apply(window, args).then(response => {
          addLog(`✅ Fetch responded for: ${typeof args[0] === 'string' ? args[0] : 'Request object'}`);
          return response;
        }).catch(error => {
          addLog(`❌ Fetch error for ${typeof args[0] === 'string' ? args[0] : 'Request object'}: ${error.message}`);
          throw error;
        });
      };
      
      // Create Supabase client with custom fetch
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          fetch: customFetch
        }
      });
      
      setSupabaseClient(client);
      addLog('✅ Supabase client initialized');
      setStatus('Ready to test');
      
      // Make Supabase globally available
      (window as any).testSupabase = client;
      addLog('✅ Supabase client added to window.testSupabase');
      
    } catch (error: any) {
      addLog(`❌ Error initializing Supabase: ${error.message}`);
      setStatus(`Failed: ${error.message}`);
    }
  }, []);

  // Test sign-in
  const testSignIn = async () => {
    if (!supabaseClient) {
      addLog('❌ Supabase client not initialized');
      return;
    }
    
    if (!email || !password) {
      addLog('❌ Email and password required');
      return;
    }
    
    addLog(`🔄 Testing sign in with email: ${email}`);
    setStatus('Signing in...');
    
    try {
      // Explicitly wrap in try/catch to diagnose fetch errors
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          addLog(`❌ Sign in error: ${error.message}`);
          setStatus(`Failed: ${error.message}`);
          return;
        }
        
        if (!data?.user) {
          addLog('❌ No user returned after sign in');
          setStatus('Failed: No user returned');
          return;
        }
        
        addLog(`✅ Signed in successfully as: ${data.user.email}`);
        addLog(`✅ User ID: ${data.user.id}`);
        setStatus('Signed in');
        
      } catch (fetchError: any) {
        addLog(`❌ Fetch error during sign in: ${fetchError.message}`);
        if (fetchError.message?.includes('fetch')) {
          addLog('⚠️ This appears to be a fetch-related error');
        }
        setStatus(`Fetch Error: ${fetchError.message}`);
      }
    } catch (outerError: any) {
      addLog(`❌ Outer error layer: ${outerError.message}`);
      setStatus(`Error: ${outerError.message}`);
    }
  };

  // Test current session
  const checkSession = async () => {
    if (!supabaseClient) {
      addLog('❌ Supabase client not initialized');
      return;
    }
    
    addLog('🔄 Checking current session');
    
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        addLog(`❌ Session check error: ${error.message}`);
        return;
      }
      
      if (!data?.session) {
        addLog('❌ No active session found');
        return;
      }
      
      addLog(`✅ Active session found for: ${data.session.user.email}`);
      addLog(`✅ User ID: ${data.session.user.id}`);
      
    } catch (error: any) {
      addLog(`❌ Error checking session: ${error.message}`);
    }
  };
  
  // Test sign out
  const testSignOut = async () => {
    if (!supabaseClient) {
      addLog('❌ Supabase client not initialized');
      return;
    }
    
    addLog('🔄 Testing sign out');
    
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        addLog(`❌ Sign out error: ${error.message}`);
        return;
      }
      
      addLog('✅ Signed out successfully');
      setStatus('Signed out');
      
    } catch (error: any) {
      addLog(`❌ Error signing out: ${error.message}`);
    }
  };

  return (
    <div className="container my-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Supabase Auth Test</h1>
      <div className="p-4 mb-4 bg-amber-100 text-amber-800 rounded-md">
        <p className="font-semibold">Status: {status}</p>
        <p>Window Available: {windowAvailable ? '✅' : '❌'}</p>
        <p>Fetch Available: {fetchAvailable ? '✅' : '❌'}</p>
      </div>
      
      <div className="grid gap-4 mb-6">
        <div className="flex gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button onClick={testSignIn} variant="default">
            Test Sign In
          </Button>
          <Button onClick={checkSession} variant="outline">
            Check Session
          </Button>
          <Button onClick={testSignOut} variant="outline">
            Test Sign Out
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-slate-50">
        <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
        <pre className="bg-black text-green-400 p-4 rounded-md h-80 overflow-auto whitespace-pre-wrap text-xs">
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </pre>
      </div>
    </div>
  );
} 