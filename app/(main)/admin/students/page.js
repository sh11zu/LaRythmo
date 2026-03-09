// app/(main)/admin/students/page.js
// Page d'administration des élèves : annuaire, fiches élèves, contacts, etc.

'use client';
import Link from 'next/link';

export default function AdminEleves() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-[#7b68ee] mb-4 inline-block font-medium transition-colors"
      >
        ← Retour Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Annuaire Élèves</h1>
            <p className="text-gray-600 mt-1">Base de données de tous les enfants inscrits.</p>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher un élève..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200/60 text-gray-500 text-sm uppercase">
                <th className="pb-3 pl-2">Nom / Prénom</th>
                <th className="pb-3">Âge</th>
                <th className="pb-3">Parent référent</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-400 italic">
                  Chargement de l'annuaire...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
