// app/(main)/dashboard/courses/page.js
// Page affichant le planning des cours disponibles, avec possibilité de sélectionner des cours pour inscription

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function Planning() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const pxPerHour = 110;
  const gridPadTop = 16;
  const gridPadBottom = 16;

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const getProf = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('coupe') || t.includes('fédérale') || t.includes('federale')) {
      return 'Emma DUFOUR, Marie-Laure DUFOUR';
    }
    return 'Emma DUFOUR';
  };

  const courses = [
    { id: 1, day: 'Lundi', time: '17:30', duration: 75, title: 'Loisir GR TC 7 ans et +', color: 'bg-teal-100 text-teal-800 border-teal-300' },

    { id: 2, day: 'Mardi', time: '17:30', duration: 75, title: "Modern'Jazz Enfant", color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 3, day: 'Mardi', time: '18:45', duration: 75, title: "Modern'Jazz Ado", color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },

    { id: 4, day: 'Mercredi', time: '09:45', duration: 75, title: 'Initiation GR1 6-8 ans', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { id: 5, day: 'Mercredi', time: '11:00', duration: 75, title: 'Initiation GR2 7-9 ans', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { id: 6, day: 'Mercredi', time: '13:15', duration: 120, title: 'Pré-Fédérale 6-10 ans', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { id: 7, day: 'Mercredi', time: '15:15', duration: 195, title: 'Fédérale Mercredi', color: 'bg-orange-100 text-orange-800 border-orange-300' },

    { id: 8, day: 'Jeudi', time: '13:15', duration: 120, title: 'Coupe de Provence Mercredi', color: 'bg-pink-100 text-pink-800 border-pink-300' },
    { id: 9, day: 'Jeudi', time: '17:45', duration: 75, title: 'Gym Esthétique 1', color: 'bg-red-100 text-red-800 border-red-300' },
    { id: 10, day: 'Jeudi', time: '19:00', duration: 75, title: 'Gym Esthétique 2 ou Danse', color: 'bg-red-100 text-red-800 border-red-300' },

    { id: 11, day: 'Samedi', time: '10:15', duration: 45, title: 'Éveil Parents/Enfants 2-4 ans', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    { id: 12, day: 'Samedi', time: '11:00', duration: 60, title: 'Baby Gym 3-5 ans', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 13, day: 'Samedi', time: '13:30', duration: 120, title: 'Coupe de Provence Samedi', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { id: 14, day: 'Samedi', time: '15:30', duration: 150, title: 'Fédérale Samedi (13h30)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  ].map(c => ({ ...c, prof: getProf(c.title) }));

  const { minMinutes, gridHeight, hourLines } = useMemo(() => {
    const starts = courses.map(c => toMinutes(c.time));
    const ends = courses.map(c => toMinutes(c.time) + c.duration);

    const min = Math.min(...starts);
    const max = Math.max(...ends);

    const totalMinutes = max - min;
    const height = (totalMinutes / 60) * pxPerHour + gridPadTop + gridPadBottom;

    const firstHour = Math.ceil(min / 60) * 60;
    const lines = [];
    for (let t = firstHour; t <= max; t += 60) {
      const offsetPx = gridPadTop + ((t - min) / 60) * pxPerHour;
      lines.push({ key: t, top: `${offsetPx}px` });
    }

    return { minMinutes: min, gridHeight: height, hourLines: lines };
  }, [courses]);

  const getPosition = (time, durationMinutes = 60) => {
    const start = toMinutes(time);
    const top = gridPadTop + ((start - minMinutes) / 60) * pxPerHour;
    const height = (durationMinutes / 60) * pxPerHour;
    return { top: `${top}px`, height: `${height}px` };
  };

  const activeDays = days.filter(day => courses.some(c => c.day === day));

  const toggleCourse = (id) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden">
      {/* WRAPPER FLEX: planning + panel */}
      <div className="relative flex h-full w-full overflow-hidden min-h-0 items-stretch">

        {/* --- ZONE GAUCHE : PLANNING --- */}
        <div className="flex-1 min-h-0 overflow-auto p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee]">← Retour</Link>
            <h1 className="text-3xl font-bold text-gray-800">Planning des cours</h1>
          </div>

          {/* ✅ min-width valide */}
          <div className="flex gap-4 min-w-275 pb-20">
            {activeDays.map((day) => (
              <div key={day} className="flex-1 min-w-45 flex flex-col gap-3">

                <div className="glass-panel h-12 flex items-center justify-center text-center rounded-xl font-bold text-gray-700 border border-white/60 bg-white/60 shadow-sm">
                  {day}
                </div>

                <div
                  className="relative bg-white/30 rounded-xl border border-white/40 shadow-inner"
                  style={{ height: `${gridHeight}px` }}
                >
                  {hourLines.map(l => (
                    <div
                      key={l.key}
                      className="absolute w-full border-t border-gray-500/10"
                      style={{ top: l.top }}
                    />
                  ))}

                  {courses.filter(c => c.day === day).map(course => {
                    const { top, height } = getPosition(course.time, course.duration);
                    const isSelected = selectedCourses.includes(course.id);

                    const [startH, startM] = course.time.split(':').map(Number);
                    const endDate = new Date(0, 0, 0, startH, startM + course.duration);
                    const endTime = endDate
                      .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      .replace(':', 'h');

                    return (
                      <div
                        key={course.id}
                        onClick={() => toggleCourse(course.id)}
                        className={`absolute left-0 right-0 mx-1 p-2 rounded-md border cursor-pointer flex flex-col justify-center transition-all duration-300 ease-out group overflow-hidden
                          ${isSelected
                            ? 'bg-linear-to-br from-amber-50 via-amber-100 to-amber-200 border-amber-300 shadow-[0_8px_20px_-6px_rgba(245,158,11,0.5)] scale-[1.03] z-50 text-amber-900 ring-1 ring-amber-400'
                            : `${course.color} bg-opacity-90 backdrop-blur-sm border-white/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:brightness-105 z-10 hover:z-40`
                          }
                        `}
                        style={{ top, height, minHeight: '72px' }}
                      >
                        {!isSelected && (
                          <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none transform -translate-x-full group-hover:translate-x-full" />
                        )}

                        <div className="flex justify-between items-start leading-none mb-1 relative z-10">
                          <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm transition-colors duration-300 ${isSelected ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-white/60 text-current backdrop-blur-md'}`}>
                            {course.time} - {endTime}
                          </span>

                          {isSelected && (
                            <div className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          )}
                        </div>

                        <p className="font-bold text-xs leading-tight line-clamp-2 relative z-10">{course.title}</p>
                        <p className="text-[10px] font-semibold opacity-70 mt-0.5 relative z-10">{course.prof}</p>

                        {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400/50" />}
                      </div>
                    );
                  })}
                </div>

                <div className="glass-panel p-3 text-center rounded-xl font-bold text-gray-700 border border-white/60 bg-white/55 shadow-sm mt-auto">
                  {day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- BOUTON TOGGLE FIXE --- */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-50 w-10 h-20 bg-white text-[#7b68ee] rounded-l-xl flex items-center justify-center shadow-2xl border border-r-0 border-gray-200 hover:bg-gray-50 transition-all duration-300 ease-in-out
            ${isPanelOpen ? 'right-96' : 'right-0'}
          `}
          title={isPanelOpen ? "Masquer" : "Afficher"}
        >
          {isPanelOpen ? '→' : '←'}
        </button>

        {/* --- PANEL LATÉRAL --- */}
        <div className={`relative h-full min-h-0 shrink-0 transition-all duration-300 ease-in-out
          border-l border-white/40 shadow-2xl backdrop-blur-xl bg-white/60  
          ${isPanelOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full'}
        `}>
          <div className="p-6 flex flex-col h-full w-96 overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Inscription
            </h2>

            <div className="flex-1 space-y-8">
              <div className="relative pl-6 border-l-2 border-[#7b68ee]/30">
                <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-[#7b68ee]"></div>
                <h3 className="font-bold text-gray-700 mb-1">Sélectionnez vos cours</h3>
                <p className="text-sm text-gray-500">Cliquez sur les cours.</p>
                <div className="mt-2 bg-white/80 p-3 rounded-lg text-sm font-bold text-[#7b68ee] shadow-sm border border-purple-100">
                  {selectedCourses.length} cours sélectionné(s)
                </div>
              </div>

              <div className="relative pl-6 border-l-2 border-[#7b68ee]/30">
                <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-2 border-[#7b68ee]"></div>
                <h3 className="font-bold text-gray-700 mb-1">Validation</h3>
                <p className="text-sm text-gray-500">Calcul auto des tarifs famille & multi-cours.</p>
              </div>

              <div className="relative pl-6 border-l-2 border-transparent">
                <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                <Link href="#" className="text-sm font-bold text-gray-500 hover:text-[#7b68ee] underline decoration-dashed">
                  Voir les tarifs et formules
                </Link>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-200/50">
              <button
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform
                  ${selectedCourses.length > 0
                    ? 'bg-linear-to-r from-[#7b68ee] to-[#ff69b4] hover:scale-[1.02] hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed opacity-70'}
                `}
                disabled={selectedCourses.length === 0}
              >
                Commencer l'inscription
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
