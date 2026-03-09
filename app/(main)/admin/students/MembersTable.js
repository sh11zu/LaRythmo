'use client';

import { useState, useMemo } from 'react';

const GENDER_SYMBOL = {
  MALE:   '♂',
  FEMALE: '♀',
  OTHER:  '⚬',
};

const COLUMNS = [
  { key: 'actions',     label: '',            sortable: false },
  { key: 'first_name',  label: 'Membre' },
  { key: 'gender',      label: 'Genre' },
  { key: 'birth_date',  label: 'Naissance' },
  { key: 'address',     label: 'Adresse' },
  { key: 'guardian1',   label: 'Responsable légal 1', sortable: false },
  { key: 'guardian2',   label: 'Responsable légal 2', sortable: false },
  { key: 'emergency',   label: 'Contact urgence',     sortable: false },
  { key: 'created_at',  label: 'Inscrit le' },
];

function SortIcon({ active, dir }) {
  return (
    <span className={`ml-1 inline-flex flex-col leading-none text-[10px] ${active ? 'text-[#7b68ee]' : 'text-gray-300'}`}>
      <span className={dir === 'asc' && active ? 'text-[#7b68ee]' : 'text-gray-300'}>▲</span>
      <span className={dir === 'desc' && active ? 'text-[#7b68ee]' : 'text-gray-300'}>▼</span>
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calcAge(birthDate) {
  if (!birthDate) return '—';
  const diff = Date.now() - new Date(birthDate).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} ans`;
}

export default function MembersTable({ members }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('first_name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? members.filter(m =>
          [m.first_name, m.last_name, m.address,
           m.gender,
           m.owner_first_name, m.owner_last_name, m.owner_email, m.owner_phone,
           m.guardian1_link_to_member,
           m.guardian2_first_name, m.guardian2_last_name,
           m.guardian2_email, m.guardian2_phone, m.guardian2_link_to_member,
           m.emergency_contact_first_name, m.emergency_contact_last_name,
           m.emergency_contact_email, m.emergency_contact_phone, m.emergency_link_to_member,
          ].some(v => v?.toLowerCase().includes(q))
        )
      : members;

    return [...base].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' })
        : String(vb).localeCompare(String(va), 'fr', { sensitivity: 'base' });
    });
  }, [members, search, sortKey, sortDir]);

  return (
    <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
      {/* Barre de recherche */}
      <div className="px-6 py-4 border-b border-gray-100/60 bg-white/20">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/60 border border-white/60 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-2">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour « {search} »</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200/60 bg-white/30">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`text-left px-4 py-3 font-bold text-gray-500 uppercase text-xs tracking-wide select-none whitespace-nowrap transition-colors
                    ${col.sortable !== false ? 'cursor-pointer hover:text-[#7b68ee]' : 'cursor-default'}`}
                >
                  {col.label}
                  {col.sortable !== false && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr
                key={m.id}
                className={`border-b border-gray-100/60 hover:bg-white/40 transition-colors ${i % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`}
              >
                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      title="Voir la fiche"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#7b68ee] hover:bg-[#7b68ee]/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button
                      title="Voir le contrat"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#7b68ee] hover:bg-[#7b68ee]/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </td>

                {/* Membre — nom uniquement */}
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-800 whitespace-nowrap">{m.first_name} {m.last_name}</p>
                </td>

                {/* Genre — symbole gras */}
                <td className="px-4 py-3 text-center">
                  <span className={`text-xl font-black leading-none ${m.gender === 'MALE' ? 'text-blue-400' : m.gender === 'FEMALE' ? 'text-pink-400' : 'text-gray-400'}`}>
                    {GENDER_SYMBOL[m.gender] ?? '?'}
                  </span>
                </td>

                {/* Date de naissance */}
                <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {formatDate(m.birth_date)}
                  <p className="text-gray-400">{calcAge(m.birth_date)}</p>
                </td>

                {/* Adresse */}
                <td className="px-4 py-3 text-gray-600 text-xs">{m.address ?? '—'}</td>

                {/* Responsable légal 1 */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 whitespace-nowrap">{m.owner_first_name} {m.owner_last_name}</p>
                  {m.guardian1_link_to_member && (
                    <p className="text-xs text-[#7b68ee] font-semibold">{m.guardian1_link_to_member}</p>
                  )}
                  <p className="text-xs text-gray-400">{m.owner_email}</p>
                  <p className="text-xs text-gray-400">{m.owner_phone}</p>
                </td>

                {/* Responsable légal 2 */}
                <td className="px-4 py-3">
                  {m.guardian2_first_name ? (
                    <>
                      <p className="font-medium text-gray-800 whitespace-nowrap">{m.guardian2_first_name} {m.guardian2_last_name}</p>
                      {m.guardian2_link_to_member && (
                        <p className="text-xs text-[#7b68ee] font-semibold">{m.guardian2_link_to_member}</p>
                      )}
                      <p className="text-xs text-gray-400">{m.guardian2_email}</p>
                      <p className="text-xs text-gray-400">{m.guardian2_phone}</p>
                    </>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>

                {/* Contact urgence */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 whitespace-nowrap">{m.emergency_contact_first_name} {m.emergency_contact_last_name}</p>
                  <p className="text-xs text-[#7b68ee] font-semibold">{m.emergency_link_to_member}</p>
                  {m.emergency_contact_email && (
                    <p className="text-xs text-gray-400">{m.emergency_contact_email}</p>
                  )}
                  <p className="text-xs text-gray-400">{m.emergency_contact_phone}</p>
                </td>

                {/* Inscrit le */}
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(m.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">
              {search ? `Aucun résultat pour « ${search} »` : 'Aucun membre trouvé.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}