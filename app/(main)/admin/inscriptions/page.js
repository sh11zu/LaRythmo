// app/(main)/admin/inscriptions/page.js

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminInscriptionsClient from './AdminInscriptionsClient';

export default async function AdminInscriptionsPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  if (session.role !== 'ADMIN' && session.role !== 'SYS_ADMIN') redirect('/dashboard');

  const [rows] = await pool.query(
    `SELECT
       i.id,
       i.season,
       i.payment_status,
       i.registration_status,
       i.created_at,
       m.first_name    AS member_first_name,
       m.last_name     AS member_last_name,
       m.gender        AS member_gender,
       u.first_name    AS user_first_name,
       u.last_name     AS user_last_name,
       u.email         AS user_email,
       p.name          AS package_name,
       p.price         AS package_price,
       GROUP_CONCAT(c.name ORDER BY c.day_of_week, c.start_time SEPARATOR '|||') AS course_names,
       SUM(c.single_price) AS total_single_price
     FROM inscriptions i
     JOIN members m ON m.id = i.member_id
     JOIN users u ON u.id = m.user_id
     LEFT JOIN packages p ON p.id = i.package_id
     LEFT JOIN inscription_courses ic ON ic.inscription_id = i.id
     LEFT JOIN courses c ON c.id = ic.course_id
     GROUP BY i.id
     ORDER BY i.registration_status = 'PENDING_VALIDATION' DESC, i.created_at DESC`
  );

  const seasonsSet = new Set();
  const inscriptions = rows.map(r => {
    seasonsSet.add(r.season);
    return {
      id:                 r.id,
      season:             r.season,
      paymentStatus:      r.payment_status,
      registrationStatus: r.registration_status,
      createdAt:          r.created_at,
      memberFirstName:    r.member_first_name,
      memberLastName:     r.member_last_name,
      memberGender:       r.member_gender,
      userFirstName:      r.user_first_name,
      userLastName:       r.user_last_name,
      userEmail:          r.user_email,
      packageName:        r.package_name ?? null,
      price:              r.package_price != null
                            ? Number(r.package_price)
                            : r.total_single_price != null
                              ? Number(r.total_single_price)
                              : null,
      courseNames: r.course_names ? r.course_names.split('|||') : [],
    };
  });

  const seasons = [...seasonsSet].sort((a, b) => b.localeCompare(a));

  return <AdminInscriptionsClient inscriptions={inscriptions} seasons={seasons} />;
}
