'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REG_OPTIONS = [
  { value: 'DRAFT',              label: 'Brouillon',   base: 'bg-gray-100 text-gray-600 border-gray-200',   active: 'bg-gray-600 text-white border-gray-600' },
  { value: 'PENDING_VALIDATION', label: 'En attente',  base: 'bg-amber-100 text-amber-700 border-amber-200', active: 'bg-amber-500 text-white border-amber-500' },
  { value: 'VALIDATED',          label: 'Valider',     base: 'bg-green-100 text-green-700 border-green-200', active: 'bg-green-600 text-white border-green-600' },
  { value: 'CANCELED',           label: 'Annuler',     base: 'bg-red-100 text-red-700 border-red-200',       active: 'bg-red-600 text-white border-red-600' },
];

const PAY_OPTIONS = [
  { value: 'PENDING', label: 'Non payé', base: 'bg-red-100 text-red-700 border-red-200',       active: 'bg-red-600 text-white border-red-600' },
  { value: 'PARTIAL', label: 'Partiel',  base: 'bg-amber-100 text-amber-700 border-amber-200', active: 'bg-amber-500 text-white border-amber-500' },
  { value: 'PAID',    label: 'Payé',     base: 'bg-green-100 text-green-700 border-green-200', active: 'bg-green-600 text-white border-green-600' },
];

export default function AdminActionsCard({ inscriptionId, registrationStatus, paymentStatus }) {
  const router   = useRouter();
  const [regStatus, setRegStatus] = useState(registrationStatus);
  const [payStatus, setPayStatus] = useState(paymentStatus);
  const [loading, setLoading]     = useState(null);

  async function update(field, value) {
    if (loading) return;
    setLoading(field + value);
    const res = await fetch(`/api/admin/inscriptions/${inscriptionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    setLoading(null);
    if (!res.ok) { alert('Erreur lors de la mise à jour'); return; }
    if (field === 'registration_status') setRegStatus(value);
    if (field === 'payment_status')      setPayStatus(value);
    router.refresh();
  }

  return (
    <div className="glass-panel rounded-2xl border border-rose-200/60 p-6">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-5 text-rose-500">Actions administrateur</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Statut inscription */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">Statut d'inscription</p>
          <div className="flex flex-wrap gap-2">
            {REG_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => regStatus !== opt.value && update('registration_status', opt.value)}
                disabled={!!loading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-60 ${
                  regStatus === opt.value ? opt.active : opt.base + ' hover:opacity-80 cursor-pointer'
                }`}
              >
                {loading === 'registration_status' + opt.value ? '…' : opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statut paiement */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">Statut de paiement</p>
          <div className="flex flex-wrap gap-2">
            {PAY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => payStatus !== opt.value && update('payment_status', opt.value)}
                disabled={!!loading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-60 ${
                  payStatus === opt.value ? opt.active : opt.base + ' hover:opacity-80 cursor-pointer'
                }`}
              >
                {loading === 'payment_status' + opt.value ? '…' : opt.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
