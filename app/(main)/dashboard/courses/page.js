// app/(main)/dashboard/courses/page.js

import pool from '@/lib/db';
import PlanningGrid from './PlanningGrid';

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
  const [rows] = await pool.query(
    `SELECT id, name, teachers, day_of_week, start_time, end_time, wl
     FROM courses
     ORDER BY FIELD(day_of_week,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'), start_time ASC`
  );

  const courses = rows.map(c => {
    const start = String(c.start_time).substring(0, 5);
    const end   = String(c.end_time).substring(0, 5);
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);

    return {
      id: c.id,
      day: DAY_LABEL[c.day_of_week],
      time: start,
      duration,
      title: c.name,
      teachers: c.teachers ?? '',
      color: WL_COLOR[c.wl] ?? WL_COLOR[0],
    };
  });

  return <PlanningGrid courses={courses} />;
}