'use client';

import { useState } from 'react';
import Link from 'next/link';

function Chevron({ open }) {
  return (
    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MenuCard({ title, desc, icon, bg, href }) {
  return (
    <Link href={href}
      className="relative bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 rounded-2xl flex items-center gap-4 hover:bg-white/75 hover:shadow-[0_4px_20px_rgba(123,104,238,0.12)] hover:border-[#7b68ee]/20 transition-all duration-300 group cursor-pointer"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300 shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-gray-700 group-hover:text-[#7b68ee] transition-colors">{title}</h3>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-[#7b68ee] shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-6">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-300/50 w-full text-left group">
        <Chevron open={open} />
        <span className="text-base font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#7b68ee] transition-colors">
          {title}
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl px-1 pt-1 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome({ firstname }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Bonjour, {firstname} !</h1>
      </div>

      <CollapsibleSection title="Espace Inscription">
        <MenuCard
          title="Nouvelle inscription"
          href="/dashboard/courses"
          bg="bg-linear-to-r from-pink-400 to-rose-400"
          icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Espace Suivi">
        <MenuCard
          title="Inscriptions"
          desc="Suivre les dossiers d'inscriptions"
          href="/dashboard/inscriptions"
          bg="bg-linear-to-r from-purple-400 to-indigo-400"
          icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        />
        <MenuCard
          title="Enfants"
          desc="Gérer les informations de mes enfants"
          href="/dashboard/family"
          bg="bg-linear-to-r from-blue-400 to-cyan-400"
          icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
      </CollapsibleSection>
    </div>
  );
}
