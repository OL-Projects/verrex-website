// Debug endpoint — tests auth flow (remove after debugging)
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Can we import the auth module?
    const authModule = await import('@/lib/auth');
    
    // Test 2: Can we call isEmailTaken?
    const adminExists = authModule.isEmailTaken('admin@verrex.com');
    const randomExists = authModule.isEmailTaken('random@test.com');

    // Test 3: Check env vars
    const hasAuthSecret = !!process.env.AUTH_SECRET;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    
    // Test 4: Check NextAuth config
    const authConfig = typeof authModule.auth === 'function';
    const handlersExist = typeof authModule.handlers === 'object';

    return NextResponse.json({
      status: 'ok',
      tests: {
        authModuleLoaded: true,
        adminEmailExists: adminExists,
        randomEmailExists: randomExists,
        hasAuthSecret,
        hasNextAuthSecret,
        authFunctionExists: authConfig,
        handlersExist,
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
        authUrl: process.env.AUTH_URL || 'not set',
        vercelUrl: process.env.VERCEL_URL || 'not set',
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
