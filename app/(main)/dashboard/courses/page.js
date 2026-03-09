// app/(main)/dashboard/courses/page.js
// Page de planning des cours, affichant une grille horaire avec les cours

import pool from '@/lib/db';
import PlanningGrid from './PlanningGrid';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const DAY_LABEL = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

const WL_COLOR = {
  0: 'bg-blue-100 text-blue-800 border-blue-300',
  1: 'bg-orange-100 text-orange-800 border-orange-300',
  2: 'bg-red-100 text-red-800 border-red-300',
};

export default async function Planning() {
  // 1. Récupération de l'utilisateur connecté depuis la session
  const session = await getSessionUser();

  if (!session) {
    // Si l'utilisateur n'est pas connecté, on le renvoie vers la page de login
    redirect('/login');
  }

  // 2. Récupération des cours
  const [coursesRows] = await pool.query(
    `SELECT id, name, teachers, day_of_week, start_time, end_time, wl, single_price
     FROM courses
     ORDER BY FIELD(day_of_week,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'), start_time ASC`
  );

  const courses = coursesRows.map(c => {
    const start = String(c.start_time).substring(0, 5);
    const end   = String(c.end_time).substring(0, 5);
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    
    return {
      id: c.id,
      day: DAY_LABEL[c.day_of_week],
      time: start,
      duration: (eh * 60 + em) - (sh * 60 + sm),
      title: c.name,
      teachers: c.teachers ?? '',
      wl: c.wl,
      singlePrice: parseFloat(c.single_price),
      color: WL_COLOR[c.wl] ?? WL_COLOR[0],
    };
  });

  // 3. Récupération des règles de packages
  const [packagesRows] = await pool.query(
    `SELECT p.id, p.name, p.price, ps.slot_order, psc.course_id
     FROM packages p
     JOIN package_slots ps ON p.id = ps.package_id
     JOIN package_slot_courses psc ON ps.id = psc.slot_id
     ORDER BY p.id, ps.slot_order`
  );

  const packagesMap = {};
  for (const row of packagesRows) {
    if (!packagesMap[row.id]) {
      packagesMap[row.id] = {
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        slotsMap: {}
      };
    }
    if (!packagesMap[row.id].slotsMap[row.slot_order]) {
      packagesMap[row.id].slotsMap[row.slot_order] = [];
    }
    packagesMap[row.id].slotsMap[row.slot_order].push(row.course_id);
  }

  const packages = Object.values(packagesMap).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    slots: Object.values(p.slotsMap) 
  }));

  // 4. NOUVEAU : Récupération des enfants (membres) de l'utilisateur connecté
  const [membersRows] = await pool.query(
    `SELECT id, first_name, last_name 
     FROM members 
     WHERE user_id = ?`,
    [session.id]
  );

  // Formatage pour le menu déroulant
  const childrenList = membersRows.map(m => ({
    id: m.id,
    name: `${m.first_name} ${m.last_name}`
  }));

  return <PlanningGrid courses={courses} packages={packages} childrenList={childrenList} />;
}