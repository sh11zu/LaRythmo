// app/api/auth/logout/route.js
// API route pour gérer la déconnexion (POST /api/auth/logout)

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return NextResponse.json({ success: true });
}