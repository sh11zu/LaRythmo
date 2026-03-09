// app/(main)/admin/page.js
// Dashboard "Admin" (même design, mais avec les outils admin)

import Link from 'next/link';
import pool, { initializeDatabase } from '../../../lib/db';
import { revalidatePath } from 'next/cache';

// --- ACTION SERVEUR ---
async function triggerDbInit() {
  'use server';
  await initializeDatabase();
  revalidatePath('/admin');
}

export default async function AdminDashboard() {
  // Fausse donnée utilisateur (à remplacer plus tard par la vraie session)
  const user = {
    firstname: 'Lando',
    lastname: 'MORRITZ',
    avatar: 'L',
  };

  // --- VÉRIFICATION DE LA BASE DE DONNÉES ---
  let dbStatus = { connected: false, error: null, host: '', dbName: '', tables: [] };
  try {
    const connection = await pool.getConnection();
    dbStatus.connected = true;
    const [infoRows] = await connection.query('SELECT DATABASE() as dbName, @@hostname as host');
    dbStatus.dbName = infoRows[0].dbName;
    dbStatus.host = infoRows[0].host;
    const [tableRows] = await connection.query('SHOW TABLES');
    dbStatus.tables = tableRows.map(row => Object.values(row)[0]);
    connection.release();
  } catch (err) {
    console.error("🔥 ERREUR CRITIQUE BDD:", err); 
    dbStatus.error = err.code || err.message || JSON.stringify(err, Object.getOwnPropertyNames(err)) || "Erreur inconnue";
  }
  const expectedTables = 8;
  const isDbComplete = dbStatus.tables.length === expectedTables;

  // --- MENU ADMIN ---
  const adminItems = [
    {
      title: "Gestion des Cours",
      desc: "Horaires, tarifs, formules",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-gray-600 to-gray-500",
      href: "/admin/courses",
    },
    {
      title: "Annuaire Elèves",
      desc: "Fiches élèves et contacts",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-orange-400 to-amber-500",
      href: "/admin/students",
    },
    {
      title: "Utilisateurs",
      desc: "Comptes parents/représentants",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884.95 2 2 2 2.05 0 2-1.116 2-2"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-cyan-600 to-blue-600",
      href: "/admin/users",
    },
    {
      title: "Liste Inscriptions",
      desc: "Suivi global des demandes",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-rose-500 to-red-600",
      href: "/admin/inscriptions",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      
      {/* En-tête */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Bonjour, {user.firstname} {user.lastname}
        </h1>
      </div>

      {/* Boutons d'action rapides */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-[#7b68ee] uppercase tracking-wider mb-4 border-b border-[#7b68ee]/30 pb-2 inline-block">
          🛡️ Outils Administrateurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {adminItems.map((item, index) => (
            <Link
              href={item.href}
              key={index}
              className="glass-panel p-6 rounded-2xl flex items-center gap-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group cursor-pointer border border-white/60"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300 ${item.bg}`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700 group-hover:text-[#7b68ee] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2.5 group-hover:translate-x-0 transition-all duration-300 text-[#7b68ee]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Widget Base de Données */}
      <div>
        <h2 className="text-lg font-bold text-[#7b68ee] uppercase tracking-wider mb-4 border-b border-[#7b68ee]/30 pb-2 inline-block">
          🗄️ État du Système
        </h2>
        <section className="glass-panel max-w-4xl rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-6 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Diagnostic MariaDB
              </h3>
              <p className="text-sm text-gray-500 mt-1">Vérification de la connexion et intégrité des tables.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-white">
              <div className={`w-3 h-3 rounded-full animate-pulse ${dbStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-bold text-gray-700">
                {dbStatus.connected ? 'Connecté' : 'Erreur de Connexion'}
              </span>
            </div>
          </div>

          {dbStatus.connected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Hôte (Host)</span>
                  <span className="font-semibold text-gray-800">{dbStatus.host}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Base active</span>
                  <span className="font-semibold text-gray-800">{dbStatus.dbName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Tables trouvées</span>
                  <span className="font-semibold text-gray-800">{dbStatus.tables.length} / {expectedTables}</span>
                </div>
              </div>

              <div className="bg-white/40 rounded-xl p-4 border border-white/50 flex flex-col justify-center">
                {isDbComplete ? (
                  <div className="text-center text-sm">
                    <div className="text-green-500 text-3xl mb-2">✓</div>
                    <p className="font-bold text-gray-800">Base de données aux normes.</p>
                    <p className="text-gray-500 mt-1">Les {expectedTables} tables requises sont prêtes.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-orange-600 font-bold mb-3">Attention : Il manque des tables.</p>
                    <form action={triggerDbInit}>
                      <button type="submit" className="px-4 py-2 bg-linear-to-r from-[#7b68ee] to-[#ff69b4] text-white text-sm font-bold rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer">
                        Initialiser les tables
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
              <p className="font-bold mb-1">Impossible de se connecter :</p>
              <p className="font-mono bg-red-100 p-2 rounded text-xs overflow-x-auto">{dbStatus.error}</p>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}