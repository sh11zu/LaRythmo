// app/(main)/admin/courses/page.js
// Page d'administration des cours : gestion des créneaux horaires, tarifs, formules, etc.

'use client';
import Link from 'next/link';

export default function AdminCours() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-[#7b68ee] mb-4 inline-block font-medium transition-colors"
      >
        ← Retour Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Cours</h1>
            <p className="text-gray-600 mt-1">Ajoutez, modifiez ou supprimez des créneaux horaires.</p>
          </div>
          <button className="bg-linear-to-r from-gray-700 to-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-transform hover:-translate-y-0.5">
            + Nouveau Cours
          </button>
        </div>

        <div className="bg-white/40 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">La liste des cours s'affichera ici.</p>
        </div>
      </div>
    </div>
  );
}
