// ============================================================
// VERREX PORTAL — NextAuth v5 Configuration
// Phase 1: Demo users + in-memory registration
// ============================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole } from '@/types/portal';

// ── Demo users (always available) ──────────────────────────
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

// ── In-memory registered users (Phase 1 — resets on restart) ─
export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

// Module-level store — persists across requests in same server process
export const registeredUsers: Map<string, RegisteredUser> = new Map();

// ── Helper: find user across both stores ───────────────────
function findUser(email: string, password: string) {
  // Check demo users first
  const demo = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (demo) return demo;

  // Check registered users
  const registered = registeredUsers.get(email.toLowerCase());
  if (registered && registered.password === password) {
    return registered;
  }

  return null;
}

// ── Helper: check if email is taken ────────────────────────
export function isEmailTaken(email: string): boolean {
  const lower = email.toLowerCase();
  if (DEMO_USERS.some((u) => u.email.toLowerCase() === lower)) return true;
  if (registeredUsers.has(lower)) return true;
  return false;
}

// ── Helper: register a new user ────────────────────────────
export function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): RegisteredUser {
  const id = `usr_reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const user: RegisteredUser = {
    id,
    email: data.email.toLowerCase(),
    password: data.password,
    name: data.name,
    phone: data.phone,
    role: 'client', // self-signup always = client
    createdAt: new Date().toISOString(),
  };
  registeredUsers.set(user.email, user);
  return user;
}

// ── Helper: get all users (for admin) ──────────────────────
export function getAllUsers() {
  const demoList = DEMO_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    source: 'demo' as const,
    createdAt: '2026-01-01T00:00:00Z',
  }));
  const regList = Array.from(registeredUsers.values()).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    source: 'registered' as const,
    createdAt: u.createdAt,
  }));
  return [...demoList, ...regList];
}

// ── NextAuth configuration ─────────────────────────────────
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'verrex-portal-demo-secret-2026-change-in-production',
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

        const user = findUser(
          credentials.email as string,
          credentials.password as string
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
