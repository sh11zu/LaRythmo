// app/(main)/admin/courses/page.js
// Page d'administration des cours : gestion des créneaux horaires, tarifs, formules, etc.

import Link from 'next/link';
import pool from '@/lib/db';
import CoursesTable from './CoursesTable';
import PackagesPanel from './PackagesPanel';

export default async function AdminCourses() {
  const [[courseRows], [rawPackageRows]] = await Promise.all([
    pool.query(
      `SELECT id, name, teachers, day_of_week, start_time, end_time, single_price, max_capacity, wl
       FROM courses
       ORDER BY wl ASC, name ASC`
    ),
    pool.query(
      `SELECT
         p.id, p.name, p.price, p.description,
         ps.id AS slot_id, ps.slot_order,
         c.id AS course_id, c.name AS course_name,
         c.day_of_week, c.start_time AS course_start, c.end_time AS course_end
       FROM packages p
       LEFT JOIN package_slots ps ON ps.package_id = p.id
       LEFT JOIN package_slot_courses psc ON psc.slot_id = ps.id
       LEFT JOIN courses c ON c.id = psc.course_id
       ORDER BY p.price ASC, ps.slot_order ASC, c.name ASC`
    ),
  ]);

  const courses = courseRows.map(c => ({
    ...c,
    start_time:   c.start_time   != null ? String(c.start_time).substring(0, 5)   : null,
    end_time:     c.end_time     != null ? String(c.end_time).substring(0, 5)     : null,
    single_price: String(c.single_price),
  }));

  // Group flat JOIN rows into packages with nested slots and courses
  const packageMap = new Map();
  for (const row of rawPackageRows) {
    if (!packageMap.has(row.id)) {
      packageMap.set(row.id, {
        id: row.id,
        name: row.name,
        price: String(row.price),
        description: row.description,
        slots: new Map(),
      });
    }
    const pkg = packageMap.get(row.id);
    if (row.slot_id != null) {
      if (!pkg.slots.has(row.slot_id)) {
        pkg.slots.set(row.slot_id, { slot_id: row.slot_id, slot_order: row.slot_order, courses: [] });
      }
      if (row.course_id != null) {
        pkg.slots.get(row.slot_id).courses.push({
          id: row.course_id,
          name: row.course_name,
          day_of_week: row.day_of_week,
          start_time: row.course_start != null ? String(row.course_start).substring(0, 5) : null,
          end_time:   row.course_end   != null ? String(row.course_end).substring(0, 5)   : null,
        });
      }
    }
  }

  const packages = Array.from(packageMap.values()).map(p => ({
    ...p,
    slots: Array.from(p.slots.values()),
  }));

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cours et forfaits</h1>
        <p className="text-gray-500 mt-1">
          {courses.length} cours · {packages.length} forfait{packages.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-7 min-w-0">
          <CoursesTable courses={courses} />
        </div>
        <div className="flex-3 min-w-0">
          <PackagesPanel packages={packages} />
        </div>
      </div>
    </div>
  );
}