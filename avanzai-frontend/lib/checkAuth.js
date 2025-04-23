/**
 * Debug utility to check authentication state
 * Call this from browser console when troubleshooting auth issues
 */
export function checkAuthState() {
  console.log("=== AUTH STATE DEBUG ===");
  
  // Check environment
  if (typeof window === 'undefined') {
    console.log("Not in browser environment, cannot debug auth state");
    return { error: "Not in browser environment" };
  }
  
  try {
    // Check localStorage
    console.log("LocalStorage keys:", Object.keys(localStorage));
    
    // Look for Supabase tokens in localStorage
    const supabaseTokens = Object.keys(localStorage)
      .filter(key => key.includes('supabase') || key.includes('sb-'))
      .reduce((obj, key) => {
        obj[key] = localStorage.getItem(key);
        return obj;
      }, {});
    
    console.log("Supabase tokens in localStorage:", supabaseTokens);
    
    // Check cookies
    console.log("Cookies:", document.cookie);
    
    // Look for auth cookies
    const authCookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && (name.includes('supabase') || name.includes('sb-'))) {
        authCookies[name] = value;
      }
    });
    
    console.log("Auth cookies:", authCookies);
    
    // Check for fetch availability
    console.log("Fetch available:", typeof fetch !== 'undefined');
    
    // Summary
    const summary = {
      hasLocalStorage: typeof localStorage !== 'undefined',
      hasLocalStorageTokens: Object.keys(supabaseTokens).length > 0,
      hasCookies: document.cookie.length > 0,
      hasAuthCookies: Object.keys(authCookies).length > 0,
      hasFetch: typeof fetch !== 'undefined',
      supabaseTokens,
      authCookies
    };
    
    console.log("Summary:", summary);
    console.log("========================");
    
    return summary;
  } catch (error) {
    console.error("Error checking auth state:", error);
    return { error: error.message };
  }
}

/**
 * Helper function to test sign-in directly from browser console
 * @param {string} email - User email
 * @param {string} password - User password
 */
export async function debugSignIn(email, password) {
  console.log("=== DEBUG SIGN IN ===");
  
  // Check environment
  if (typeof window === 'undefined') {
    console.log("Not in browser environment, cannot debug sign in");
    return { error: "Not in browser environment" };
  }
  
  if (!email || !password) {
    console.error("Email and password required");
    return { error: "Email and password required" };
  }
  
  try {
    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
      console.error("Supabase client not found in window object");
      
      // Try to load from modules 
      console.log("Attempting to load from @supabase/supabase-js");
      const { createClient } = await import('@supabase/supabase-js');
      
      // Get environment variables from meta tags
      const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content;
      const supabaseKey = document.querySelector('meta[name="supabase-anon-key"]')?.content;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error("Could not find Supabase credentials");
        return { error: "Supabase credentials not available" };
      }
      
      // Create temporary client
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log("Created temporary Supabase client");
      console.log("Attempting sign in...");
      
      // Attempt sign in
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", result);
      
      return result;
    } else {
      // Use global supabase instance
      console.log("Using window.supabase client");
      console.log("Attempting sign in...");
      
      const result = await window.supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", result);
      
      return result;
    }
  } catch (error) {
    console.error("Error during debug sign in:", error);
    return { error: error.message };
  }
} 