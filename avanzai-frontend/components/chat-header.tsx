'use client';

import { useRouter } from 'next/navigation';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

function PureChatHeader() {
  const router = useRouter();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <div className="flex items-center gap-2">
        <SidebarToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="px-2 h-fit"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader);
