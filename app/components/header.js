// app/components/header.js
// Navbar avec toggle "user/admin" + gear settings + déconnexion

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function onClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const firstname   = user?.first_name ?? '';
  const lastname    = user?.last_name ?? '';
  const avatar      = firstname && lastname ? `${firstname[0]}${lastname[0]}` : '?';
  const isAdmin     = pathname?.startsWith('/admin');
  const userActive  = !isAdmin;
  const isAdminRole = user?.role === 'ADMIN' || user?.role === 'SYS_ADMIN';

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 glass-panel border-b border-white/40 z-50 px-6 md:px-12 flex justify-between items-center shadow-sm backdrop-blur-md">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="text-2xl font-bold bg-linear-to-r from-[#7b68ee] to-[#ff69b4] bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
        >
          LA RYTHMO
        </Link>
      </div>

      {/* Zone Droite */}
      <div className="flex items-center gap-4">

        {/* Avatar + nom + gear settings */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-700 leading-tight">{lastname}</p>
            <p className="text-xs text-gray-500 font-medium">{firstname}</p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#7b68ee] to-[#ff69b4] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50">
            {avatar}
          </div>

          {/* Roue crantée + dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              title="Paramètres"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                settingsOpen
                  ? 'bg-[#7b68ee] text-white border-[#7b68ee] shadow-md'
                  : 'bg-white/40 text-gray-500 border-white/60 hover:bg-white/70 hover:text-[#7b68ee]'
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${settingsOpen ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Dropdown avec animation */}
            <div
              className={`absolute right-0 top-[calc(100%+8px)] w-44 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60 overflow-hidden transition-all duration-200 origin-top-right ${
                settingsOpen
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
              }`}
            >
              <Link
                href="/dashboard/profile"
                onClick={() => setSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#7b68ee]/10 hover:text-[#7b68ee] transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon profil
              </Link>
            </div>
          </div>
        </div>

        {/* Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-gray-600 bg-white/40 border border-white/50 shadow-sm hover:bg-red-500 hover:text-white hover:border-red-600 hover:shadow-red-500/40 transition-all duration-300 group cursor-pointer"
        >
          <span>Déconnexion</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

      </div>
    </nav>
  );
}
