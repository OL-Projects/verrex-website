// ============================================================
// POST /api/portal/register — Phase 1 Registration
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { isEmailTaken, registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // ── Validation ─────────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // ── Check uniqueness ───────────────────────────────────
    if (isEmailTaken(email)) {
      return NextResponse.json(
        { error: 'This email is already registered. Try logging in instead.' },
        { status: 409 }
      );
    }

    // ── Register ───────────────────────────────────────────
    const user = registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone?.trim() || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        email: user.email,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
