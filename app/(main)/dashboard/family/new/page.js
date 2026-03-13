// app/(main)/dashboard/family/new/page.js

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MemberForm from '../MemberForm';

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

export default async function NewMemberPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const [[userRows], [siblingRows]] = await Promise.all([
    pool.query(
      `SELECT first_name, last_name, email, phone, address FROM users WHERE id = ?`,
      [session.id]
    ),
    pool.query(
      `SELECT last_name, address, guardian2_last_name, guardian2_address
       FROM members WHERE user_id = ?`,
      [session.id]
    ),
  ]);

  const u = userRows[0];
  const accountUser = u ? {
    firstName: u.first_name,
    lastName:  u.last_name,
    email:     u.email,
    phone:     u.phone,
    address:   u.address,
  } : null;

  const hints = computeHints(accountUser, siblingRows);

  return <MemberForm member={null} accountUser={accountUser} hints={hints} />;
}
