// app/(main)/dashboard/inscriptions/page.js

import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InscriptionsClient from './InscriptionsClient';

export default async function MyInscriptions() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const [rows] = await pool.query(
    `SELECT
       i.id,
       i.season,
       i.payment_status,
       i.registration_status,
       i.created_at,
       m.id            AS member_id,
       m.first_name    AS member_first_name,
       m.last_name     AS member_last_name,
       m.gender        AS member_gender,
       p.name          AS package_name,
       p.price         AS package_price,
       GROUP_CONCAT(c.name ORDER BY c.day_of_week, c.start_time SEPARATOR '|||') AS course_names,
       SUM(c.single_price) AS total_single_price
     FROM inscriptions i
     JOIN members m ON m.id = i.member_id
     LEFT JOIN packages p ON p.id = i.package_id
     LEFT JOIN inscription_courses ic ON ic.inscription_id = i.id
     LEFT JOIN courses c ON c.id = ic.course_id
     WHERE m.user_id = ?
     GROUP BY i.id
     ORDER BY m.last_name, m.first_name, i.season DESC`,
    [session.id]
  );

  // Grouper par membre
  const groupMap = new Map();
  const seasonsSet = new Set();

  for (const r of rows) {
    seasonsSet.add(r.season);

    if (!groupMap.has(r.member_id)) {
      groupMap.set(r.member_id, {
        memberId:  r.member_id,
        firstName: r.member_first_name,
        lastName:  r.member_last_name,
        gender:    r.member_gender,
        inscriptions: [],
      });
    }

    groupMap.get(r.member_id).inscriptions.push({
      id:                 r.id,
      season:             r.season,
      paymentStatus:      r.payment_status,
      registrationStatus: r.registration_status,
      createdAt:          r.created_at,
      packageName:        r.package_name ?? null,
      price:              r.package_price != null
                            ? Number(r.package_price)
                            : r.total_single_price != null
                              ? Number(r.total_single_price)
                              : null,
      courseNames: r.course_names ? r.course_names.split('|||') : [],
    });
  }

  const memberGroups = [...groupMap.values()];
  // Saisons triées du plus récent au plus ancien
  const seasons = [...seasonsSet].sort((a, b) => b.localeCompare(a));

  return <InscriptionsClient memberGroups={memberGroups} seasons={seasons} />;
}
