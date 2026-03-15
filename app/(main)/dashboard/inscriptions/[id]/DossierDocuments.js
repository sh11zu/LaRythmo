'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import autorisationTexts from '@/data/autorisation_texts.json';
import SortieModal from './SortieModal';
import ImageModal from './ImageModal';
import ParentalAuthModal from './ParentalAuthModal';
import SanteModal from './SanteModal';
import ModalPortal from '@/app/components/ModalPortal';

function parseCity(address) {
  if (!address) return '';
  const m = address.match(/\d{4,5}\s+(.+)$/);
  return m ? m[1].trim() : '';
}

function getToday() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* ─────────────────────────────────────────────
   Groupes de documents (catégorisés)
   ───────────────────────────────────────────── */

const DOC_GROUPS = [
  {
    label: "Photo et utilisation de l'image",
    docs: [
      { type: 'PHOTO',  label: "Photo de l'enfant", kind: 'upload' },
      { type: 'IMAGE',  label: "Droit à l'image",   kind: 'sign_generated' },
    ],
  },
  {
    label: 'Autorisations parentales',
    docs: [
      { type: 'PARENTAL_AUTH', label: 'Autorisation parentale',   kind: 'sign_generated' },
      { type: 'SORTIE',        label: 'Autorisation de sortie',   kind: 'sign_generated' },
    ],
  },
  {
    label: 'Règlement intérieur du club',
    docs: [
      { type: 'CONTRACT', label: 'Règlement intérieur', kind: 'sign_static', pdfPath: '/documents/reglement_interieur_larythmo.pdf', pdfSign: true },
    ],
  },
  {
    label: 'Santé',
    docs: [
      { type: 'SANTE_ATTESTATION',   label: 'Questionnaire de santé', kind: 'sante_form' },
      { type: 'MEDICAL_CERTIFICATE', label: 'Certificat médical',      kind: 'upload', optional: true },
    ],
  },
];

/* ─── Template fill ─── */

function fillTemplate(text, { memberName, guardianName, season, city = '', date = '' }) {
  return text
    .replace(/\{\{MEMBER_NAME\}\}/g, memberName)
    .replace(/\{\{GUARDIAN_NAME\}\}/g, guardianName)
    .replace(/\{\{SEASON\}\}/g, season)
    .replace(/\{\{CITY\}\}/g, city || '___________')
    .replace(/\{\{DATE\}\}/g, date || '___________');
}

/* ─── Icônes SVG ─── */

const IcoPhoto = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IcoDoc = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IcoEye = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IcoPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);
const IcoRefresh = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IcoPen = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const IcoDownload = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

/* ─── Bouton icône ─── */

function IconBtn({ onClick, href, download, disabled, title, children }) {
  const base = 'w-8 h-8 flex items-center justify-center rounded-lg border transition-colors';
  const active = 'text-[#7b68ee] border-[#7b68ee]/30 bg-white/60 hover:bg-white';
  const dis = 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed';
  if (href && !disabled) {
    return (
      <a href={href} target={download ? undefined : '_blank'} rel="noopener noreferrer" download={download || undefined} title={title} className={`${base} ${active}`}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`${base} ${disabled ? dis : active}`}>
      {children}
    </button>
  );
}

/* ─── Modal PDF inline + checkbox (Règlement intérieur) ─── */

