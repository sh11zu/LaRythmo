'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Rend ses children directement dans document.body via un portail React.
 * - Corrige le problème de centrage quand la page est scrollée
 * - Bloque le scroll de la page tant que le modal est ouvert
 */
export default function ModalPortal({ children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
