// app/(main)/(legal)/legal-notice/page.js
// Page "Mentions légales" (informations légales de l'association, RGPD, CGV, cookies)

'use client';

import Link from 'next/link';

export default function LegalNoticePage() {
  
  // --- DONNÉES STRICTEMENT BASÉES SUR VOTRE TEXTE ---

  const EDITEUR = {
    titre: "Éditeur du site",
    nom: "LA RYTHMO (Association déclarée)",
    adresse: "Maison des Associations, Place Léon Michaud, 13310 Saint-Martin-de-Crau, France",
    details: [
      "SIREN : 403 669 104",
      "SIRET (siège) : 403 669 104 00032",
      "N° TVA intracommunautaire : FR57403669104",
      "Inscrite au RNA : W132002357",
      "Code APE/NAF : 93.12Z (Activités de clubs de sports)"
    ],
    contact: [
      "Email : bureaugr-rythmo@outlook.fr",
      "Téléphone : 06 03 09 06 37 / 06 89 74 64 02"
    ]
  };

  const DIRECTEUR = {
    titre: "Directeur de la publication",
    nom: "Chantal MASNEUF",
    role: "Présidente de l’association LA RYTHMO"
  };

  const HEBERGEUR = {
    titre: "Hébergeur",
    nom: "OVH SAS (OVHCLOUD)",
    adresse: "2 rue Kellermann, 59100 Roubaix, France",
    details: [
      "SIREN : 424 761 419",
      "SIRET (siège) : 42476141900045",
      "N° TVA intracommunautaire : FR22424761419",
      "RCS Lille Métropole 424 761 419",
      "Code APE/NAF : 63.11Z (Traitement de données, hébergement et activités connexes)"
    ]
  };

  const CONCEPTION = {
    titre: "Conception, développement et maintenance de la plateforme",
    nom: "ISOverflow (Entrepreneur individuel – micro-entreprise)",
    adresse: "90 impasse Saint-Martin, 13270 Fos-sur-Mer, France",
    details: [
      "SIREN : 993 230 028",
      "SIRET (siège) : 99323002800017",
      "TVA : Franchise en base (TVA non applicable, art. 293 B du CGI)",
      "Immatriculé au RNE (INPI)",
      "Code APE/NAF : 62.01Z (Programmation informatique)"
    ]
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      
      {/* Header simple */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-[#7b68ee] transition-colors font-medium text-sm mb-4 inline-block">
            ← Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Mentions légales
        </h1>
      </div>

      {/* Contenu unique */}
      <section className="glass-panel rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-8 shadow-lg">
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

          {/* 1. ÉDITEUR */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{EDITEUR.titre}</h3>
            <p className="font-bold text-base">{EDITEUR.nom}</p>
            <p className="mb-2">{EDITEUR.adresse}</p>
            {EDITEUR.details.map((item, i) => (
              <p key={i} className="text-gray-600">{item}</p>
            ))}
            <div className="mt-3 font-medium text-[#7b68ee]">
              {EDITEUR.contact.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          </div>

          {/* 2. DIRECTEUR */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{DIRECTEUR.titre}</h3>
            <p className="font-bold">{DIRECTEUR.nom}, {DIRECTEUR.role}</p>
          </div>

          {/* 3. HÉBERGEUR */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{HEBERGEUR.titre}</h3>
            <p className="font-bold">{HEBERGEUR.nom}</p>
            <p className="mb-2">{HEBERGEUR.adresse}</p>
            {HEBERGEUR.details.map((item, i) => (
              <p key={i} className="text-gray-600">{item}</p>
            ))}
          </div>

          {/* 4. CONCEPTION */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{CONCEPTION.titre}</h3>
            <p className="font-bold">{CONCEPTION.nom}</p>
            <p className="mb-2">{CONCEPTION.adresse}</p>
            {CONCEPTION.details.map((item, i) => (
              <p key={i} className="text-gray-600">{item}</p>
            ))}
          </div>

          {/* 5. PROPRIÉTÉ INTELLECTUELLE */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Propriété intellectuelle</h3>
            <p className="text-justify">
              Sauf indication contraire, l’ensemble des éléments accessibles sur le site (textes, visuels, logos, documents, base de données, charte graphique, éléments logiciels) est protégé par le droit de la propriété intellectuelle et demeure la propriété de l’association LA RYTHMO ou de ses partenaires, ou fait l’objet d’une autorisation d’utilisation. Toute reproduction, représentation, adaptation, modification, extraction ou réutilisation, totale ou partielle, par quelque procédé que ce soit, sans autorisation préalable écrite, est interdite.
            </p>
          </div>

          {/* 6. RESPONSABILITÉ */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Responsabilité</h3>
            <p className="text-justify">
              L’association LA RYTHMO met en œuvre les moyens raisonnables pour assurer l’exactitude et la mise à jour des informations diffusées sur le site. Elle se réserve le droit de corriger, modifier ou supprimer tout contenu à tout moment, sans préavis. L’accès au site peut être temporairement interrompu pour maintenance, mise à jour, ou en cas d’incident technique. L’association ne saurait être tenue responsable des dommages directs ou indirects résultant de l’accès ou de l’utilisation du site, notamment en cas d’interruption, d’indisponibilité, de dysfonctionnement, d’erreur ou d’omission.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}