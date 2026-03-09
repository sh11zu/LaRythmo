'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const DAY_LABEL = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};
const DAY_ORDER = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
};
const DAY_OPTIONS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const WL_CATEGORY = {
  0: { label: 'Loisir GR et Danse',    badge: 'bg-blue-100 text-blue-700' },
  1: { label: 'Compétition Débutante', badge: 'bg-orange-100 text-orange-700' },
  2: { label: 'Compétition Fédérale',  badge: 'bg-red-100 text-red-700' },
};
const WL_OPTIONS = [0, 1, 2];

const COLUMNS = [
  { key: 'actions',      label: '',               sortable: false },
  { key: 'name',         label: 'Cours' },
  { key: 'teachers',     label: 'Professeur(s)',  sortable: false },
  { key: 'day_of_week',  label: 'Jour' },
  { key: 'start_time',   label: 'Horaire' },
  { key: 'single_price', label: 'Tarif' },
  { key: 'max_capacity', label: 'Capacité' },
];

function SortIcon({ active, dir }) {
  return (
    <span className={`ml-1 inline-flex flex-col leading-none text-[10px] ${active ? 'text-[#7b68ee]' : 'text-gray-300'}`}>
      <span className={dir === 'asc' && active ? 'text-[#7b68ee]' : 'text-gray-300'}>▲</span>
      <span className={dir === 'desc' && active ? 'text-[#7b68ee]' : 'text-gray-300'}>▼</span>
    </span>
  );
}

function formatTime(t) {
  if (!t) return '—';
  return String(t).substring(0, 5);
}

const INPUT_CLASS = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/30 bg-white';
const LABEL_CLASS = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1';

export default function CoursesTable({ courses: initialCourses }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [editCourse, setEditCourse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSort = (col) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? initialCourses.filter(c =>
          [c.name, c.teachers, DAY_LABEL[c.day_of_week]].some(v => v?.toLowerCase().includes(q))
        )
      : initialCourses;

    const sortFn = (a, b) => {
      if (sortKey === 'day_of_week') {
        const cmp = (DAY_ORDER[a.day_of_week] ?? 9) - (DAY_ORDER[b.day_of_week] ?? 9);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'single_price' || sortKey === 'max_capacity') {
        const cmp = Number(a[sortKey] ?? 0) - Number(b[sortKey] ?? 0);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' })
        : String(vb).localeCompare(String(va), 'fr', { sensitivity: 'base' });
    };

    return WL_OPTIONS
      .map(wl => ({
        wl,
        ...WL_CATEGORY[wl],
        courses: base.filter(c => Number(c.wl) === wl).sort(sortFn),
      }))
      .filter(g => g.courses.length > 0);
  }, [initialCourses, search, sortKey, sortDir]);

  const totalFiltered = grouped.reduce((sum, g) => sum + g.courses.length, 0);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/admin/courses/${editCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCourse.name,
          teachers: editCourse.teachers,
          day_of_week: editCourse.day_of_week,
          start_time: editCourse.start_time,
          end_time: editCourse.end_time,
          single_price: editCourse.single_price,
          max_capacity: editCourse.max_capacity,
          wl: editCourse.wl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? 'Erreur lors de la sauvegarde.');
        return;
      }
      setEditCourse(null);
      router.refresh();
    } catch {
      setSaveError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
            <p className="text-xs text-gray-400 mt-2">{totalFiltered} résultat{totalFiltered !== 1 ? 's' : ''} pour « {search} »</p>
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
              {grouped.map(group => (
                <>
                  {/* En-tête de catégorie */}
                  <tr key={`header-${group.wl}`} className="bg-gray-50/80 border-b border-gray-200/60">
                    <td colSpan={COLUMNS.length} className="px-4 py-2">
                      <span className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${group.badge}`}>
                        {group.label}
                        <span className="font-normal opacity-60">{group.courses.length} cours</span>
                      </span>
                    </td>
                  </tr>

                  {group.courses.map((course, i) => (
                    <tr
                      key={course.id}
                      className={`border-b border-gray-100/60 hover:bg-white/40 transition-colors ${i % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`}
                    >
                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => { setEditCourse({ ...course }); setSaveError(''); }}
                          title="Modifier le cours"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#7b68ee] hover:bg-[#7b68ee]/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>

                      {/* Cours */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{course.name}</p>
                      </td>

                      {/* Professeur(s) */}
                      <td className="px-4 py-3 text-gray-600 text-xs">{course.teachers ?? '—'}</td>

                      {/* Jour */}
                      <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                        {DAY_LABEL[course.day_of_week] ?? course.day_of_week}
                      </td>

                      {/* Horaire */}
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {formatTime(course.start_time)} – {formatTime(course.end_time)}
                      </td>

                      {/* Tarif */}
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {Number(course.single_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>

                      {/* Capacité */}
                      <td className="px-4 py-3 text-gray-500 text-center">
                        {course.max_capacity ?? '—'}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>

          {grouped.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">
                {search ? `Aucun résultat pour « ${search} »` : 'Aucun cours trouvé.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditCourse(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Modifier le cours</h2>
              <button onClick={() => setEditCourse(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Nom du cours</label>
                <input
                  type="text"
                  value={editCourse.name}
                  onChange={e => setEditCourse(c => ({ ...c, name: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Professeur(s)</label>
                <input
                  type="text"
                  value={editCourse.teachers ?? ''}
                  onChange={e => setEditCourse(c => ({ ...c, teachers: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Catégorie</label>
                  <select
                    value={Number(editCourse.wl)}
                    onChange={e => setEditCourse(c => ({ ...c, wl: Number(e.target.value) }))}
                    className={INPUT_CLASS}
                  >
                    {WL_OPTIONS.map(w => (
                      <option key={w} value={w}>{WL_CATEGORY[w].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Jour</label>
                  <select
                    value={editCourse.day_of_week}
                    onChange={e => setEditCourse(c => ({ ...c, day_of_week: e.target.value }))}
                    className={INPUT_CLASS}
                  >
                    {DAY_OPTIONS.map(d => (
                      <option key={d} value={d}>{DAY_LABEL[d]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Début</label>
                  <input
                    type="time"
                    value={formatTime(editCourse.start_time)}
                    onChange={e => setEditCourse(c => ({ ...c, start_time: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Fin</label>
                  <input
                    type="time"
                    value={formatTime(editCourse.end_time)}
                    onChange={e => setEditCourse(c => ({ ...c, end_time: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Tarif (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editCourse.single_price}
                    onChange={e => setEditCourse(c => ({ ...c, single_price: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Capacité max</label>
                  <input
                    type="number"
                    min="1"
                    value={editCourse.max_capacity ?? ''}
                    onChange={e => setEditCourse(c => ({ ...c, max_capacity: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {saveError && (
              <p className="mt-4 text-sm text-red-500 font-medium">{saveError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditCourse(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#7b68ee] text-white text-sm font-bold hover:bg-[#6a5adf] transition-colors disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
