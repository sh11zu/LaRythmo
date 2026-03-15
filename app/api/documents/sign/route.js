// POST /api/documents/sign
// Enregistre la signature électronique simple (checkbox + horodatage + IP)
// Pour SANTE_ATTESTATION : génère aussi le cerfa rempli+aplati et le sauvegarde sur disque

import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const execFileAsync = promisify(execFile);

export async function POST(request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { inscriptionId, type, formData } = body;

  if (!inscriptionId || !type) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  // Récupérer l'IP du signataire
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          || request.headers.get('x-real-ip')
          || '0.0.0.0';

  // Vérifier que l'inscription appartient bien à l'utilisateur connecté
  const [[insRow]] = await pool.query(
    `SELECT i.member_id, i.season, m.first_name, m.last_name
     FROM inscriptions i
     JOIN members m ON m.id = i.member_id
     WHERE i.id = ? AND m.user_id = ?`,
    [inscriptionId, session.id]
  );

  if (!insRow) {
    return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 });
  }

  const { member_id, season } = insRow;

  // Vérifier que le document n'est pas déjà signé
  const [[existing]] = await pool.query(
    `SELECT id, signed_at FROM documents WHERE member_id = ? AND season = ? AND type = ?`,
    [member_id, season, type]
  );

  if (existing?.signed_at) {
    return NextResponse.json({ error: 'Document déjà signé' }, { status: 409 });
  }

  const signatureData = formData ? JSON.stringify(formData) : null;

  // Générer et sauvegarder le cerfa rempli si c'est le questionnaire de santé
  let filePath = null;
  if (type === 'SANTE_ATTESTATION' && formData?.answers) {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'cerfa');
      fs.mkdirSync(uploadsDir, { recursive: true });

      const scriptPath = path.join(process.cwd(), 'scripts', 'fill-cerfa-pdf.js');
      const { stdout } = await execFileAsync('node', [
        scriptPath,
        JSON.stringify({ answers: formData.answers, flatten: true }),
      ]);

      const fileName = `cerfa_${member_id}_${season}.pdf`;
      const fullPath = path.join(uploadsDir, fileName);
      fs.writeFileSync(fullPath, Buffer.from(stdout, 'base64'));
      filePath = `uploads/cerfa/${fileName}`;
    } catch (err) {
      console.error('Erreur génération cerfa:', err.stderr ?? err.message);
      // Non bloquant : on continue même si la génération PDF échoue
    }
  }

  if (existing) {
    await pool.query(
      `UPDATE documents
       SET signed_at = NOW(), signature_ip = ?, signature_data = ?${filePath ? ', file_path = ?' : ''}
       WHERE id = ?`,
      filePath
        ? [ip, signatureData, filePath, existing.id]
        : [ip, signatureData, existing.id]
    );
  } else {
    await pool.query(
      `INSERT INTO documents (member_id, season, type, signed_at, signature_ip, signature_data${filePath ? ', file_path' : ''})
       VALUES (?, ?, ?, NOW(), ?, ?${filePath ? ', ?' : ''})`,
      filePath
        ? [member_id, season, type, ip, signatureData, filePath]
        : [member_id, season, type, ip, signatureData]
    );
  }

  return NextResponse.json({ ok: true });
}
