// app/(main)/admin/students/page.js
// Page d'administration des membres : annuaire, fiches, contacts d'urgence

import Link from 'next/link';
import pool from '@/lib/db';
import MembersTable from './MembersTable';

export default async function AdminStudents() {
  const [rows] = await pool.query(
    `SELECT
       m.id, m.first_name, m.last_name, m.gender, m.birth_date, m.address,
       m.is_account_owner, m.created_at,
       m.guardian1_link_to_member,
       m.guardian2_first_name, m.guardian2_last_name, m.guardian2_gender,
       m.guardian2_email, m.guardian2_phone, m.guardian2_address, m.guardian2_link_to_member,
       m.emergency_contact_first_name, m.emergency_contact_last_name,
       m.emergency_contact_email, m.emergency_contact_phone, m.emergency_link_to_member,
       u.first_name AS owner_first_name, u.last_name AS owner_last_name,
       u.email AS owner_email, u.phone AS owner_phone
     FROM members m
     JOIN users u ON m.user_id = u.id
     ORDER BY m.id ASC`
  );

  const members = rows.map(m => ({
    ...m,
    birth_date: m.birth_date instanceof Date ? m.birth_date.toISOString() : m.birth_date,
    created_at: m.created_at instanceof Date ? m.created_at.toISOString() : m.created_at,
  }));

  return (
    <div className="w-full max-w-400 mx-auto px-4 md:px-6 py-8">
      <Link
        href="/admin"
        className="text-gray-500 hover:text-[#7b68ee] mb-6 inline-block font-medium transition-colors"
      >
        ← Retour Admin
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Annuaire des Membres</h1>
        <p className="text-gray-500 mt-1">{members.length} membre{members.length !== 1 ? 's' : ''} enregistré{members.length !== 1 ? 's' : ''}.</p>
      </div>

      <MembersTable members={members} />
    </div>
  );
}