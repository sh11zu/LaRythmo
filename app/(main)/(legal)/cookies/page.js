// app/(main)/(legal)/cookies/page.js
// Page "Cookies" - Politique de cookies de l'association

'use client';

import Link from 'next/link';

export default function CookiesPage() {

  const SECTIONS = [
    {
      titre: "Traceurs strictement nécessaires",
      contenu: "Le site utilise des traceurs strictement nécessaires au fonctionnement et à la sécurisation du service (ex. gestion de session, authentification, protection des formulaires). Ces traceurs, lorsqu’ils sont indispensables au service expressément demandé, sont dispensés de consentement, sous réserve de respecter les conditions applicables."
    },
    {
      titre: "Services tiers et sécurité",
      contenu: "Lorsque des services tiers sont activés (notamment reCAPTCHA), des traceurs peuvent être déposés/consultés par ces tiers à des fins de sécurité et de prévention des abus. Les informations relatives aux finalités et aux destinataires sont accessibles dans la présente politique et via les paramètres de confidentialité des services concernés."
    },
    {
      titre: "Publicité",
      contenu: "Aucun cookie publicitaire n’est déployé."
    }
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      
      {/* Header simple */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee] transition-colors font-medium text-sm mb-4 inline-block">
            ← Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Politique de Cookies
        </h1>
      </div>

      {/* Contenu unique */}
      <section className="glass-panel rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-8 shadow-lg">
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          
          {SECTIONS.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                {section.titre}
              </h3>
              <p className="text-justify">
                {section.contenu}
              </p>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}