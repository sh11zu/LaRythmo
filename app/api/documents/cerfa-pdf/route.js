// GET /api/documents/cerfa-pdf?inscriptionId=xxx[&view=1]
// Sert le cerfa rempli sauvegardé sur disque lors de la signature

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const inscriptionId = searchParams.get('inscriptionId');
  const view = searchParams.get('view') === '1';
  if (!inscriptionId) return NextResponse.json({ error: 'inscriptionId manquant' }, { status: 400 });

  // Vérifier ownership (ou rôle admin) + récupérer le file_path
  const isAdmin = session.role === 'ADMIN' || session.role === 'SYS_ADMIN';
  const [[row]] = isAdmin
    ? await pool.query(
        `SELECT d.file_path, m.first_name, m.last_name
         FROM inscriptions i
         JOIN members m ON m.id = i.member_id
         JOIN documents d ON d.member_id = i.member_id AND d.season = i.season AND d.type = 'SANTE_ATTESTATION'
         WHERE i.id = ? AND d.signed_at IS NOT NULL`,
        [inscriptionId]
      )
    : await pool.query(
        `SELECT d.file_path, m.first_name, m.last_name
         FROM inscriptions i
         JOIN members m ON m.id = i.member_id
         JOIN documents d ON d.member_id = i.member_id AND d.season = i.season AND d.type = 'SANTE_ATTESTATION'
         WHERE i.id = ? AND m.user_id = ? AND d.signed_at IS NOT NULL`,
        [inscriptionId, session.id]
      );

  if (!row?.file_path) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });

  const fullPath = path.join(process.cwd(), row.file_path);
  if (!fs.existsSync(fullPath)) return NextResponse.json({ error: 'Fichier manquant sur le serveur' }, { status: 404 });

  const fileBytes = fs.readFileSync(fullPath);
  const memberName = [row.first_name, row.last_name].filter(Boolean).join('_');

  return new NextResponse(fileBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': view
        ? 'inline'
        : `attachment; filename="cerfa_qs_sport_${memberName}.pdf"`,
    },
  });
}
