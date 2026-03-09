// app/api/auth/login/route.js
// API route pour gérer la connexion (POST /api/auth/login)

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  // 1. Vérification des identifiants (test@test.com / 1234)
  const isValidUser = (email === "test@test.com" && password === "1234");
  
  if (!isValidUser) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  // Token simulé (plus tard, ce sera le vrai JWT venant du backend)
  const tokenDuBackend = "ton_token_jwt_super_securise"; 
  const cookieStore = await cookies();

  cookieStore.set({
    name: 'auth_token',
    value: tokenDuBackend,
    httpOnly: true, 
    path: '/', 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true });
}