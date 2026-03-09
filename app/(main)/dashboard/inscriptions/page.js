// app/(main)/dashboard/inscriptions/page.js
// Page listant les inscriptions liés à l'utilisateur (cours pour lui-même et pour ses enfants)

'use client';

import Link from 'next/link';

export default function MyInscriptions() {
  const inscriptions = [
    { id: 1, course: "Salsa Cubaine (Débutant)", student: "Moi-même (AZERTY)", price: "250€", status: "Validé", date: "12/09/2023" },
    { id: 2, course: "Eveil Danse (4-6 ans)", student: "Léo (Enfant)", price: "180€", status: "En attente", date: "14/09/2023" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee]">← Retour</Link>
        <h1 className="text-3xl font-bold text-gray-800">Mes inscriptions</h1>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-gray-200">Cours</th>
                <th className="p-5 font-bold border-b border-gray-200">Élève</th>
                <th className="p-5 font-bold border-b border-gray-200">Prix/An</th>
                <th className="p-5 font-bold border-b border-gray-200">Contrat</th>
                <th className="p-5 font-bold border-b border-gray-200 text-right">Statut</th>
              </tr>
            </thead>

            <tbody className="text-sm bg-white/20">
              {inscriptions.map((ins) => (
                <tr key={ins.id} className="hover:bg-white/40 transition-colors border-b border-gray-100 last:border-0">
                  <td className="p-5 font-bold text-gray-800">
                    {ins.course}
                    <span className="block text-xs text-gray-400 font-normal mt-1">
                      Inscrit le {ins.date}
                    </span>
                  </td>

                  <td className="p-5 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {ins.student.charAt(0)}
                      </div>
                      {ins.student}
                    </div>
                  </td>

                  <td className="p-5 font-mono text-gray-700">{ins.price}</td>

                  <td className="p-5">
                    <button className="flex items-center gap-1 text-xs font-bold text-[#7b68ee] hover:underline bg-white/50 px-2 py-1 rounded border border-[#7b68ee]/20">
                      <span>📄</span> Télécharger PDF
                    </button>
                  </td>

                  <td className="p-5 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        ins.status === 'Validé'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}
                    >
                      {ins.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
