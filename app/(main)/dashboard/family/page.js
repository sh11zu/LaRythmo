// app/(main)/dashboard/family/page.js

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MembersPanel from './MembersPanel';

export default async function FamilyPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const [rows] = await pool.query(
    `SELECT m.id, m.first_name, m.last_name, m.gender, m.birth_date,
            m.address, m.is_account_owner,
            m.guardian1_link_to_member,
            m.guardian2_first_name, m.guardian2_last_name, m.guardian2_gender,
            m.guardian2_email, m.guardian2_phone, m.guardian2_address,
            m.guardian2_link_to_member,
            m.emergency_contact_first_name, m.emergency_contact_last_name,
            m.emergency_contact_email, m.emergency_contact_phone,
            m.emergency_link_to_member,
            COUNT(i.id) AS inscription_count
     FROM members m
     LEFT JOIN inscriptions i ON i.member_id = m.id
     WHERE m.user_id = ?
     GROUP BY m.id
     ORDER BY m.is_account_owner DESC, m.first_name ASC`,
    [session.id]
  );

  const members = rows.map(m => ({
    id: m.id,
    firstName: m.first_name,
    lastName: m.last_name,
    gender: m.gender,
    birthDate: m.birth_date
      ? (m.birth_date instanceof Date ? m.birth_date.toISOString().split('T')[0] : String(m.birth_date).split('T')[0])
      : null,
    address: m.address ?? '',
    isOwner: Boolean(m.is_account_owner),
    guardian1Link: m.guardian1_link_to_member ?? '',
    guardian2FirstName: m.guardian2_first_name ?? '',
    guardian2LastName: m.guardian2_last_name ?? '',
    guardian2Gender: m.guardian2_gender ?? '',
    guardian2Email: m.guardian2_email ?? '',
    guardian2Phone: m.guardian2_phone ?? '',
    guardian2Address: m.guardian2_address ?? '',
    guardian2Link: m.guardian2_link_to_member ?? '',
    emergencyFirstName: m.emergency_contact_first_name ?? '',
    emergencyLastName: m.emergency_contact_last_name ?? '',
    emergencyEmail: m.emergency_contact_email ?? '',
    emergencyPhone: m.emergency_contact_phone ?? '',
    emergencyLink: m.emergency_link_to_member ?? '',
    inscriptionCount: Number(m.inscription_count),
  }));

  return <MembersPanel initialMembers={members} />;
}