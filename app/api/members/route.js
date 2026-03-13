// app/api/members/route.js

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  const session = await getSessionUser();
  if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();

  const required = ['first_name', 'last_name', 'gender', 'birth_date',
    'emergency_contact_first_name', 'emergency_contact_last_name',
    'emergency_contact_phone', 'emergency_link_to_member'];

  for (const field of required) {
    if (!body[field]) return Response.json({ error: `Champ requis manquant : ${field}` }, { status: 400 });
  }

  const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'];
  if (!VALID_GENDERS.includes(body.gender)) {
    return Response.json({ error: 'Genre invalide' }, { status: 400 });
  }
  if (body.guardian2_gender && !VALID_GENDERS.includes(body.guardian2_gender)) {
    return Response.json({ error: 'Genre du second tuteur invalide' }, { status: 400 });
  }

  await pool.query(
    `INSERT INTO members
       (user_id, first_name, last_name, gender, birth_date, address,
        guardian1_link_to_member,
        guardian2_first_name, guardian2_last_name, guardian2_gender,
        guardian2_email, guardian2_phone, guardian2_address, guardian2_link_to_member,
        emergency_contact_first_name, emergency_contact_last_name,
        emergency_contact_email, emergency_contact_phone, emergency_link_to_member)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      body.first_name, body.last_name, body.gender, body.birth_date,
      body.address ?? null,
      body.guardian1_link_to_member ?? null,
      body.guardian2_first_name ?? null, body.guardian2_last_name ?? null,
      body.guardian2_gender ?? null, body.guardian2_email ?? null,
      body.guardian2_phone ?? null, body.guardian2_address ?? null,
      body.guardian2_link_to_member ?? null,
      body.emergency_contact_first_name, body.emergency_contact_last_name,
      body.emergency_contact_email ?? null,
      body.emergency_contact_phone, body.emergency_link_to_member,
    ]
  );

  return Response.json({ ok: true }, { status: 201 });
}