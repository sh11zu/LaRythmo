'use client';

import Link from 'next/link';

const GENDER_COLOR = { MALE: 'bg-blue-100 text-blue-600', FEMALE: 'bg-pink-100 text-pink-600', OTHER: 'bg-purple-100 text-purple-600' };

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function MembersPanel({ initialMembers }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee] transition-colors text-sm font-medium">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Ma famille</h1>
        </div>
        <Link
          href="/dashboard/family/new"
          className="bg-linear-to-r from-[#7b68ee] to-[#ff69b4] text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          + Ajouter un membre
        </Link>
      </div>

      {initialMembers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">Aucun membre enregistré.</p>
          <p className="text-sm mt-1">Ajoutez un membre pour commencer une inscription.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initialMembers.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/family/${m.id}`}
              className="glass-panel p-6 rounded-3xl border border-white/60 flex items-center gap-5 hover:bg-white/50 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner shrink-0 ${GENDER_COLOR[m.gender] ?? 'bg-gray-100 text-gray-500'}`}>
                {m.firstName?.[0]?.toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800 truncate">
                    {m.firstName} {m.lastName}
                  </h2>
                  {m.isOwner && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7b68ee]/10 text-[#7b68ee]">moi</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                  <p>Né(e) le <span className="font-medium text-gray-700">{fmtDate(m.birthDate)}</span></p>
                  <p>
                    <span className="font-medium text-gray-700">{m.inscriptionCount}</span>
                    {' '}inscription{m.inscriptionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#7b68ee] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}