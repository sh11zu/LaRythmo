// app/api/auth/me/route.js
// Retourne les informations complètes de l'utilisateur connecté

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [rows] = await pool.query(
    'SELECT id, email, first_name, last_name, gender, address, phone, role FROM users WHERE id = ?',
    [session.id]
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}