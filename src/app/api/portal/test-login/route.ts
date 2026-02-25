// Test login endpoint — bypasses NextAuth to verify credentials work
import { NextRequest, NextResponse } from 'next/server';

const DEMO_USERS = [
  { email: 'admin@verrex.com', password: 'admin123', name: 'Sarah Mitchell', role: 'admin' },
  { email: 'client@demo.com', password: 'client123', name: 'Jean-Pierre Tremblay', role: 'client' },
  { email: 'contractor@demo.com', password: 'contractor123', name: 'Mike Thompson', role: 'contractor' },
  { email: 'supplier@demo.com', password: 'supplier123', name: 'Lisa Chen', role: 'supplier' },
  { email: 'partner@homedepot.com', password: 'partner123', name: 'David Wilson', role: 'partner' },
  { email: 'inspector@demo.com', password: 'inspector123', name: 'Robert Garcia', role: 'inspector' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password
    );

    return NextResponse.json({
      credentialsReceived: { email, passwordLength: password?.length },
      userFound: !!user,
      userName: user?.name || null,
      userRole: user?.role || null,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
