// ============================================================
// VERREX PORTAL — NextAuth v5 Configuration
// ============================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole } from '@/types/portal';

// Phase 1: Demo users (replace with database in Phase 2)
const DEMO_USERS = [
  {
    id: 'usr_admin_001',
    email: 'admin@verrex.com',
    password: 'admin123',
    name: 'Sarah Mitchell',
    role: 'admin' as UserRole,
  },
  {
    id: 'usr_client_001',
    email: 'client@demo.com',
    password: 'client123',
    name: 'Jean-Pierre Tremblay',
    role: 'client' as UserRole,
  },
  {
    id: 'usr_contractor_001',
    email: 'contractor@demo.com',
    password: 'contractor123',
    name: 'Mike Thompson',
    role: 'contractor' as UserRole,
  },
  {
    id: 'usr_supplier_001',
    email: 'supplier@demo.com',
    password: 'supplier123',
    name: 'Lisa Chen',
    role: 'supplier' as UserRole,
  },
  {
    id: 'usr_partner_001',
    email: 'partner@homedepot.com',
    password: 'partner123',
    name: 'David Wilson',
    role: 'partner' as UserRole,
  },
  {
    id: 'usr_inspector_001',
    email: 'inspector@demo.com',
    password: 'inspector123',
    name: 'Robert Garcia',
    role: 'inspector' as UserRole,
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = DEMO_USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/portal/login',
    error: '/portal/login',
  },
  trustHost: true,
});
