// app/components/transition.js
// Composant de transition pour les pages du dashboard, permettant d'ajouter une animation lors du changement de page

'use client';

import { usePathname } from 'next/navigation';

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="dash-page-enter h-full w-full min-h-0">
      {children}
    </div>
  );
}
