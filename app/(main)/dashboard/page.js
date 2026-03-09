// app/(main)/dashboard/page.js
// Dashboard "Espace Famille" (sans outils admin)

'use client';

import Link from 'next/link';

export default function Dashboard() {
  const user = {
    firstname: 'Lando',
    lastname: 'MORRITZ',
    avatar: 'L',
  };

  const menuItems = [
    {
      title: "Nouvelle inscription",
      desc: "Inscrire un membre à un cours",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-pink-400 to-rose-400",
      href: "/dashboard/courses",
    },
    {
      title: "Mes inscriptions",
      desc: "Voir les cours validés",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-purple-400 to-indigo-400",
      href: "/dashboard/inscriptions",
    },
    {
      title: "Mes enfants",
      desc: "Gérer ma famille",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-blue-400 to-cyan-400",
      href: "/dashboard/family",
    },
    {
      title: "Mes informations",
      desc: "Mon profil",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      bg: "bg-linear-to-r from-emerald-400 to-teal-400",
      href: "/dashboard/profile",
    },
  ];

  const CardGrid = ({ items }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      {items.map((item, index) => (
        <Link
          href={item.href}
          key={index}
          className="glass-panel p-6 rounded-2xl flex items-center gap-5 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group cursor-pointer border border-white/60"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300 ${item.bg}`}>
            {item.icon}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-700 group-hover:text-[#7b68ee] transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </div>

          <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2.5 group-hover:translate-x-0 transition-all duration-300 text-[#7b68ee]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Bonjour, {user.firstname} {user.lastname}
        </h1>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-300/50 pb-2 inline-block">
          Mon Espace Famille
        </h2>
        <CardGrid items={menuItems} />
      </div>
    </div>
  );
}
