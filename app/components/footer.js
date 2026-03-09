// app/components/footer.js
// Footer minimal : bandeau bas + liens vers /notices avec ancres

'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // min-h-[5rem] = 80px = h-20 (comme le header)
    // flex items-center : pour centrer verticalement le texte comme dans le header
    <footer className="w-full border-t border-white/40 bg-white/30 backdrop-blur-xl px-6 md:px-12 min-h-20 flex items-center mt-auto">
      
      {/* Conteneur interne qui prend toute la largeur */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 md:py-0">
        
        {/* GAUCHE : Copyright avec style Marque */}
        <div className="text-sm text-gray-600">
          © {year} <span className="font-extrabold bg-linear-to-r from-[#7b68ee] to-[#ff69b4] bg-clip-text text-transparent">LA RYTHMO</span>. Tous droits réservés.
        </div>

        {/* DROITE : Navigation épurée */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-medium text-gray-500">
          <Link 
            href="/legal-notice" 
            className="hover:text-[#7b68ee] transition-colors duration-200"
          >
            Mentions légales
          </Link>
          <Link 
            href="/privacy-policy" 
            className="hover:text-[#7b68ee] transition-colors duration-200"
          >
            Confidentialité
          </Link>
          <Link 
            href="/terms-of-service" 
            className="hover:text-[#7b68ee] transition-colors duration-200"
          >
            CGU
          </Link>
          <Link 
            href="/cookies" 
            className="hover:text-[#7b68ee] transition-colors duration-200"
          >
            Cookies
          </Link>
          <Link 
            href="/contact" 
            className="hover:text-[#7b68ee] transition-colors duration-200"
          >
            Contact
          </Link>
        </div>
        
      </div>
    </footer>
  );
}