function PdfSignModal({ pdfPath, label, onConfirm, onClose, readOnly = false }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleConfirm() {
    if (!checked) return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h3 className="text-sm font-bold text-gray-800">{label}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* PDF */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <iframe src={pdfPath} className="w-full h-full border-0" style={{ minHeight: '480px' }} title={label} />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-3">
            {readOnly ? (
              <div className="flex justify-end">
                <button onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => setChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#7b68ee] cursor-pointer shrink-0"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                    J'ai lu et j'accepte le règlement intérieur dans son intégralité.
                  </span>
                </label>
                <div className="flex items-center justify-between">
                  <button onClick={onClose} disabled={loading}
                    className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40">
                    Fermer
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!checked || loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${checked && !loading ? 'bg-[#7b68ee] text-white hover:bg-[#6a5bd6]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {loading
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Signature…</>
                      : <><IcoPen /> Signer</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── Modal générique ─── */

function GenericModal({ title, body, onSign, onClose, readOnly = false, signedAt = null }) {
  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onSign();
    setLoading(false);
  }

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800">{title}</h3>
              {readOnly && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Signé ✓</span>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto flex-1">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            {readOnly ? (
              <div className="flex items-center justify-between">
                {signedAt && <p className="text-xs text-gray-400 italic">Signé le {new Date(signedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
                <button onClick={onClose} className="ml-auto text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Fermer</button>
              </div>
            ) : confirming ? (
              <div className="space-y-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">En confirmant, vous certifiez avoir lu et accepté ce document. Cette action est <strong>irréversible</strong>.</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => setConfirming(false)} disabled={loading} className="text-sm font-bold text-gray-500 hover:text-gray-700 disabled:opacity-40">Annuler</button>
                  <button onClick={handleConfirm} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#7b68ee] text-white hover:bg-[#6a5bd6] disabled:opacity-60">
                    {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Signature…</> : "J'ai lu et j'accepte"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-gray-700">Fermer</button>
                <button onClick={() => setConfirming(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#7b68ee] border border-[#7b68ee]/30 bg-white/60 hover:bg-white">
                  <IcoPen /> Signer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─── Modal confirmation signature (PDFs statiques) ─── */

function ConfirmSignModal({ label, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Signer : {label}</h3>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">En confirmant, vous certifiez avoir lu et accepté ce document. Cette action est <strong className="text-gray-700">irréversible</strong>.</p>
          <p className="text-xs text-gray-400 mb-5 italic">Vous pouvez consulter le document avec le bouton "Voir" avant de signer.</p>
          <div className="flex items-center justify-between">
            <button onClick={onClose} disabled={loading} className="text-sm font-bold text-gray-500 hover:text-gray-700 disabled:opacity-40">Annuler</button>
            <button onClick={handleConfirm} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#7b68ee] text-white hover:bg-[#6a5bd6] disabled:opacity-60">
              {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Signature…</> : "J'ai lu et j'accepte"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─────────────────────────────────────────────
   Composant principal
   ───────────────────────────────────────────── */

export default function DossierDocuments({ docs, memberName, guardianName, season, contacts, inscriptionId }) {
  const router = useRouter();
  const [modal, setModal] = useState(null);
  const [localSigned, setLocalSigned] = useState(new Set());

  const docMap = new Map(docs.map(d => [d.type, d]));

  async function handleSign(docType, formData) {
    const res = await fetch('/api/documents/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inscriptionId, type: docType, formData }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? 'Une erreur est survenue lors de la signature.');
      return;
    }
    setLocalSigned(prev => new Set([...prev, docType]));
    setModal(null);
    router.refresh();
  }

  function openGeneratedDoc(type, readOnly = false) {
    const doc = docMap.get(type);
    const signatureData = doc?.signature_data ?? null;
    const signedAt      = doc?.signed_at ?? null;
    if (type === 'SORTIE')            { setModal({ type: 'sortie',        readOnly, signatureData, signedAt }); return; }
    if (type === 'IMAGE')             { setModal({ type: 'image',         readOnly, signatureData, signedAt }); return; }
    if (type === 'PARENTAL_AUTH')     { setModal({ type: 'parental_auth', readOnly, signedAt }); return; }
    if (type === 'SANTE_ATTESTATION') { setModal({ type: 'sante',         readOnly, signatureData, signedAt }); return; }
    const tpl = autorisationTexts[type];
    if (!tpl) return;
    const city = parseCity(contacts?.guardian1?.address);
    setModal({ type: 'generic', docType: type, title: tpl.title, body: fillTemplate(tpl.body, { memberName, guardianName, season, city, date: getToday() }), readOnly, signatureData, signedAt });
  }

  /* ─── Rendu d'une carte document ─── */
  function DocCard({ type, label, kind, pdfPath, pdfSign = false, optional = false }) {
    const doc      = docMap.get(type);
    const signed   = !!doc?.signed_at || localSigned.has(type);
    const hasFile  = !!doc?.file_path;
    const complete = kind === 'upload' ? doc?.status === 'VALIDATED' : signed;

    // MEDICAL_CERTIFICATE becomes required when SANTE_ATTESTATION has any OUI answer
    const santeDoc = docMap.get('SANTE_ATTESTATION');
    const santeHasOui = Array.isArray(santeDoc?.signature_data?.answers)
      ? santeDoc.signature_data.answers.some(a => a === true)
      : false;
    const isOptional = type === 'MEDICAL_CERTIFICATE' ? !santeHasOui : optional;

    /* Badge */
    let badgeLabel, badgeCls;
    if (kind === 'upload') {
      if (!doc)                            { badgeLabel = isOptional ? 'Facultatif' : 'Non fourni'; badgeCls = 'bg-gray-100 text-gray-400'; }
      else if (doc.status === 'VALIDATED') { badgeLabel = 'Validé';     badgeCls = 'bg-green-100 text-green-700'; }
      else if (doc.status === 'REJECTED')  { badgeLabel = 'Refusé';     badgeCls = 'bg-red-100 text-red-700'; }
      else                                 { badgeLabel = 'En attente'; badgeCls = 'bg-amber-100 text-amber-700'; }
    } else {
      badgeLabel = signed ? 'Signé'     : 'Non signé';
      badgeCls   = signed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400';
    }

    /* Boutons */
    let buttons;
    if (kind === 'upload') {
      buttons = (
        <>
          <IconBtn href={hasFile ? doc.file_path : undefined} disabled={!hasFile} title="Voir">
            <IcoEye />
          </IconBtn>
          <IconBtn onClick={() => {}} title={hasFile ? 'Remplacer' : 'Ajouter'}>
            {hasFile ? <IcoRefresh /> : <IcoPlus />}
          </IconBtn>
        </>
      );
    } else if (kind === 'sign_static') {
      buttons = (
        <>
          <IconBtn onClick={() => setModal({ type: 'pdf_sign', docType: type, label, pdfPath, readOnly: true })} title="Voir"><IcoEye /></IconBtn>
          <IconBtn
            onClick={() => {
              if (signed) return;
              if (pdfSign) {
                setModal({ type: 'pdf_sign', docType: type, label, pdfPath });
              } else {
                setModal({ type: 'confirm_static', docType: type, label });
              }
            }}
            disabled={signed}
            title={signed ? 'Déjà signé' : 'Signer'}
          >
            <IcoPen />
          </IconBtn>
          <IconBtn href={pdfPath} download title="Télécharger"><IcoDownload /></IconBtn>
        </>
      );
    } else if (kind === 'sante_form') {
      buttons = (
        <>
          <IconBtn
            onClick={signed ? () => setModal({ type: 'cerfa_view' }) : undefined}
            disabled={!signed}
            title="Voir"
          >
            <IcoEye />
          </IconBtn>
          <IconBtn
            onClick={() => !signed && openGeneratedDoc(type, false)}
            disabled={signed}
            title={signed ? 'Déjà signé' : 'Signer'}
          >
            <IcoPen />
          </IconBtn>
          {signed && (
            <IconBtn
              href={`/api/documents/cerfa-pdf?inscriptionId=${inscriptionId}`}
              title="Télécharger le cerfa rempli"
            >
              <IcoDownload />
            </IconBtn>
          )}
        </>
      );
    } else {
      // sign_generated
      buttons = (
        <>
          <IconBtn
            onClick={signed ? () => openGeneratedDoc(type, true) : undefined}
            disabled={!signed}
            title="Voir"
          >
            <IcoEye />
          </IconBtn>
          <IconBtn
            onClick={() => !signed && openGeneratedDoc(type, false)}
            disabled={signed}
            title={signed ? 'Déjà signé' : 'Signer'}
          >
            <IcoPen />
          </IconBtn>
        </>
      );
    }

    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/60 border border-white/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${complete ? 'bg-[#7b68ee]/10' : 'bg-gray-100'}`}>
            {kind === 'upload'
              ? <span className={complete ? 'text-[#7b68ee]' : 'text-gray-300'}><IcoPhoto /></span>
              : <span className={complete ? 'text-[#7b68ee]' : 'text-gray-300'}><IcoDoc /></span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-700 font-medium truncate">{label}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>{badgeLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">{buttons}</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {DOC_GROUPS.map(group => (
          <div key={group.label}>
            {/* En-tête de catégorie */}
            <div className="flex items-center gap-3 mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">{group.label}</p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            {/* Grille 2 colonnes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.docs.map(d => <DocCard key={d.type} {...d} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {modal?.type === 'pdf_sign' && (
        <PdfSignModal
          pdfPath={modal.pdfPath}
          label={modal.label}
          onConfirm={modal.readOnly ? undefined : () => handleSign(modal.docType)}
          onClose={() => setModal(null)}
          readOnly={!!modal.readOnly}
        />
      )}
      {modal?.type === 'confirm_static' && (
        <ConfirmSignModal label={modal.label} onConfirm={() => handleSign(modal.docType)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'generic' && (
        <GenericModal title={modal.title} body={modal.body} readOnly={modal.readOnly} signedAt={modal.signedAt} onSign={() => handleSign(modal.docType)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'sortie' && (
        <SortieModal memberName={memberName} guardian1={contacts?.guardian1} guardian2={contacts?.guardian2} emergency={contacts?.emergency}
          onSign={formData => handleSign('SORTIE', formData)} onClose={() => setModal(null)}
          readOnly={modal.readOnly} signatureData={modal.signatureData} signedAt={modal.signedAt} />
      )}
      {modal?.type === 'image' && (
        <ImageModal memberName={memberName} guardian1={contacts?.guardian1}
          onSign={formData => handleSign('IMAGE', formData)} onClose={() => setModal(null)}
          readOnly={modal.readOnly} signatureData={modal.signatureData} signedAt={modal.signedAt} />
      )}
      {modal?.type === 'parental_auth' && (
        <ParentalAuthModal memberName={memberName} guardian1={contacts?.guardian1}
          onSign={() => handleSign('PARENTAL_AUTH')} onClose={() => setModal(null)}
          readOnly={modal.readOnly} signedAt={modal.signedAt} />
      )}
      {modal?.type === 'sante' && (
        <SanteModal memberName={memberName}
          onSign={formData => handleSign('SANTE_ATTESTATION', formData)} onClose={() => setModal(null)}
          readOnly={modal.readOnly} signatureData={modal.signatureData} signedAt={modal.signedAt} />
      )}
      {modal?.type === 'cerfa_view' && (
        <PdfSignModal
          pdfPath={`/api/documents/cerfa-pdf?inscriptionId=${inscriptionId}&view=1`}
          label="Questionnaire de santé · cerfa N°15699*01"
          readOnly
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
