// app/(main)/admin/users/page.js
// Page d'administration des utilisateurs : gestion des comptes parents et représentants légaux

import pool from '@/lib/db';
import UsersTable from './UsersTable';

export default async function AdminUsers() {
  const [rows] = await pool.query(
    `SELECT id, email, first_name, last_name, gender, address, phone, role, created_at
     FROM users
     ORDER BY id ASC`
  );

  // Sérialiser les dates (objets Date non sérialisables pour les props client)
  const users = rows.map(u => ({
    ...u,
    created_at: u.created_at instanceof Date ? u.created_at.toISOString() : u.created_at,
  }));

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
        <p className="text-gray-500 mt-1">{users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}.</p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}