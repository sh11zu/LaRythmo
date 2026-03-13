'use client';

import Link from 'next/link';
import { parseAddress } from './MemberForm';

const GENDER_LABEL  = { MALE: 'Masculin', FEMALE: 'Féminin', OTHER: 'Autre' };
const GENDER_AVATAR = { MALE: '👦', FEMALE: '👧', OTHER: '🧒' };
const GENDER_COLOR  = { MALE: 'bg-blue-100 text-blue-600', FEMALE: 'bg-pink-100 text-pink-600', OTHER: 'bg-purple-100 text-purple-600' };

const REG_STATUS = {
  DRAFT:              { label: 'Brouillon',   cls: 'bg-gray-200 text-gray-700' },
  PENDING_VALIDATION: { label: 'En attente',  cls: 'bg-amber-100 text-amber-800' },
  VALIDATED:          { label: 'Validée',     cls: 'bg-green-100 text-green-800' },
  CANCELED:           { label: 'Annulée',     cls: 'bg-red-100 text-red-700' },
};
const PAY_STATUS = {
  PENDING: { label: 'Non payé', cls: 'bg-red-100 text-red-700' },
  PARTIAL: { label: 'Partiel',  cls: 'bg-amber-100 text-amber-800' },
  PAID:    { label: 'Payé',     cls: 'bg-green-100 text-green-800' },
};

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-800 mt-0.5 leading-snug">{value || <span className="text-gray-300 italic text-xs">—</span>}</dd>
    </div>
  );
}

function Card({ title, accent = 'text-[#7b68ee]', children, empty }) {
  return (
    <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${accent}`}>{title}</h3>
      {empty
        ? <p className="text-sm text-gray-300 italic">{empty}</p>
        : <dl className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
      }
    </div>
  );
}

function Wide({ children }) {
  return <div className="col-span-2">{children}</div>;
}

export default function MemberView({ member, accountUser, inscriptions }) {
  const hasGuardian2 = member.guardian2FirstName || member.guardian2LastName;
  const memberAddr   = parseAddress(member.address);
  const g2Addr       = parseAddress(member.guardian2Address);
  const acctAddr     = accountUser ? parseAddress(accountUser.address) : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${GENDER_COLOR[member.gender] ?? 'bg-gray-100'}`}>
            {GENDER_AVATAR[member.gender] ?? '🧒'}
          </div>
          <div>
            <Link href="/dashboard/family" className="text-gray-400 hover:text-[#7b68ee] text-sm transition-colors block mb-1">
              ← Ma famille
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {member.firstName} {member.lastName}
            </h1>
            {member.isOwner && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] mt-1 inline-block">
                Titulaire du compte
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/dashboard/family/${member.id}/edit`}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#7b68ee] border border-[#7b68ee]/30 hover:bg-[#7b68ee]/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Modifier
        </Link>
      </div>

      {/* ── Grille 2×2 (flat, même hauteur par ligne) ── */}
      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Ligne 1 col 1 — Infos personnelles */}
        <Card title="Informations personnelles">
          <InfoRow label="Prénom" value={member.firstName} />
          <InfoRow label="Nom" value={member.lastName} />
          <InfoRow label="Genre" value={GENDER_LABEL[member.gender]} />
          <InfoRow label="Date de naissance" value={fmtDate(member.birthDate)} />
          <Wide><InfoRow label="Adresse" value={memberAddr.line} /></Wide>
          <InfoRow label="Code postal" value={memberAddr.postal} />
          <InfoRow label="Ville"       value={memberAddr.city} />
        </Card>

        {/* Ligne 1 col 2 — Inscriptions */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <h3 className="text-xs font-bold text-[#7b68ee] uppercase tracking-widest mb-4">
            Inscriptions ({inscriptions.length})
          </h3>
          {inscriptions.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune inscription pour ce membre.</p>
          ) : (
            <div className="space-y-2">
              {inscriptions.map(i => {
                const reg = REG_STATUS[i.registrationStatus] ?? REG_STATUS.DRAFT;
                const pay = PAY_STATUS[i.paymentStatus] ?? PAY_STATUS.PENDING;
                return (
                  <div key={i.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/60 border border-white/80">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{i.season}</p>
                      <p className="text-xs text-gray-500 truncate">{i.packageName ?? 'À la carte'}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${reg.cls}`}>{reg.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.cls}`}>{pay.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ligne 2 col 1 — Responsable légal 1 */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Responsable Légal 1</h3>
            {member.guardian1Link && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] shrink-0 ml-2">{member.guardian1Link}</span>
            )}
          </div>
          {accountUser ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow label="Prénom" value={accountUser.firstName} />
              <InfoRow label="Nom" value={accountUser.lastName} />
              <InfoRow label="Email" value={accountUser.email} />
              <InfoRow label="Téléphone" value={accountUser.phone} />
              <Wide><InfoRow label="Adresse"     value={acctAddr.line} /></Wide>
              <InfoRow label="Code postal" value={acctAddr.postal} />
              <InfoRow label="Ville"       value={acctAddr.city} />
            </dl>
          ) : (
            <p className="text-sm text-gray-300 italic">—</p>
          )}
        </div>

        {/* Ligne 2 col 2 — Responsable légal 2 */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Responsable Légal 2</h3>
            {member.guardian2Link && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee] shrink-0 ml-2">{member.guardian2Link}</span>
            )}
          </div>
          {hasGuardian2 ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow label="Prénom" value={member.guardian2FirstName} />
              <InfoRow label="Nom" value={member.guardian2LastName} />
              <InfoRow label="Email" value={member.guardian2Email} />
              <InfoRow label="Téléphone" value={member.guardian2Phone} />
              <Wide><InfoRow label="Adresse"     value={g2Addr.line} /></Wide>
              <InfoRow label="Code postal" value={g2Addr.postal} />
              <InfoRow label="Ville"       value={g2Addr.city} />
            </dl>
          ) : (
            <p className="text-sm text-gray-300 italic">Aucun second responsable renseigné.</p>
          )}
        </div>

      </div>

      {/* ── Contact d'urgence — pleine largeur ── */}
      <div className="glass-panel rounded-2xl border border-white/60 p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">Contact d'urgence</h3>
          {member.emergencyLink && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0 ml-2">{member.emergencyLink}</span>
          )}
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
          <InfoRow label="Prénom" value={member.emergencyFirstName} />
          <InfoRow label="Nom" value={member.emergencyLastName} />
          <InfoRow label="Téléphone" value={member.emergencyPhone} />
          <InfoRow label="Email" value={member.emergencyEmail} />
        </dl>
      </div>

    </div>
  );
}