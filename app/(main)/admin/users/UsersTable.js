'use client';

import { useState, useMemo } from 'react';

const ROLE_CONFIG = {
  USER:      { label: 'Parent',         color: 'bg-blue-100 text-blue-700' },
  ADMIN:     { label: 'Administrateur', color: 'bg-purple-100 text-purple-700' },
  SYS_ADMIN: { label: 'Super Admin',    color: 'bg-red-100 text-red-700' },
};

const GENDER_LABEL = {
  MALE:   'Homme',
  FEMALE: 'Femme',
  OTHER:  'Autre',
};

const COLUMNS = [
  { key: 'id',          label: 'ID' },
  { key: 'last_name',   label: 'Utilisateur' },
  { key: 'email',       label: 'Contact' },
  { key: 'gender',      label: 'Genre' },
  { key: 'address',     label: 'Adresse' },
  { key: 'role',        label: 'Rôle' },
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

export default function UsersTable({ users }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? users.filter(u =>
          [u.first_name, u.last_name, u.email, u.phone, u.address,
           GENDER_LABEL[u.gender] ?? u.gender,
           ROLE_CONFIG[u.role]?.label ?? u.role,
          ].some(v => v?.toLowerCase().includes(q))
        )
      : users;

    return [...base].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = sortKey === 'id'
        ? Number(va) - Number(vb)
        : String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [users, search, sortKey, sortDir]);

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
                  onClick={() => handleSort(col.key)}
                  className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide cursor-pointer hover:text-[#7b68ee] select-none whitespace-nowrap transition-colors"
                >
                  {col.label}
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100/60 hover:bg-white/40 transition-colors ${i % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`}
              >
                <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                  #{user.id}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-700">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {GENDER_LABEL[user.gender] ?? user.gender}
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs">
                  {user.address}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_CONFIG[user.role]?.color ?? 'bg-gray-100 text-gray-700'}`}>
                    {ROLE_CONFIG[user.role]?.label ?? user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">
              {search ? `Aucun résultat pour « ${search} »` : 'Aucun utilisateur trouvé.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}