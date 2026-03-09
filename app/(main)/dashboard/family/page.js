// app/(main)/dashboard/family/page.js
// Page listant les enfants liés à l'utilisateur (pour les représentants légaux)

'use client';

import Link from 'next/link';

export default function MyChildren() {
  const children = [
    { id: 1, firstname: "Charles", lastname: "LECLERC", dob: "16/10/1997", gender: "Garçon", courses_count: 1 },
    { id: 2, firstname: "Michèle", lastname: "MATHY", dob: "08/07/1957", gender: "Fille", courses_count: 0 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee]">← Retour</Link>
          <h1 className="text-3xl font-bold text-gray-800">Mes Enfants</h1>
        </div>

        <button className="bg-linear-to-r from-[#7b68ee] to-[#ff69b4] text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-transform hover:-translate-y-1">
          + Ajouter un enfant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <div
            key={child.id}
            className="glass-panel p-6 rounded-3xl border border-white/60 flex items-center gap-5 hover:bg-white/40 transition-colors"
          >
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                child.gender === 'Fille' ? 'bg-pink-200 text-pink-600' : 'bg-blue-200 text-blue-600'
              }`}
            >
              {child.gender === 'Fille' ? '👧' : '👦'}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {child.firstname} {child.lastname}
              </h2>
              <div className="text-sm text-gray-500 mt-1 space-y-1">
                <p>🎂 <span className="font-medium text-gray-700">{child.dob}</span></p>
                <p>Inscriptions : <span className="font-medium text-gray-700">{child.courses_count} cours</span></p>
              </div>
            </div>

            <button className="text-gray-400 hover:text-[#7b68ee]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
