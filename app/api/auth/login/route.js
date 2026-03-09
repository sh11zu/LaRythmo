// app/api/auth/login/route.js
// API route pour gérer la connexion (POST /api/auth/login)

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  // 1. Chercher l'utilisateur en BDD par email
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
    [email]
  );

  const user = rows[0];

  if (!user) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  // 2. Vérifier le mot de passe avec bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  // 3. Créer le token de session (simple JSON encodé en base64 — à remplacer par un vrai JWT plus tard)
  const sessionPayload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
  });
  const token = Buffer.from(sessionPayload).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true, role: user.role });
}