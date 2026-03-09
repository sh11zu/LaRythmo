// app/(main)/(legal)/terms-of-service/page.js
// Page "Conditions générales de vente" (CGV) - droits et obligations des utilisateurs et de l'association

'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {

  // --- DONNÉES : ARTICLES CGU ---
  const ARTICLES = [
    {
      titre: "1. Objet",
      contenu: "Les présentes conditions régissent l’accès et l’utilisation de la plateforme d’inscription de l’association LA RYTHMO, ainsi que les modalités de création de compte, de gestion des inscriptions et de dépôt de documents administratifs."
    },
    {
      titre: "2. Accès au service",
      contenu: "L’accès à certaines fonctionnalités nécessite un compte utilisateur. Les comptes représentant des adhérents mineurs sont créés et administrés par leurs parents ou représentants légaux."
    },
    {
      titre: "3. Exactitude des informations",
      contenu: "L’utilisateur s’engage à fournir des informations exactes et à jour. L’association peut demander la mise à jour ou la régularisation de pièces/documentation nécessaires à la participation aux activités."
    },
    {
      titre: "4. Identifiants et sécurité",
      contenu: "Les identifiants sont personnels. Toute utilisation du compte est réputée effectuée par son titulaire, sauf preuve contraire. En cas de suspicion d’accès non autorisé, l’utilisateur doit informer l’association sans délai."
    },
    {
      titre: "5. Inscriptions et organisation des cours",
      contenu: "La plateforme permet l’inscription aux activités du club (gymnastique rythmique, gymnastique esthétique en groupe, petite enfance, danse contemporaine/modern’jazz) et la gestion des affectations aux cours/formules selon les capacités, règles et arbitrages de l’association. L’association peut ajuster les affectations, listes d’attente et groupes pour des motifs d’organisation, de sécurité, d’encadrement et de niveau. Une inscription peut être considérée comme définitive après validation par l’association et, le cas échéant, réception du règlement selon les modalités prévues (paiement hors ligne). En l’absence de dépôt des pièces nécessaires dans les délais communiqués par l’association, l’inscription peut être annulée."
    },
    {
      titre: "6. Règlement intérieur de l'association LA RYTHMO",
      contenu: "L’inscription et la participation aux activités de l’association impliquent l’acceptation et le respect du règlement intérieur de l’association LA RYTHMO. En cas de contradiction, les dispositions spécifiques du règlement intérieur relatives à l’organisation et au fonctionnement des activités prévalent. Le règlement intérieur est mis à disposition ci-dessous et peut être consulté à tout moment sur le site de l’association.",
      // On ajoute une propriété spécifique pour indiquer qu'on veut afficher le bouton PDF ici
      hasPdfLink: true 
    },
    {
      titre: "7. Documents administratifs",
      contenu: "Les documents déposés via la plateforme (autorisations, certificats, contrats, justificatifs) doivent être lisibles, complets et conformes. L’association peut refuser ou demander le remplacement de tout document manifestement incomplet, illisible ou non conforme."
    },
    {
      titre: "8. Absence de paiement en ligne",
      contenu: "La plateforme ne propose aucun paiement en ligne. Les règlements (adhésion/cotisation, forfaits, cours) sont effectués directement auprès de l’association, selon ses modalités (chèque, virement, espèces). Les informations tarifaires affichées sur la plateforme sont indicatives et applicables selon les décisions et communications officielles de l’association."
    },
    {
      titre: "9. Usage interdit",
      contenu: "Il est interdit de porter atteinte au fonctionnement ou à la sécurité du service (accès frauduleux, extraction non autorisée, contournement des contrôles, usurpation, tentative d’intrusion, diffusion de contenus illicites). En cas de manquement, l’association peut suspendre ou supprimer l’accès, sans préjudice de toute action utile."
    },
    {
      titre: "10. Disponibilité",
      contenu: "Le service peut être interrompu pour maintenance, mise à jour, ou incident technique. L’association n’accorde aucune garantie d’accès continu et sans erreur."
    },
    {
      titre: "11. Responsabilité",
      contenu: "Le service constitue un outil de gestion. L’association ne saurait être tenue responsable des dommages indirects, pertes de chance, pertes de données imputables à l’utilisateur, ou des conséquences d’une indisponibilité temporaire du service."
    },
    {
      titre: "12. Données personnelles",
      contenu: "Les traitements de données personnelles sont décrits dans la Politique de confidentialité."
    },
    {
      titre: "13. Modification des conditions",
      contenu: "L’association peut modifier les présentes conditions à tout moment. La version publiée en ligne est applicable dès sa mise à disposition."
    },
    {
      titre: "14. Droit applicable",
      contenu: "Les présentes conditions sont soumises au droit français. En cas de différend, une résolution amiable sera recherchée avant toute action."
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
          Conditions générales d’utilisation
        </h1>
      </div>

      {/* Contenu principal */}
      <section className="glass-panel rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-8 shadow-lg">

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          
          {ARTICLES.map((article, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                {article.titre}
              </h3>
              <p className="text-justify">
                {article.contenu}
              </p>
              
              {/* Affichage conditionnel du bouton PDF juste après le texte de l'article 6 */}
              {article.hasPdfLink && (
                <div className="mt-4">
                  <a 
                    href="/documents/reglement_interieur_larythmo.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-300 hover:border-[#7b68ee] hover:text-[#7b68ee] text-gray-700 text-sm font-semibold rounded-lg shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Ouvrir le Règlement Intérieur (PDF)
                  </a>
                </div>
              )}
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}