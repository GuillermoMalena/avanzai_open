import { createServerComponentClient } from '@/lib/supabase/server-client';

import { CurrentUser } from '@/components/current-user';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default sidebar state - simplify to avoid cookie issues
  const isCollapsed = false;
  
  // Get server-side session for initial render
  let serverUser = null;
  try {
    // Use our helper that handles cookie access properly
    // Since Next.js 15, we need to await the createServerComponentClient function
    const supabase = await createServerComponentClient();
    
    // Get user using the recommended method
    const { data } = await supabase.auth.getUser();
    serverUser = data.user;
  } catch (error) {
    console.error('Error getting user in layout:', error);
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <CurrentUser serverUser={serverUser} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
