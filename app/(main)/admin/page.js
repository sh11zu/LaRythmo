// app/(main)/admin/page.js

import { getSessionUser } from '@/lib/auth';
import pool from '@/lib/db';
import AdminHome from './AdminHome';

export default async function AdminDashboard() {
  const session = await getSessionUser();
  const isSysAdmin = session.role === 'SYS_ADMIN';

  let adminData = null;
  try {
    const conn = await pool.getConnection();

    const [statusRows] = await conn.query(
      `SELECT registration_status AS status, COUNT(*) AS count
       FROM inscriptions GROUP BY registration_status`
    );
    const [payRows] = await conn.query(
      `SELECT payment_status AS status, COUNT(*) AS count
       FROM inscriptions GROUP BY payment_status`
    );
    const [[{ memberCount }]] = await conn.query(`SELECT COUNT(*) AS memberCount FROM members`);
    const [[{ userCount }]]   = await conn.query(`SELECT COUNT(*) AS userCount FROM users`);
    const [recentRows] = await conn.query(
      `SELECT i.id, i.registration_status, i.created_at,
              m.first_name, m.last_name
       FROM inscriptions i
       JOIN members m ON m.id = i.member_id
       ORDER BY i.created_at DESC LIMIT 8`
    );

    let dbStatus = null;
    if (isSysAdmin) {
      dbStatus = { connected: false, error: null, host: '', dbName: '', tables: [] };
      try {
        const [infoRows] = await conn.query('SELECT DATABASE() as dbName, @@hostname as host');
        dbStatus.connected = true;
        dbStatus.dbName    = infoRows[0].dbName;
        dbStatus.host      = infoRows[0].host;
        const [tableRows]  = await conn.query('SHOW TABLES');
        dbStatus.tables    = tableRows.map(r => Object.values(r)[0]);
      } catch (err) {
        dbStatus.error = err.code || err.message || 'Erreur inconnue';
      }
    }

    conn.release();

    const toCount = (rows) =>
      Object.fromEntries(rows.map(r => [r.status, Number(r.count)]));

    adminData = {
      byRegStatus: toCount(statusRows),
      byPayStatus: toCount(payRows),
      memberCount: Number(memberCount),
      userCount:   Number(userCount),
      recent:      recentRows.map(r => ({
        ...r,
        created_at: r.created_at?.toISOString?.() ?? String(r.created_at),
      })),
      dbStatus,
    };
  } catch (err) {
    console.error('Admin dashboard stats error:', err);
  }

  return (
    <AdminHome
      firstname={session.first_name}
      isSysAdmin={isSysAdmin}
      adminData={adminData}
    />
  );
}
