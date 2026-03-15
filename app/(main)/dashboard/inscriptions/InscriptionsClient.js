'use client';

import { useState } from 'react';
import Link from 'next/link';

const REG_STATUS = {
  DRAFT:              { label: 'Brouillon',  cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  PENDING_VALIDATION: { label: 'En attente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  VALIDATED:          { label: 'Validé',     cls: 'bg-green-100 text-green-700 border-green-200' },
  CANCELED:           { label: 'Annulée',    cls: 'bg-red-100 text-red-700 border-red-200' },
};
const PAY_STATUS = {
  PENDING: { label: 'Non payé', cls: 'bg-red-100 text-red-700' },
  PARTIAL: { label: 'Partiel',  cls: 'bg-amber-100 text-amber-700' },
  PAID:    { label: 'Payé',     cls: 'bg-green-100 text-green-700' },
};
const GENDER_COLOR = { MALE: 'bg-blue-100 text-blue-600', FEMALE: 'bg-pink-100 text-pink-600', OTHER: 'bg-purple-100 text-purple-600' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function currentSeason() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export default function InscriptionsClient({ memberGroups, seasons }) {
  const defaultSeason = seasons.includes(currentSeason()) ? currentSeason() : (seasons[0] ?? 'all');
  const [selected, setSelected] = useState(defaultSeason);

  const showSeason = selected === 'all';

  // Filtrer les groupes selon la saison sélectionnée
  const filtered = memberGroups.map(g => ({
    ...g,
    inscriptions: selected === 'all'
      ? g.inscriptions
      : g.inscriptions.filter(i => i.season === selected),
  })).filter(g => g.inscriptions.length > 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee] transition-colors text-sm">← Retour</Link>
        <h1 className="text-3xl font-bold text-gray-800">Mes inscriptions</h1>

        {/* Filtre saisons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            onClick={() => setSelected('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              selected === 'all'
                ? 'bg-[#7b68ee] text-white border-[#7b68ee]'
                : 'bg-white/60 text-gray-500 border-gray-200 hover:border-[#7b68ee]/40 hover:text-[#7b68ee]'
            }`}
          >
            Tout afficher
          </button>
          {seasons.map(s => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                selected === s
                  ? 'bg-[#7b68ee] text-white border-[#7b68ee]'
                  : 'bg-white/60 text-gray-500 border-gray-200 hover:border-[#7b68ee]/40 hover:text-[#7b68ee]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/60 p-16 text-center">
          <p className="text-gray-400 italic mb-3">
            Aucune inscription pour la saison <strong>{selected}</strong>.
          </p>
          <button onClick={() => setSelected('all')} className="text-[#7b68ee] font-bold hover:underline text-sm">
            Voir toutes les saisons
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map(group => (
            <section key={group.memberId}>

              {/* En-tête du groupe */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${GENDER_COLOR[group.gender] ?? 'bg-gray-100 text-gray-500'}`}>
                  {group.firstName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <Link
                    href={`/dashboard/family/${group.memberId}`}
                    className="font-bold text-gray-800 hover:text-[#7b68ee] transition-colors"
                  >
                    {group.firstName} {group.lastName}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {group.inscriptions.length} inscription{group.inscriptions.length !== 1 ? 's' : ''}
                    {!showSeason && ` · ${selected}`}
                  </p>
                </div>
              </div>

              {/* Tableau */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <colgroup>
                      <col className={showSeason ? 'w-[42%]' : 'w-[54%]'} />
                      {showSeason && <col className="w-[14%]" />}
                      <col className="w-[12%]" />
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-white/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 font-bold border-b border-gray-200">Cours / Forfait</th>
                        {showSeason && <th className="px-5 py-3 font-bold border-b border-gray-200">Saison</th>}
                        <th className="px-5 py-3 font-bold border-b border-gray-200">Prix / an</th>
                        <th className="px-5 py-3 font-bold border-b border-gray-200">Contrat</th>
                        <th className="px-5 py-3 font-bold border-b border-gray-200 text-right">Statuts</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm bg-white/20 divide-y divide-gray-100">
                      {group.inscriptions.map(ins => {
                        const reg = REG_STATUS[ins.registrationStatus] ?? REG_STATUS.DRAFT;
                        const pay = PAY_STATUS[ins.paymentStatus]       ?? PAY_STATUS.PENDING;
                        return (
                          <tr
                            key={ins.id}
                            className="hover:bg-white/40 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/dashboard/inscriptions/${ins.id}`}
                          >

                            {/* Cours / Forfait */}
                            <td className="px-5 py-4">
                              {ins.packageName ? (
                                <>
                                  <p className="font-bold text-gray-800">{ins.packageName}</p>
                                  <div className="mt-1 space-y-0.5">
                                    {ins.courseNames.map((c, i) => (
                                      <p key={i} className="text-xs text-gray-500">• {c}</p>
                                    ))}
                                  </div>
                                </>
                              ) : ins.courseNames.length > 0 ? (
                                <>
                                  <div className="space-y-0.5">
                                    {ins.courseNames.map((c, i) => (
                                      <p key={i} className={i === 0 ? 'font-bold text-gray-800' : 'text-xs text-gray-500'}>
                                        {i > 0 ? '• ' : ''}{c}
                                      </p>
                                    ))}
                                  </div>
                                  <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                    À la carte
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                              <p className="text-[10px] text-gray-400 mt-1.5">Inscrit le {fmtDate(ins.createdAt)}</p>
                            </td>

                            {/* Saison (only in "all time") */}
                            {showSeason && (
                              <td className="px-5 py-4 text-gray-700 font-medium">{ins.season}</td>
                            )}

                            {/* Prix */}
                            <td className="px-5 py-4 font-mono font-bold text-gray-800">
                              {ins.price != null ? `${ins.price.toFixed(0)} €` : '—'}
                            </td>

                            {/* Contrat */}
                            <td className="px-5 py-4">
                              <button className="flex items-center gap-1.5 text-xs font-bold text-[#7b68ee] bg-white/50 hover:bg-white px-2.5 py-1.5 rounded-lg border border-[#7b68ee]/20 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                              </button>
                            </td>

                            {/* Statuts */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${reg.cls}`}>
                                  {reg.label}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pay.cls}`}>
                                  {pay.label}
                                </span>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </section>
          ))}
        </div>
      )}
    </div>
  );
}
