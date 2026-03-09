// app/(main)/dashboard/profile/page.js
// Page affichant les informations personnelles de l'utilisateur

import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/db';

const ROLE_LABEL = {
  USER:      'Représentant Légal (Parent)',
  ADMIN:     'Administrateur',
  SYS_ADMIN: 'Super Administrateur',
};

export default async function MyProfile() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const [rows] = await pool.query(
    'SELECT id, email, first_name, last_name, gender, address, phone, role FROM users WHERE id = ?',
    [session.id]
  );
  const user = rows[0];
  if (!user) redirect('/login');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee]">← Retour</Link>
        <h1 className="text-3xl font-bold text-gray-800">Mes Informations</h1>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/60">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7b68ee]/10 text-[#7b68ee] rounded-full border border-[#7b68ee]/20">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">Type de compte</p>
              <p className="text-sm font-bold">{ROLE_LABEL[user.role] ?? user.role}</p>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Prénom</label>
              <input type="text" defaultValue={user.first_name} disabled className="input-field bg-gray-100/50 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Nom</label>
              <input type="text" defaultValue={user.last_name} disabled className="input-field bg-gray-100/50 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Email</label>
            <input type="email" defaultValue={user.email} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Téléphone</label>
              <input type="tel" defaultValue={user.phone} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Genre</label>
              <input type="text" defaultValue={user.gender} disabled className="input-field bg-gray-100/50 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Adresse complète</label>
            <input type="text" defaultValue={user.address} className="input-field" />
          </div>

          <button className="w-full py-4 mt-4 rounded-xl text-white font-bold text-lg bg-linear-to-r from-emerald-400 to-teal-400 hover:shadow-lg hover:-translate-y-1 transition-all">
            Sauvegarder les modifications
          </button>
        </form>
      </div>
    </div>
  );
}