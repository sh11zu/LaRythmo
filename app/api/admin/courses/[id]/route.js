// app/api/admin/courses/[id]/route.js

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { name, teachers, day_of_week, start_time, end_time, single_price, max_capacity, wl } = body;

  if (!name || !day_of_week || !start_time || !end_time || single_price == null) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
  }

  await pool.query(
    `UPDATE courses
     SET name = ?, teachers = ?, day_of_week = ?, start_time = ?, end_time = ?,
         single_price = ?, max_capacity = ?, wl = ?
     WHERE id = ?`,
    [name, teachers || null, day_of_week, start_time, end_time,
     Number(single_price), max_capacity ? Number(max_capacity) : 20,
     wl != null ? Number(wl) : 0,
     Number(id)]
  );

  return NextResponse.json({ success: true });
}