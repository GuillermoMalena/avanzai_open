'use client';

import { AuthProvider } from '@/components/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 