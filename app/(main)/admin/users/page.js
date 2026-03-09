// app/(main)/admin/users/page.js
// Page d'administration des utilisateurs : gestion des comptes parents et représentants légaux

'use client';
import Link from 'next/link';

export default function AdminUsers() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-[#7b68ee] mb-4 inline-block font-medium transition-colors"
      >
        ← Retour Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion Utilisateurs</h1>
        <p className="text-gray-600 mb-8">Comptes parents et représentants légaux.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <p className="text-blue-600 font-bold uppercase text-xs mb-1">Total Parents</p>
            <p className="text-3xl font-bold text-blue-900">142</p>
          </div>
          <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
            <p className="text-green-600 font-bold uppercase text-xs mb-1">Nouveaux (30j)</p>
            <p className="text-3xl font-bold text-green-900">+12</p>
          </div>
          <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 flex items-center justify-center cursor-pointer hover:bg-purple-100/50 transition-colors">
            <span className="text-purple-600 font-bold">+ Ajouter manuel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
