import { HomeIcon, DatabaseIcon, type LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation = {
  platform: [
    {
      title: 'Assistant',
      url: '/',
      icon: HomeIcon,
    },
    {
      title: 'Data Sources',
      url: '/data-sources',
      icon: DatabaseIcon,
    },
  ],
} as const; 