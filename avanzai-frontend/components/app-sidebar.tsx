"use client"

import type { User } from "next-auth"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { SidebarUserNav } from "@/components/sidebar-user-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navigation } from "@/config/navigation"

export function AppSidebar({ user }: { user: User | undefined }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <a href="/" className="flex items-center justify-center ml-3">
              <Image
                src="/images/avanzai_color_logo.png"
                alt="Avanzai Logo"
                width={100}
                height={48}
                className="ml-1"
                priority={true}
                unoptimized
              />
            </a>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.platform} user={user} />
      </SidebarContent>
      <SidebarFooter>
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
