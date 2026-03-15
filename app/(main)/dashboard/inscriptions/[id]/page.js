// app/(main)/dashboard/inscriptions/[id]/page.js
// Dossier d'inscription — lecture seule (vue parent)

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import DossierDocuments from './DossierDocuments';

/* ── Constantes ── */

const GENDER_LABEL = { MALE: 'Masculin', FEMALE: 'Féminin', OTHER: 'Autre' };
const GENDER_COLOR = { MALE: 'bg-blue-100 text-blue-600', FEMALE: 'bg-pink-100 text-pink-600', OTHER: 'bg-purple-100 text-purple-600' };

const REG_STATUS = {
  DRAFT:              { label: 'Brouillon',   cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  PENDING_VALIDATION: { label: 'En attente',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  VALIDATED:          { label: 'Validé',      cls: 'bg-green-100 text-green-700 border-green-200' },
  CANCELED:           { label: 'Annulée',     cls: 'bg-red-100 text-red-700 border-red-200' },
};
const PAY_STATUS = {
  PENDING: { label: 'Non payé', cls: 'bg-red-100 text-red-700' },
  PARTIAL: { label: 'Partiel',  cls: 'bg-amber-100 text-amber-700' },
  PAID:    { label: 'Payé',     cls: 'bg-green-100 text-green-700' },
};
const DAY_FR = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

/* ── Utilitaires ── */

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtDateShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h}h${m === '00' ? '' : m}`;
}
function parseBirthDate(val) {
  if (!val) return null;
  return val instanceof Date ? val.toISOString().split('T')[0] : String(val).split('T')[0];
}
function parseAddress(str) {
  if (!str) return { line: '', postal: '', city: '' };
  const m = str.match(/^(.*?),?\s*(\d{4,5})\s+(.+)$/);
  if (m) return { line: m[1].trim(), postal: m[2], city: m[3].trim() };
  return { line: str.trim(), postal: '', city: '' };
}

/* ── Composants de présentation ── */

function Section({ title, accent = 'text-[#7b68ee]', children }) {
  return (
    <div className="glass-panel rounded-2xl border border-white/60 p-6">
      <h2 className={`text-xs font-bold uppercase tracking-widest mb-5 ${accent}`}>{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-800 mt-0.5 leading-snug">
        {value || <span className="text-gray-300 italic text-xs">—</span>}
      </dd>
    </div>
  );
}

function CardBlock({ title, badge, children }) {
  return (
    <div className="bg-white/50 rounded-xl border border-white/80 p-4 h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h3>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] shrink-0 ml-2">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Page principale ── */

export default async function DossierPage({ params }) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const resolvedParams = await params;
  const inscriptionId = Number(resolvedParams.id);
  if (!inscriptionId) notFound();

  // ── Récupération des données ──
  const [[insRows], [courseRows], [docRows], [userRows]] = await Promise.all([
    // Inscription + membre + package
    pool.query(
      `SELECT
         i.id, i.season, i.payment_status, i.registration_status, i.created_at,
         p.id AS package_id, p.name AS package_name, p.price AS package_price,
         m.id AS member_id, m.first_name, m.last_name, m.gender, m.birth_date, m.address,
         m.guardian1_link_to_member,
         m.guardian2_first_name, m.guardian2_last_name, m.guardian2_gender,
         m.guardian2_email, m.guardian2_phone, m.guardian2_address, m.guardian2_link_to_member,
         m.emergency_contact_first_name, m.emergency_contact_last_name,
         m.emergency_contact_email, m.emergency_contact_phone, m.emergency_link_to_member,
         u.id AS user_id
       FROM inscriptions i
       JOIN members m ON m.id = i.member_id
       JOIN users u ON u.id = m.user_id
       LEFT JOIN packages p ON p.id = i.package_id
       WHERE i.id = ? AND m.user_id = ?`,
      [inscriptionId, session.id]
    ),
    // Cours de l'inscription
    pool.query(
      `SELECT c.id, c.name, c.day_of_week, c.start_time, c.end_time, c.single_price, c.teachers
       FROM courses c
       JOIN inscription_courses ic ON ic.course_id = c.id
       WHERE ic.inscription_id = ?
       ORDER BY c.day_of_week, c.start_time`,
      [inscriptionId]
    ),
    // Documents du membre pour cette saison
    pool.query(
      `SELECT type, status, rejection_reason, file_path, uploaded_at, signed_at, signature_data
       FROM documents
       WHERE member_id = (
         SELECT member_id FROM inscriptions WHERE id = ? AND EXISTS (
           SELECT 1 FROM members m WHERE m.id = inscriptions.member_id AND m.user_id = ?
         )
       )
       AND season = (SELECT season FROM inscriptions WHERE id = ?)`,
      [inscriptionId, session.id, inscriptionId]
    ),
    // Responsable légal 1 (titulaire du compte)
    pool.query(
      `SELECT first_name, last_name, email, phone, address, gender
       FROM users WHERE id = ?`,
      [session.id]
    ),
  ]);

  if (!insRows[0]) notFound();

  const ins  = insRows[0];
  const u    = userRows[0];
  const docs = docRows.map(d => ({
    ...d,
    signature_data: d.signature_data
      ? (typeof d.signature_data === 'string' ? JSON.parse(d.signature_data) : d.signature_data)
      : null,
  }));

  const memberAddr = parseAddress(ins.address);
  const g2Addr     = parseAddress(ins.guardian2_address);
  const acctAddr   = u ? parseAddress(u.address) : null;

  const reg = REG_STATUS[ins.registration_status] ?? REG_STATUS.DRAFT;
  const pay = PAY_STATUS[ins.payment_status]       ?? PAY_STATUS.PENDING;

  const price = ins.package_price != null
    ? Number(ins.package_price)
    : courseRows.reduce((sum, c) => sum + Number(c.single_price), 0);

  const hasGuardian2 = ins.guardian2_first_name || ins.guardian2_last_name;
  const memberName   = `${ins.first_name} ${ins.last_name}`.trim();
  const guardianName = u ? `${u.first_name} ${u.last_name}`.trim() : '';

  const contacts = {
    guardian1: u ? {
      firstName: u.first_name,
      lastName:  u.last_name,
      gender:    u.gender,
      address:   u.address,
      quality:   ins.guardian1_link_to_member ?? '',
      phone:     u.phone ?? '',
    } : null,
    guardian2: ins.guardian2_first_name ? {
      firstName: ins.guardian2_first_name,
      lastName:  ins.guardian2_last_name,
      quality:   ins.guardian2_link_to_member,
      phone:     ins.guardian2_phone,
    } : null,
    emergency: ins.emergency_contact_first_name ? {
      firstName: ins.emergency_contact_first_name,
      lastName:  ins.emergency_contact_last_name,
      quality:   ins.emergency_link_to_member,
      phone:     ins.emergency_contact_phone,
    } : null,
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner shrink-0 ${GENDER_COLOR[ins.gender] ?? 'bg-gray-100 text-gray-500'}`}>
            {ins.first_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <Link href="/dashboard/inscriptions" className="text-gray-400 hover:text-[#7b68ee] text-sm transition-colors block mb-1">
              ← Mes inscriptions
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              Dossier · {ins.first_name} {ins.last_name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Saison {ins.season} · Ouvert le {fmtDate(ins.created_at)}
            </p>
          </div>
        </div>

        {/* Statuts */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${reg.cls}`}>
            {reg.label}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pay.cls}`}>
            {pay.label}
          </span>
        </div>
      </div>

      <div className="space-y-5">

        {/* ── 1. Informations de l'élève ── */}
        <Section title="Informations de l'élève">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
            <InfoRow label="Prénom"           value={ins.first_name} />
            <InfoRow label="Nom"              value={ins.last_name} />
            <InfoRow label="Genre"            value={GENDER_LABEL[ins.gender]} />
            <InfoRow label="Date de naissance" value={fmtDateShort(parseBirthDate(ins.birth_date))} />
            <div className="col-span-2"><InfoRow label="Adresse"     value={memberAddr.line} /></div>
            <InfoRow label="Code postal" value={memberAddr.postal} />
            <InfoRow label="Ville"       value={memberAddr.city} />
          </dl>
        </Section>

        {/* ── 2. Responsables légaux + contact d'urgence ── */}
        <Section title="Représentants légaux &amp; contact d'urgence">
          <div className="grid grid-cols-2 gap-4 mb-4">

            {/* RL1 */}
            <CardBlock title="Responsable Légal 1" badge={ins.guardian1_link_to_member}>
              {u ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <InfoRow label="Prénom"    value={u.first_name} />
                  <InfoRow label="Nom"       value={u.last_name} />
                  <InfoRow label="Email"     value={u.email} />
                  <InfoRow label="Téléphone" value={u.phone} />
                  <div className="col-span-2"><InfoRow label="Adresse" value={acctAddr?.line} /></div>
                  <InfoRow label="Code postal" value={acctAddr?.postal} />
                  <InfoRow label="Ville"       value={acctAddr?.city} />
                </dl>
              ) : <p className="text-sm text-gray-300 italic">—</p>}
            </CardBlock>

            {/* RL2 */}
            <CardBlock title="Responsable Légal 2" badge={ins.guardian2_link_to_member}>
              {hasGuardian2 ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <InfoRow label="Prénom"    value={ins.guardian2_first_name} />
                  <InfoRow label="Nom"       value={ins.guardian2_last_name} />
                  <InfoRow label="Email"     value={ins.guardian2_email} />
                  <InfoRow label="Téléphone" value={ins.guardian2_phone} />
                  <div className="col-span-2"><InfoRow label="Adresse" value={g2Addr.line} /></div>
                  <InfoRow label="Code postal" value={g2Addr.postal} />
                  <InfoRow label="Ville"       value={g2Addr.city} />
                </dl>
              ) : <p className="text-sm text-gray-400 italic">Aucun second responsable renseigné.</p>}
            </CardBlock>
          </div>

          {/* Contact d'urgence pleine largeur */}
          <CardBlock
            title="Contact d'urgence"
            badge={ins.emergency_link_to_member}
          >
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
              <InfoRow label="Prénom"    value={ins.emergency_contact_first_name} />
              <InfoRow label="Nom"       value={ins.emergency_contact_last_name} />
              <InfoRow label="Téléphone" value={ins.emergency_contact_phone} />
              <InfoRow label="Email"     value={ins.emergency_contact_email} />
            </dl>
          </CardBlock>
        </Section>

        {/* ── 3. Cours & forfait ── */}
        <Section title="Cours sélectionnés">
          {ins.package_name && (
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-[#7b68ee]/5 border border-[#7b68ee]/15">
              <div>
                <p className="text-xs font-bold text-[#7b68ee] uppercase tracking-wide">Forfait</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{ins.package_name}</p>
              </div>
              <p className="font-mono font-bold text-gray-800">{Number(ins.package_price).toFixed(0)} €</p>
            </div>
          )}

          {courseRows.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun cours sélectionné.</p>
          ) : (
            <div className="space-y-2">
              {courseRows.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/60 border border-white/80">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">{c.name}</p>
                    {c.teachers && <p className="text-xs text-gray-400 mt-0.5">{c.teachers}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {DAY_FR[c.day_of_week]} · {fmtTime(String(c.start_time))} – {fmtTime(String(c.end_time))}
                    </p>
                    {!ins.package_id && (
                      <p className="text-xs text-gray-400 font-mono">{Number(c.single_price).toFixed(0)} €</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {ins.package_id ? 'Forfait' : 'À la carte'}
            </p>
            <p className="font-mono font-bold text-lg text-gray-800">
              Total : {price.toFixed(0)} €
            </p>
          </div>
        </Section>

        {/* ── 4. Documents ── */}
        <Section title="Documents">
          <DossierDocuments
            docs={docs}
            memberName={memberName}
            guardianName={guardianName}
            season={ins.season}
            contacts={contacts}
            inscriptionId={ins.id}
          />
        </Section>

        {/* ── 5. Règlement ── */}
        <Section title="Règlement">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            <InfoRow label="Méthode de paiement" value="—" />
            <div>
              <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Statut</dt>
              <dd className="mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${pay.cls}`}>
                  {pay.label}
                </span>
              </dd>
            </div>
            <InfoRow label="Montant total" value={`${price.toFixed(0)} €`} />
          </div>
          <p className="text-[11px] text-gray-400 italic mt-4">
            Méthodes acceptées : CB, Chèque, Espèces, Chèque Vacances, Chèque Sport ANCV
          </p>
        </Section>

      </div>
    </div>
  );
}
