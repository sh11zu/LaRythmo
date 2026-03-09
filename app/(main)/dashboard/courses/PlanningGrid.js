'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const PX_PER_HOUR = 120;
const PAD_TOP = 12;
const PAD_BOTTOM = 20;

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
};

function computeLayout(dayCourses) {
  const sorted = [...dayCourses].sort((a, b) => toMin(a.time) - toMin(b.time));
  const layout = sorted.map(c => ({ course: c, col: 0, totalCols: 1 }));

  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const aEnd = toMin(layout[i].course.time) + layout[i].course.duration;
      if (toMin(layout[j].course.time) < aEnd) {
        layout[j].col = Math.max(layout[j].col, layout[i].col + 1);
        const cols = Math.max(layout[i].col, layout[j].col) + 1;
        layout[i].totalCols = Math.max(layout[i].totalCols, cols);
        layout[j].totalCols = Math.max(layout[j].totalCols, cols);
      }
    }
  }
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const aEnd = toMin(layout[i].course.time) + layout[i].course.duration;
      if (toMin(layout[j].course.time) < aEnd) {
        const cols = Math.max(layout[i].totalCols, layout[j].totalCols);
        layout[i].totalCols = cols;
        layout[j].totalCols = cols;
      }
    }
  }
  return layout;
}

export default function PlanningGrid({ courses }) {
  const [selectedCourses, setSelectedCourses] = useState([]);

  const DAYS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const activeDays = DAYS_ORDER.filter(day => courses.some(c => c.day === day));

  const { minMinutes, gridHeight, hourLines } = useMemo(() => {
    const starts = courses.map(c => toMin(c.time));
    const ends = courses.map(c => toMin(c.time) + c.duration);
    const min = Math.floor(Math.min(...starts) / 60) * 60;
    const max = Math.ceil(Math.max(...ends) / 60) * 60;
    const height = ((max - min) / 60) * PX_PER_HOUR + PAD_TOP + PAD_BOTTOM;
    const lines = [];
    for (let t = min; t <= max; t += 60) {
      lines.push({ key: t, top: PAD_TOP + ((t - min) / 60) * PX_PER_HOUR });
    }
    return { minMinutes: min, gridHeight: height, hourLines: lines };
  }, [courses]);

  const dayLayouts = useMemo(() => {
    const map = {};
    for (const day of activeDays) {
      map[day] = computeLayout(courses.filter(c => c.day === day));
    }
    return map;
  }, [courses, activeDays]);

  const toggleCourse = (id) =>
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Top of first Monday course — bubble must fit above it
  const mondayCourses = courses.filter(c => c.day === 'Lundi');
  const mondayFirstTop = mondayCourses.length > 0
    ? PAD_TOP + ((toMin(mondayCourses.reduce((a, b) => toMin(a.time) < toMin(b.time) ? a : b).time) - minMinutes) / 60) * PX_PER_HOUR
    : gridHeight;

  return (
    <div className="flex-1 min-h-0 w-full overflow-auto">
      <div className="p-5 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#7b68ee] font-medium transition-colors">
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Planning des cours</h1>
        </div>

        <div className="flex gap-3">
          {activeDays.map((day, dayIndex) => (
            <div key={day} className="flex-1 min-w-36 flex flex-col gap-2">
              {/* Day header */}
              <div className="h-10 flex items-center justify-center rounded-2xl text-sm font-bold text-gray-700 bg-white/80 border border-white/70 shadow-sm backdrop-blur-sm">
                {day}
              </div>

              {/* Course column */}
              <div className="relative rounded-2xl bg-white/15 border border-white/30" style={{ height: gridHeight }}>
                {hourLines.map(l => (
                  <div
                    key={l.key}
                    className="absolute inset-x-0 border-t border-dashed border-gray-300/30"
                    style={{ top: l.top }}
                  />
                ))}

                {/* Info bubble — in first column (Monday), top of the empty morning slot */}
                {dayIndex === 0 && (
                  <div
                    className="absolute inset-x-2 top-2 rounded-xl bg-white/80 backdrop-blur-sm border border-white/80 shadow-sm p-3 overflow-hidden"
                    style={{ maxHeight: mondayFirstTop - 16 }}
                  >
                    <p className="text-[11px] font-bold text-gray-700 mb-1">Inscription aux cours</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Cliquez sur un cours pour le sélectionner.
                    </p>
                    {selectedCourses.length > 0 && (
                      <>
                        <div className="mt-2 text-[10px] font-bold text-[#7b68ee]">
                          {selectedCourses.length} cours sélectionné{selectedCourses.length > 1 ? 's' : ''}
                        </div>
                        <button className="mt-2 w-full py-1.5 rounded-lg bg-linear-to-r from-[#7b68ee] to-[#a78bfa] text-white text-[10px] font-bold shadow-sm hover:shadow-md transition-all">
                          Commencer l'inscription →
                        </button>
                      </>
                    )}
                  </div>
                )}

                {dayLayouts[day].map(({ course, col, totalCols }) => {
                  const top = PAD_TOP + ((toMin(course.time) - minMinutes) / 60) * PX_PER_HOUR;
                  const height = (course.duration / 60) * PX_PER_HOUR;
                  const endMin = toMin(course.time) + course.duration;
                  const endStr = fmtTime(`${Math.floor(endMin / 60)}:${endMin % 60}`);
                  const isSelected = selectedCourses.includes(course.id);
                  const GAP = 3;

                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`absolute cursor-pointer rounded-xl border overflow-hidden flex flex-col transition-all duration-200 group
                        ${isSelected
                          ? 'bg-linear-to-br from-amber-50 to-amber-100 border-amber-300 shadow-lg shadow-amber-200/50 ring-2 ring-amber-400 z-30'
                          : `${course.color} shadow-sm hover:shadow-md z-10 hover:z-20 hover:brightness-105`}`}
                      style={{
                        top: top + GAP,
                        height: height - GAP * 2,
                        left: `calc(${(col / totalCols) * 100}% + ${GAP}px)`,
                        width: `calc(${(1 / totalCols) * 100}% - ${GAP * 2}px)`,
                      }}
                    >
                      <div className="p-2 flex flex-col h-full min-h-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap ${isSelected ? 'bg-amber-400/80 text-white' : 'bg-white/60 text-current backdrop-blur-sm'}`}>
                            {fmtTime(course.time)}–{endStr}
                          </span>
                          {isSelected && (
                            <div className="shrink-0 bg-amber-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <p className="font-bold text-[11px] leading-tight line-clamp-3 flex-1">{course.title}</p>

                        {height >= 80 && course.teachers && (
                          <p className="text-[9px] opacity-55 mt-1 leading-tight truncate">{course.teachers}</p>
                        )}
                      </div>

                      {!isSelected && (
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}