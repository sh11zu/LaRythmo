// app/(main)/dashboard/courses/PlanningGrid.js
// Composant de planning pour afficher les cours dans une grille horaire

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

export default function PlanningGrid({ courses, packages, childrenList }) {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedChild, setSelectedChild] = useState(childrenList?.[0]?.id || '');
  const [showCompetition, setShowCompetition] = useState(true);

  const DAYS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // 1. Filtrer les cours selon le toggle
  const visibleCourses = useMemo(() => {
    return courses.filter(c => showCompetition ? true : c.wl === 0);
  }, [courses, showCompetition]);

  // 2. Déduire les jours actifs en fonction des cours visibles
  const activeDays = DAYS_ORDER.filter(day => visibleCourses.some(c => c.day === day));

  const { minMinutes, gridHeight, hourLines } = useMemo(() => {
    if (visibleCourses.length === 0) return { minMinutes: 0, gridHeight: 0, hourLines: [] };
    
    const starts = visibleCourses.map(c => toMin(c.time));
    const ends = visibleCourses.map(c => toMin(c.time) + c.duration);
    const min = Math.floor(Math.min(...starts) / 60) * 60;
    const max = Math.ceil(Math.max(...ends) / 60) * 60;
    
    const height = ((max - min) / 60) * PX_PER_HOUR + PAD_TOP + PAD_BOTTOM;
    const lines = [];
    for (let t = min; t <= max; t += 60) {
      lines.push({ key: t, top: PAD_TOP + ((t - min) / 60) * PX_PER_HOUR });
    }
    return { minMinutes: min, gridHeight: height, hourLines: lines };
  }, [visibleCourses]);

  const dayLayouts = useMemo(() => {
    const map = {};
    for (const day of activeDays) {
      map[day] = computeLayout(visibleCourses.filter(c => c.day === day));
    }
    return map;
  }, [visibleCourses, activeDays]);

  // NOUVEAU : Logique de désactivation (horaires + règles wl)
  const disabledCourseIds = useMemo(() => {
    const disabled = new Set();
    const selected = courses.filter(c => selectedCourses.includes(c.id));

    const hasWl1 = selected.some(c => c.wl === 1);
    const hasWl2 = selected.some(c => c.wl === 2);

    for (const course of courses) {
      if (selectedCourses.includes(course.id)) continue;

      // Règle 1 : Conflit WL (1 vs 2)
      if (hasWl1 && course.wl === 2) {
        disabled.add(course.id);
        continue;
      }
      if (hasWl2 && course.wl === 1) {
        disabled.add(course.id);
        continue;
      }

      // Règle 2 : Chevauchement d'horaires
      const cStart = toMin(course.time);
      const cEnd = cStart + course.duration;

      for (const sCourse of selected) {
        if (course.day === sCourse.day) {
          const sStart = toMin(sCourse.time);
          const sEnd = sStart + sCourse.duration;

          // Condition de chevauchement (Overlap)
          if (cStart < sEnd && cEnd > sStart) {
            disabled.add(course.id);
            break; 
          }
        }
      }
    }
    return disabled;
  }, [courses, selectedCourses]);

  const toggleCourse = (id) => {
    if (disabledCourseIds.has(id) && !selectedCourses.includes(id)) return;
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // 3. Calcul du prix et du récapitulatif
  const recap = useMemo(() => {
    const selected = courses.filter(c => selectedCourses.includes(c.id));
    const count = selected.length;
    
    if (count === 0) return { selected, count, bestPrice: 0, formulaName: "Aucun cours sélectionné" };

    let bestPrice = selected.reduce((sum, c) => sum + (c.singlePrice || 0), 0);
    let formulaName = "Tarif à la carte";

    if (packages && packages.length > 0) {
      for (const pkg of packages) {
        if (selectedCourses.length < pkg.slots.length) continue;

        let unassignedCourses = [...selectedCourses];
        let matchedSlots = 0;

        for (const allowedCourseIds of pkg.slots) {
          const matchIdx = unassignedCourses.findIndex(id => allowedCourseIds.includes(id));
          if (matchIdx !== -1) {
            unassignedCourses.splice(matchIdx, 1);
            matchedSlots++;
          }
        }

        if (matchedSlots === pkg.slots.length) {
          let currentPrice = pkg.price;
          currentPrice += unassignedCourses.reduce((sum, id) => {
            const course = courses.find(c => c.id === id);
            return sum + (course ? course.singlePrice : 0);
          }, 0);

          if (currentPrice < bestPrice) {
            bestPrice = currentPrice;
            formulaName = pkg.name + (unassignedCourses.length > 0 ? " + À la carte" : "");
          }
        }
      }
    }

    return { selected, count, bestPrice, formulaName };
  }, [selectedCourses, courses, packages]);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-gray-50/50">
      
      {/* --- PANNEAU GAUCHE (20%) --- */}
      <div className="w-[20%] min-w-70 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto shadow-sm z-10">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#7b68ee] font-medium transition-colors mb-4 inline-block">
            ← Retour
          </Link>
          <h2 className="text-xl font-bold text-gray-800">Inscription</h2>
        </div>

        {/* Sélection de l'enfant */}
        <div className="flex flex-col gap-2">
          <label htmlFor="child-select" className="text-sm font-bold text-gray-700">
            Inscrire mon enfant :
          </label>
          <select 
            id="child-select"
            value={selectedChild} 
            onChange={(e) => setSelectedChild(e.target.value)}
            className="p-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/50 focus:border-[#7b68ee] transition-all"
          >
            {childrenList?.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        {/* Toggle Cours Compétition + Message */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Cours Compétition</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showCompetition}
                onChange={() => setShowCompetition(!showCompetition)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7b68ee]"></div>
            </label>
          </div>
          
          {/* Message d'avertissement affiché uniquement si la compétition est activée */}
          {showCompetition && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-2 shadow-sm">
              <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-orange-800 leading-snug font-medium">
                Toute inscription incluant un cours de compétition devra être étudiée et validée par le club.
              </p>
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Récapitulatif et Tarification */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 className="text-sm font-bold text-gray-700">Récapitulatif</h3>
          
          <div className="flex-1 overflow-y-auto pr-1">
            {recap.count === 0 ? (
              <p className="text-xs text-gray-400 italic">Cliquez sur un cours du planning pour l'ajouter.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recap.selected.map(c => (
                  <li key={c.id} className="text-xs p-2 rounded-lg bg-indigo-50 border border-indigo-100 flex justify-between items-center group">
                    <span className="font-medium text-indigo-900 truncate pr-2">{c.title}</span>
                    <button 
                      onClick={() => toggleCourse(c.id)}
                      className="text-indigo-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-800 text-white p-4 rounded-xl shadow-md mt-auto">
            <p className="text-xs text-gray-400 mb-1">{recap.formulaName}</p>
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium">Total estimé</span>
              <span className="text-2xl font-bold text-[#a78bfa]">{recap.bestPrice.toFixed(2)}€</span>
            </div>
            <button 
              disabled={recap.count === 0}
              className="mt-4 w-full py-2.5 rounded-lg bg-linear-to-r from-[#7b68ee] to-[#a78bfa] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Valider l'inscription
            </button>
          </div>
        </div>
      </div>

      {/* --- PLANNING (80%) --- */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-5 md:p-8">
          <div className="flex gap-3">
            {activeDays.length > 0 ? activeDays.map((day) => (
              <div key={day} className="flex-1 min-w-35 flex flex-col gap-2">
                {/* En-tête du jour */}
                <div className="h-10 flex items-center justify-center rounded-2xl text-sm font-bold text-gray-700 bg-white/80 border border-white/70 shadow-sm backdrop-blur-sm">
                  {day}
                </div>

                {/* Grille */}
                <div className="relative rounded-2xl bg-white/15 border border-white/30" style={{ height: gridHeight }}>
                  {hourLines.map(l => (
                    <div
                      key={l.key}
                      className="absolute inset-x-0 border-t border-dashed border-gray-300/30"
                      style={{ top: l.top }}
                    />
                  ))}

                  {dayLayouts[day].map(({ course, col, totalCols }) => {
                    const top = PAD_TOP + ((toMin(course.time) - minMinutes) / 60) * PX_PER_HOUR;
                    const height = (course.duration / 60) * PX_PER_HOUR;
                    const endMin = toMin(course.time) + course.duration;
                    const endStr = fmtTime(`${Math.floor(endMin / 60)}:${endMin % 60}`);
                    
                    const isSelected = selectedCourses.includes(course.id);
                    const isDisabled = disabledCourseIds.has(course.id);
                    
                    const GAP = 3;

                    return (
                      <div
                        key={course.id}
                        onClick={() => toggleCourse(course.id)}
                        className={`absolute rounded-xl border overflow-hidden flex flex-col transition-all duration-200 group
                          ${isDisabled 
                            ? 'opacity-40 grayscale cursor-not-allowed bg-gray-100 border-gray-300' 
                            : isSelected
                              ? 'bg-linear-to-br from-amber-50 to-amber-100 border-amber-300 shadow-lg shadow-amber-200/50 ring-2 ring-amber-400 z-30 cursor-pointer'
                              : `${course.color} shadow-sm hover:shadow-md z-10 hover:z-20 hover:brightness-105 cursor-pointer`}`}
                        style={{
                          top: top + GAP,
                          height: height - GAP * 2,
                          left: `calc(${(col / totalCols) * 100}% + ${GAP}px)`,
                          width: `calc(${(1 / totalCols) * 100}% - ${GAP * 2}px)`,
                        }}
                      >
                        <div className="p-2 flex flex-col h-full min-h-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap 
                              ${isSelected ? 'bg-amber-400/80 text-white' : 'bg-white/60 text-current backdrop-blur-sm'}`}>
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
                            <p className="text-[9px] mt-1 leading-tight truncate 
                              ${isDisabled ? 'opacity-40' : 'opacity-55'}">
                              {course.teachers}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center h-64 text-gray-400 italic">
                Aucun cours ne correspond à vos filtres.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}