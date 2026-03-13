// app/(main)/dashboard/family/[id]/edit/page.js

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import MemberForm from '../../MemberForm';

function parseBirthDate(val) {
  if (!val) return null;
  return val instanceof Date ? val.toISOString().split('T')[0] : String(val).split('T')[0];
}

function computeHints(accountUser, siblings) {
  const lastNames = [...new Set([
    accountUser?.lastName,
    ...siblings.map(s => s.last_name),
    ...siblings.map(s => s.guardian2_last_name),
  ].filter(Boolean))];

  const addresses = [...new Set([
    accountUser?.address,
    ...siblings.map(s => s.address),
    ...siblings.map(s => s.guardian2_address),
  ].filter(Boolean))];

  return { lastNames, addresses };
}

export default async function EditMemberPage({ params }) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (!id) notFound();

  const [[memberRows], [userRows], [inscriptionRows], [siblingRows]] = await Promise.all([
    pool.query(
      `SELECT id, first_name, last_name, gender, birth_date, address,
              guardian1_link_to_member,
              guardian2_first_name, guardian2_last_name, guardian2_gender,
              guardian2_email, guardian2_phone, guardian2_address, guardian2_link_to_member,
              emergency_contact_first_name, emergency_contact_last_name,
              emergency_contact_email, emergency_contact_phone, emergency_link_to_member
       FROM members WHERE id = ? AND user_id = ?`,
      [id, session.id]
    ),
    pool.query(
      `SELECT first_name, last_name, email, phone, address FROM users WHERE id = ?`,
      [session.id]
    ),
    pool.query(
      `SELECT i.id, i.season, i.payment_status, i.registration_status, p.name AS package_name
       FROM inscriptions i
       LEFT JOIN packages p ON p.id = i.package_id
       WHERE i.member_id = ?
       ORDER BY i.season DESC`,
      [id]
    ),
    pool.query(
      `SELECT last_name, address, guardian2_last_name, guardian2_address
       FROM members WHERE user_id = ? AND id != ?`,
      [session.id, id]
    ),
  ]);

  const row = memberRows[0];
  if (!row) notFound();

  const u = userRows[0];

  const member = {
    id:        row.id,
    firstName: row.first_name,
    lastName:  row.last_name,
    gender:    row.gender,
    birthDate: parseBirthDate(row.birth_date),
    address:   row.address ?? '',
    guardian1Link:      row.guardian1_link_to_member     ?? '',
    guardian2FirstName: row.guardian2_first_name         ?? '',
    guardian2LastName:  row.guardian2_last_name          ?? '',
    guardian2Gender:    row.guardian2_gender             ?? '',
    guardian2Email:     row.guardian2_email              ?? '',
    guardian2Phone:     row.guardian2_phone              ?? '',
    guardian2Address:   row.guardian2_address            ?? '',
    guardian2Link:      row.guardian2_link_to_member     ?? '',
    emergencyFirstName: row.emergency_contact_first_name ?? '',
    emergencyLastName:  row.emergency_contact_last_name  ?? '',
    emergencyEmail:     row.emergency_contact_email      ?? '',
    emergencyPhone:     row.emergency_contact_phone      ?? '',
    emergencyLink:      row.emergency_link_to_member     ?? '',
  };

  const accountUser = u ? {
    firstName: u.first_name,
    lastName:  u.last_name,
    email:     u.email,
    phone:     u.phone,
    address:   u.address,
  } : null;

  const inscriptions = inscriptionRows.map(i => ({
    id:                 i.id,
    season:             i.season,
    paymentStatus:      i.payment_status,
    registrationStatus: i.registration_status,
    packageName:        i.package_name ?? null,
  }));

  const hints = computeHints(accountUser, siblingRows);

  return (
    <MemberForm
      member={member}
      accountUser={accountUser}
      inscriptions={inscriptions}
      hints={hints}
      backUrl={`/dashboard/family/${id}`}
      successUrl={`/dashboard/family/${id}`}
    />
  );
}
