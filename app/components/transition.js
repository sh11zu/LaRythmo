// app/components/transition.js
// Composant de transition pour les pages du dashboard, permettant d'ajouter une animation lors du changement de page

'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

// Compteur module-level : persiste entre les montages/démontages du composant
let mountCounter = 0;

export default function PageTransition({ children }) {
  const pathname = usePathname();
  // Unique par instance de montage, même si Next.js router cache restaure l'état
  const [mountId] = useState(() => ++mountCounter);
  const [animKey, setAnimKey] = useState(`${mountId}-${pathname}`);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setAnimKey(`${mountId}-${pathname}-${Date.now()}`);
    }
  }, [pathname, mountId]);

  return (
    <div key={animKey} className="dash-page-enter h-full w-full min-h-0">
      {children}
    </div>
  );
}
