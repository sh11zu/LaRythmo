// app/components/header.js
// Navbar avec toggle "user/admin" + profil + déconnexion

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const user = {
    firstname: 'Lando',
    lastname: 'MORRITZ',
    avatar: 'LM',
  };

  const isAdmin = pathname?.startsWith('/admin');
  const userActive = !isAdmin;

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
      <div className="flex items-center gap-6">

        {/* Info Utilisateur */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-700 leading-tight">{user.lastname}</p>
            <p className="text-xs text-gray-500 font-medium">{user.firstname}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#7b68ee] to-[#ff69b4] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50 cursor-pointer hover:scale-105 transition-transform">
            {user.avatar}
          </div>
        </div>

        {/* --- TOGGLE ICON ONLY (SLIDING PILL) --- */}
        <div className="relative flex items-center w-24 h-10 p-1 bg-white/40 border border-white/60 rounded-full shadow-inner backdrop-blur-sm">
          
          {/* La Pilule Animée (Background qui bouge) */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-linear-to-r from-[#7b68ee] to-[#ff69b4] shadow-md transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1)
              ${userActive ? 'left-1' : 'left-[calc(50%+2px)]'}
            `}
          />

          {/* Lien User (Gauche) */}
          <Link
            href="/dashboard"
            className={`relative z-10 w-1/2 h-full flex items-center justify-center rounded-full transition-all duration-300
              ${userActive ? 'text-white pr-1' : 'text-gray-400 hover:text-gray-600'}
            `}
            title="Espace Famille"
          >
            <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>

          {/* Lien Admin (Droite) */}
          <Link
            href="/admin"
            className={`relative z-10 w-1/2 h-full flex items-center justify-center rounded-full transition-all duration-300
              ${isAdmin ? 'text-white pl-1' : 'text-gray-400 hover:text-gray-600'}
            `}
            title="Espace Admin"
          >
            <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </Link>
        </div>

        {/* --- BOUTON DECONNEXION (Hover Inversé) --- */}
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-gray-600 bg-white/40 border border-white/50 shadow-sm 
                       hover:bg-red-500 hover:text-white hover:border-red-600 hover:shadow-red-500/40 
                       transition-all duration-300 group"
        >
          <span>Déconnexion</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </Link>

      </div>
    </nav>
  );
}