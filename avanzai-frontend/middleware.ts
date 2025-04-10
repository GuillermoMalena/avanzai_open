import NextAuth from 'next-auth';
import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - favicon.ico (static file)
     * - _next (Next.js internals)
     * - public (static files)
     * - login and register (auth pages)
     */
    '/((?!favicon.ico|_next|public|login|register).*)',
  ],
};
