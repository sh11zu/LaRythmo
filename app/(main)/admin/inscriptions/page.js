// app/(main)/admin/inscriptions/page.js
// Page d'administration des inscriptions : validation des inscriptions, gestion des contrats, etc.

'use client';
import Link from 'next/link';

export default function AdminInscriptions() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-[#7b68ee] mb-4 inline-block font-medium transition-colors"
      >
        ← Retour Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Inscriptions</h1>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg bg-white/60 text-sm font-bold text-gray-600 hover:bg-white">
              En attente
            </button>
            <button className="px-3 py-1 rounded-lg bg-transparent text-sm font-medium text-gray-400 hover:bg-white/30">
              Validées
            </button>
          </div>
        </div>

        <div className="bg-white/40 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">Aucune inscription en attente de validation.</p>
        </div>
      </div>
    </div>
  );
}
