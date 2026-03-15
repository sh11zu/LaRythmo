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

const STATUS_FILTERS = [
  { key: 'all',               label: 'Toutes' },
  { key: 'PENDING_VALIDATION', label: 'En attente' },
  { key: 'DRAFT',             label: 'Brouillon' },
  { key: 'VALIDATED',         label: 'Validées' },
  { key: 'CANCELED',          label: 'Annulées' },
];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function currentSeason() {
  const now = new Date();
  const y   = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export default function AdminInscriptionsClient({ inscriptions, seasons }) {
  const defaultSeason = seasons.includes(currentSeason()) ? currentSeason() : (seasons[0] ?? 'all');
  const [statusFilter, setStatusFilter] = useState('PENDING_VALIDATION');
  const [seasonFilter, setSeasonFilter] = useState(defaultSeason);

  const filtered = inscriptions.filter(i =>
    (statusFilter === 'all' || i.registrationStatus === statusFilter) &&
    (seasonFilter === 'all' || i.season === seasonFilter)
  );

  const showSeason = seasonFilter === 'all';

  // Compteurs par statut (pour la saison sélectionnée)
  const counts = STATUS_FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all'
      ? inscriptions.filter(i => seasonFilter === 'all' || i.season === seasonFilter).length
      : inscriptions.filter(i => i.registrationStatus === f.key && (seasonFilter === 'all' || i.season === seasonFilter)).length;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee] transition-colors text-sm">
          ← Retour
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Inscriptions</h1>
        <span className="text-sm text-gray-400 font-medium">({filtered.length} résultat{filtered.length !== 1 ? 's' : ''})</span>

        {/* Filtre saisons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            onClick={() => setSeasonFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              seasonFilter === 'all'
                ? 'bg-[#7b68ee] text-white border-[#7b68ee]'
                : 'bg-white/60 text-gray-500 border-gray-200 hover:border-[#7b68ee]/40 hover:text-[#7b68ee]'
            }`}
          >
            Tout afficher
          </button>
          {seasons.map(s => (
            <button key={s} onClick={() => setSeasonFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                seasonFilter === s
                  ? 'bg-[#7b68ee] text-white border-[#7b68ee]'
                  : 'bg-white/60 text-gray-500 border-gray-200 hover:border-[#7b68ee]/40 hover:text-[#7b68ee]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtres statut ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
              statusFilter === f.key
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white/60 text-gray-500 border-gray-200 hover:bg-white hover:text-gray-700'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tableau ── */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/60 p-16 text-center">
          <p className="text-gray-400 italic">Aucune inscription pour ce filtre.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                {showSeason && <col className="w-[11%]" />}
                <col className={showSeason ? 'w-[25%]' : 'w-[35%]'} />
                <col className="w-[10%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead>
                <tr className="bg-white/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-bold border-b border-gray-200">Élève</th>
                  <th className="px-5 py-3 font-bold border-b border-gray-200">Compte</th>
                  {showSeason && <th className="px-5 py-3 font-bold border-b border-gray-200">Saison</th>}
                  <th className="px-5 py-3 font-bold border-b border-gray-200">Cours / Forfait</th>
                  <th className="px-5 py-3 font-bold border-b border-gray-200">Prix</th>
                  <th className="px-5 py-3 font-bold border-b border-gray-200 text-right">Statuts</th>
                </tr>
              </thead>
              <tbody className="text-sm bg-white/20 divide-y divide-gray-100">
                {filtered.map(ins => {
                  const reg = REG_STATUS[ins.registrationStatus] ?? REG_STATUS.DRAFT;
                  const pay = PAY_STATUS[ins.paymentStatus]       ?? PAY_STATUS.PENDING;
                  return (
                    <tr
                      key={ins.id}
                      className="hover:bg-white/40 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/admin/inscriptions/${ins.id}`}
                    >
                      {/* Élève */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${GENDER_COLOR[ins.memberGender] ?? 'bg-gray-100 text-gray-500'}`}>
                            {ins.memberFirstName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 leading-tight truncate">{ins.memberFirstName} {ins.memberLastName}</p>
                            <p className="text-[10px] text-gray-400 leading-tight">Inscrit le {fmtDate(ins.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Compte */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 font-medium leading-tight truncate">
                          {ins.userFirstName} {ins.userLastName}
                        </p>
                        <p className="text-[10px] text-gray-400 leading-tight truncate">{ins.userEmail}</p>
                      </td>

                      {/* Saison */}
                      {showSeason && <td className="px-5 py-4 text-gray-700 font-medium">{ins.season}</td>}

                      {/* Cours / Forfait */}
                      <td className="px-5 py-4">
                        {ins.packageName ? (
                          <>
                            <p className="font-bold text-gray-800 leading-tight">{ins.packageName}</p>
                            <div className="mt-0.5 space-y-0.5">
                              {ins.courseNames.map((c, i) => (
                                <p key={i} className="text-xs text-gray-500 truncate">• {c}</p>
                              ))}
                            </div>
                          </>
                        ) : ins.courseNames.length > 0 ? (
                          <>
                            <p className="font-bold text-gray-800 leading-tight truncate">{ins.courseNames[0]}</p>
                            {ins.courseNames.slice(1).map((c, i) => (
                              <p key={i} className="text-xs text-gray-500 truncate mt-0.5">• {c}</p>
                            ))}
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                              À la carte
                            </span>
                          </>
                        ) : <span className="text-gray-400 italic">—</span>}
                      </td>

                      {/* Prix */}
                      <td className="px-5 py-4 font-mono font-bold text-gray-800">
                        {ins.price != null ? `${ins.price.toFixed(0)} €` : '—'}
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
      )}
    </div>
  );
}
