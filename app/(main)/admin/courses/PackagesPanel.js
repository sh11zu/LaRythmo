'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DAY_SHORT = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mer',
  THURSDAY: 'Jeu', FRIDAY: 'Ven', SATURDAY: 'Sam', SUNDAY: 'Dim',
};

const INPUT_CLASS = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/30 bg-white';
const LABEL_CLASS = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1';

export default function PackagesPanel({ packages: initialPackages }) {
  const router = useRouter();
  const [editPkg, setEditPkg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/admin/packages/${editPkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPkg.name,
          price: editPkg.price,
          description: editPkg.description,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? 'Erreur lors de la sauvegarde.');
        return;
      }
      setEditPkg(null);
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
        <div className="px-5 py-4 border-b border-gray-100/60 bg-white/20">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Forfaits</h2>
          <p className="text-xs text-gray-400 mt-0.5">{initialPackages.length} forfait{initialPackages.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="divide-y divide-gray-100/60">
          {initialPackages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`px-5 py-4 hover:bg-white/40 transition-colors ${i % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-gray-800 text-sm leading-tight">{pkg.name}</p>
                <button
                  onClick={() => { setEditPkg({ id: pkg.id, name: pkg.name, price: pkg.price, description: pkg.description }); setSaveError(''); }}
                  title="Modifier le forfait"
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-[#7b68ee] hover:bg-[#7b68ee]/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>

              {/* Slots */}
              {pkg.slots.length > 0 && (
                <div className="mt-2 space-y-2">
                  {pkg.slots.map(slot => (
                    <div key={slot.slot_id}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {slot.courses.length === 1 ? 'Obligatoire' : `Choix ${slot.slot_order}`}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {slot.courses.map(c => (
                          <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                            {c.name} <span className="opacity-50">({DAY_SHORT[c.day_of_week]})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pkg.description && (
                <p className="text-xs text-gray-400 mt-2 leading-snug">{pkg.description}</p>
              )}

              <p className="text-sm font-bold text-[#7b68ee] mt-2">
                {Number(pkg.price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          ))}

          {initialPackages.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-medium">Aucun forfait trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {editPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditPkg(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Modifier le forfait</h2>
              <button onClick={() => setEditPkg(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Nom du forfait</label>
                <input
                  type="text"
                  value={editPkg.name}
                  onChange={e => setEditPkg(p => ({ ...p, name: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Prix (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPkg.price}
                  onChange={e => setEditPkg(p => ({ ...p, price: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Description</label>
                <textarea
                  value={editPkg.description ?? ''}
                  onChange={e => setEditPkg(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className={INPUT_CLASS + ' resize-none'}
                />
              </div>
            </div>

            {saveError && (
              <p className="mt-4 text-sm text-red-500 font-medium">{saveError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditPkg(null)}
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