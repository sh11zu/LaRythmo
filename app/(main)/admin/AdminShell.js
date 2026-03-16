'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageTransition from '@/app/components/transition';

const NAV_SECTIONS = [
  {
    label: 'Espace personnel',
    items: [
      {
        label: 'Nouvelle inscription',
        href: '/dashboard/courses',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
      },
      {
        label: 'Mes inscriptions',
        href: '/dashboard/inscriptions',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      },
      {
        label: 'Mes enfants',
        href: '/dashboard/family',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Tableau de bord',
        href: '/admin',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      },
      {
        label: 'Inscriptions',
        href: '/admin/inscriptions',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      },
      {
        label: 'Cours et forfaits',
        href: '/admin/courses',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      },
      {
        label: 'Adhérents',
        href: '/admin/students',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      },
    ],
  },
];

const NAV_SYSADMIN = {
  label: 'Système',
  items: [
    {
      label: 'Utilisateurs',
      href: '/admin/users',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884.95 2 2 2 2.05 0 2-1.116 2-2" /></svg>,
    },
  ],
};

function AdminSidebar({ isSysAdmin, collapsed, onToggle }) {
  const pathname = usePathname();
  const sections = isSysAdmin ? [...NAV_SECTIONS, NAV_SYSADMIN] : NAV_SECTIONS;

  return (
    <aside className="sticky top-0 h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/60 shrink-0">
        {!collapsed && (
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Menu</span>
        )}
        <button
          onClick={onToggle}
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#7b68ee] hover:bg-[#7b68ee]/10 transition-colors ${collapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-[#7b68ee]/10 text-[#7b68ee]'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function AdminShell({ isSysAdmin, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Colonne visuelle full-height — background et border s'étendent jusqu'au footer */}
      <div className={`shrink-0 self-stretch border-r border-white/60 bg-white/40 backdrop-blur-sm transition-all duration-300 ${collapsed ? 'w-14' : 'w-56'}`}>
        <AdminSidebar
          isSysAdmin={isSysAdmin}
          collapsed={collapsed}
          onToggle={() => setCollapsed(o => !o)}
        />
      </div>
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </div>
  );
}

