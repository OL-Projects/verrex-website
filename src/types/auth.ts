// ============================================================
// VEREX PORTAL — Auth Type Extensions
// ============================================================

import type { UserRole } from './portal';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }
}

// JWT type extension — next-auth v5 uses the core module
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
