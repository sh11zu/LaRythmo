// app/api/admin/packages/[id]/route.js

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { name, price, description } = body;

  if (!name || price == null) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
  }

  await pool.query(
    `UPDATE packages SET name = ?, price = ?, description = ? WHERE id = ?`,
    [name, Number(price), description || null, Number(id)]
  );

  return NextResponse.json({ success: true });
}
