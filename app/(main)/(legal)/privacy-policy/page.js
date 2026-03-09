// app/(main)/(legal)/privacy-policy/page.js
// Page "Politique de confidentialité" (informations sur la collecte et l'utilisation des données personnelles)

'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {

  const SECTIONS = [
    {
      titre: "1. Responsable de traitement",
      contenu: "Le responsable de traitement est LA RYTHMO (association déclarée), Maison des Associations, Place Léon Michaud, 13310 Saint-Martin-de-Crau, France.",
      contact: "Contact (demandes RGPD) : bureaugr-rythmo@outlook.fr"
    },
    {
      titre: "2. Description du service",
      contenu: "Le site fournit une plateforme d’inscription et de gestion administrative des adhésions/cours (formules, affectation aux cours, communications), sans paiement en ligne. Les règlements sont effectués directement auprès de l’association (chèque, virement, espèces)."
    },
    {
      titre: "3. Données traitées",
      contenu: "Dans le cadre de la création de compte, de l’inscription, de la gestion des adhésions et des cours, l’association est susceptible de traiter les catégories de données suivantes :",
      list: [
        "Données d’identification et de contact : nom, prénom, sexe, adresse postale, email, téléphone.",
        "Mineurs et représentants légaux : nom, prénom, adresse, email et téléphone du/des représentant(s) légal(aux).",
        "Contact d’urgence : identité et coordonnées du contact d’urgence (si différent du/des représentant(s) légal(aux)).",
        "Données liées à l’inscription et à l’activité : Formule/adhésion choisie, cours/discipline, créneaux, affectations, historique d’inscription, le cas échéant présences/absences.",
        "Photographies : Photo de profil et/ou photographies déposées dans le cadre administratif.",
        "Documents : autorisations parentales, contrats, formulaires internes, justificatifs administratifs ; attestations sur l’honneur/attestations administratives liées à l’aptitude à la pratique sportive (le cas échéant) ; certificat médical uniquement lorsque requis ; pièce d’identité uniquement le cas échéant, si demandée.",
        "Données techniques et de sécurité : identifiant de compte, rôle, habilitations, journaux techniques (horodatages, logs d’accès, adresse IP selon configuration)."
      ]
    },
    {
      titre: "4. Finalités",
      contenu: "Les données sont traitées pour :",
      list: [
        "Créer et administrer les comptes (adhérents, représentants légaux, administrateurs).",
        "Gérer les inscriptions, les formules et l’affectation aux cours/discipline/créneaux.",
        "Gérer les documents administratifs nécessaires à l’inscription et à la participation.",
        "Envoyer des communications automatisées liées au service (confirmations, informations d’organisation).",
        "Assurer la sécurité du service, prévenir les abus, et fournir l’assistance technique."
      ]
    },
    {
      titre: "5. Bases légales",
      contenu: "Selon la finalité, les traitements reposent sur :",
      list: [
        "Exécution d’un contrat / mesures précontractuelles : gestion du compte et de l’inscription, affectations aux cours, communications de service.",
        "Intérêt légitime : sécurité, prévention des abus, administration technique et support.",
        "Obligation légale : conservation de certaines pièces justificatives comptables et documents requis.",
        "Consentement : notamment pour l’utilisation de certaines photographies et données particulières.",
        "Données de santé (certificat médical) : traitées uniquement lorsque requises pour l’inscription ou la participation aux activités, dans le respect des exigences applicables et avec des mesures de protection renforcées. Les documents de santé sont limités au strict nécessaire."
      ]
    },
    {
      titre: "6. Destinataires",
      contenu: "Dans la limite de leurs attributions, les données sont accessibles :",
      list: [
        "Aux personnes habilitées de l’association (présidence, trésorerie, secrétariat, encadrants/administrateurs selon rôles).",
        "Au prestataire technique (micro-entreprise) agissant en qualité de sous-traitant (maintenance et support).",
        "À l’hébergeur OVH SAS pour l’hébergement du VPS et des infrastructures associées."
      ]
    },
    {
      titre: "7. Sous-traitants et services tiers",
      contenu: "Certains services tiers peuvent impliquer des transferts hors UE (encadrés par des clauses contractuelles types).",
      list: [
        "Hébergement VPS et bases de données : OVH (France, Gravelines).",
        "Ressources web : Google Fonts (si activé).",
        "Protection anti-spam : reCAPTCHA (si activé).",
        "Réseaux sociaux : liens vers Instagram, Facebook, TikTok (responsables distincts lors de la consultation)."
      ]
    },
    {
      titre: "8. Hébergement",
      contenu: "Les données applicatives sont hébergées sur un VPS localisé à Gravelines (France), avec base de données MariaDB, auprès d’OVHcloud."
    },
    {
      titre: "9. Durées de conservation",
      contenu: "Les données ne sont pas conservées au-delà de ce qui est nécessaire. Une politique de conservation est appliquée :",
      list: [
        "Adhérents / comptes : Pendant la durée de l’adhésion. À l’issue, conservation pendant 3 ans maximum, puis suppression/anonymisation (sauf obligation légale).",
        "Pièces et justificatifs comptables : 10 ans lorsqu’applicable.",
        "Documents administratifs (autorisations, certificats, contrats) : Conservation limitée à la saison sportive (archivage restreint ensuite si nécessaire), puis suppression.",
        "Logs techniques / sécurité : Conservation limitée et proportionnée, typiquement 12 mois."
      ]
    },
    {
      titre: "10. Sécurité",
      contenu: "Mesures mises en œuvre : contrôle d’accès par rôles, comptes administrateurs nominativement attribués, journalisation des accès/actions sensibles, sauvegardes, mises à jour de sécurité, chiffrement des échanges (HTTPS), principe de minimisation des accès, et procédures de gestion d’incident."
    },
    {
      titre: "11. Droits des personnes",
      contenu: "Vous disposez des droits d’accès, rectification, effacement, limitation, opposition, et portabilité lorsque applicable. Vous pouvez introduire une réclamation auprès de la CNIL.",
      contact: "Les demandes s’exercent à : bureaugr-rythmo@outlook.fr"
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
          Politique de confidentialité
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
              
              <p className="text-justify mb-2">
                {section.contenu}
              </p>

              {/* Affichage des listes si présentes */}
              {section.list && (
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                  {section.list.map((item, i) => (
                    <li key={i} className="pl-1">
                      <span className="align-top">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Affichage du contact spécifique si présent */}
              {section.contact && (
                <p className="mt-2 font-medium text-[#7b68ee]">
                  {section.contact}
                </p>
              )}
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}