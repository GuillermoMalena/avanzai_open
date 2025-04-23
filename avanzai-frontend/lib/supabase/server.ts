// This file is no longer used. 
// Auth is handled through the middleware and client components only.
// API routes get the user ID from headers or query parameters.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  throw new Error('Server Supabase client is deprecated. Use middleware for auth and the client Supabase client for client components.');
} 