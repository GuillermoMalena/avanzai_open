'use client';
import { ChevronUp } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserNav({ user }: { user: User }) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      console.log('Sidebar: Starting sign out process');
      
      // Use the enhanced signOut from AuthProvider
      await signOut();
      
      // The signOut function will handle redirection and state cleaning
      // No need for additional navigation here
    } catch (error) {
      console.error('Sidebar: Error during sign out:', error);
      toast.error('Failed to sign out. Please try again.');
      
      // Force navigation even on error
      window.location.href = '/login';
    }
  };

  return (
    <SidebarMenu className="pt-8">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
