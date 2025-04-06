'use client';

import type { User } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import React, { SVGProps } from 'react';

import { navigation } from '@/config/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex items-center justify-center ml-3"
            >
              <Image
                src="/images/avanzai_color_logo.png"
                alt="Avanzai Logo"
                width={100}
                height={48}
                className="ml-1"
              />
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav className="grid items-start gap-2">
          {navigation.main.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpenMobile(false);
                router.push(item.href);
              }}
            >
              <div className="flex items-center gap-2">
                {React.createElement(item.icon as React.ComponentType<SVGProps<SVGSVGElement>>, { 
                  className: "h-4 w-4",
                  "aria-hidden": "true"
                })}
                <span>{item.title}</span>
              </div>
            </Button>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}