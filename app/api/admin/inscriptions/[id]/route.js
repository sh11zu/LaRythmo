import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

const VALID_REG = ['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'CANCELED'];
const VALID_PAY = ['PENDING', 'PARTIAL', 'PAID'];

export async function PATCH(req, { params }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (session.role !== 'ADMIN' && session.role !== 'SYS_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  const { registration_status, payment_status } = await req.json();

  if (registration_status && !VALID_REG.includes(registration_status)) {
    return NextResponse.json({ error: 'Statut inscription invalide' }, { status: 400 });
  }
  if (payment_status && !VALID_PAY.includes(payment_status)) {
    return NextResponse.json({ error: 'Statut paiement invalide' }, { status: 400 });
  }

  const updates = [];
  const values  = [];
  if (registration_status) { updates.push('registration_status = ?'); values.push(registration_status); }
  if (payment_status)       { updates.push('payment_status = ?');      values.push(payment_status); }
  if (!updates.length) return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 });

  values.push(id);
  await pool.query(`UPDATE inscriptions SET ${updates.join(', ')} WHERE id = ?`, values);
  return NextResponse.json({ ok: true });
}
