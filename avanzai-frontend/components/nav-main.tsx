"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import useSWR from 'swr'
import type { Chat } from '@/lib/db/schema'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { fetcher } from "@/lib/utils"
import type { NavItem } from "@/config/navigation"

interface NavMainProps {
  items: readonly NavItem[]
  user: any
}

export function NavMain({ items, user }: NavMainProps) {
  const pathname = usePathname()
  const { data: chats } = useSWR<Array<Chat>>(
    user ? `/api/history?uid=${user.id}` : null,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const recentChats = chats?.slice(0, 3) || []

  return (
    <>
      <SidebarGroup className="pt-6">
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {user && recentChats.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarMenu>
            {recentChats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/chat/${chat.id}`}
                  tooltip={chat.title}
                >
                  <a href={`/chat/${chat.id}`}>
                    <span>{chat.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}
