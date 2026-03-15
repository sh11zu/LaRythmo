'use client';

import { useState, useEffect } from 'react';
import ModalPortal from '@/app/components/ModalPortal';

function parseCity(address) {
  if (!address) return '';
  const m = address.match(/\d{4,5}\s+(.+)$/);
  return m ? m[1].trim() : '';
}

function getToday() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const ITEMS = [
  "à pratiquer la gymnastique rythmique ou esthétique, la danse au sein du club « La Rythmo »",
  "à être conduit, en cas d'accident pendant son activité, au Centre Hospitalier pour y recevoir les soins nécessaires à son état",
  "à être transporté pour les déplacements du club par des parents bénévoles et/ou des éducateurs et dégage La Rythmo de toute responsabilité dans le transport de mon enfant",
  "à participer aux compétitions GR et/ou aux concours de danse pour lesquels mon enfant est inscrit",
];

export default function ParentalAuthModal({ memberName, guardian1, onSign, onClose, readOnly = false, signedAt = null }) {
  const civility = guardian1?.gender === 'FEMALE' ? 'Madame'
                 : guardian1?.gender === 'MALE'   ? 'Monsieur'
                 : '';
  const soussigne = guardian1?.gender === 'FEMALE' ? 'Je soussignée'
                  : guardian1?.gender === 'MALE'   ? 'Je soussigné'
                  : 'Je soussigné(e)';
  const guardianFullName = [guardian1?.firstName, guardian1?.lastName].filter(Boolean).join(' ');
  const city = parseCity(guardian1?.address);

  const [confirming,   setConfirming]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);

  function handleClose() {
    if (readOnly) { onClose(); return; }
    setCloseConfirm(true);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (closeConfirm) { onClose(); return; }
      handleClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [readOnly, closeConfirm]); // eslint-disable-line

  async function handleConfirmSign() {
    setLoading(true);
    await onSign();
    setLoading(false);
  }

  const signedDateLabel = signedAt
    ? new Date(signedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >

          {/* Overlay confirmation fermeture */}
          {closeConfirm && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
              <div className="text-center px-8 space-y-4">
                <p className="text-sm font-bold text-gray-800">Fermer sans sauvegarder ?</p>
                <p className="text-xs text-gray-500 leading-relaxed">Vous n'avez pas encore signé ce document.</p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button onClick={() => setCloseConfirm(false)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                    Rester
                  </button>
                  <button onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                    Fermer quand même
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800">Autorisation parentale</h3>
              {readOnly && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Signé ✓
                </span>
              )}
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm text-gray-700">

            <p>
              {soussigne} <span className="font-bold">{[civility, guardianFullName].filter(Boolean).join(' ')}</span>,
              autorise mon enfant <span className="font-bold">{memberName}</span> :
            </p>

            <ul className="list-disc list-outside pl-5 space-y-2">
              {ITEMS.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>

            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 leading-relaxed italic">
              L'association décline toute responsabilité en cas de vol dans les vestiaires et sur toutes les installations sportives, que ce soit à l'occasion des entraînements, des spectacles ou des compétitions.
            </p>

            {/* Ville + date */}
            <p className="text-gray-500 text-xs border-t border-gray-100 pt-4">
              Fait à <span className="font-semibold text-gray-700">{city || '___________'}</span>,
              le <span className="font-semibold text-gray-700">{getToday()}</span>
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            {readOnly ? (
              <div className="flex items-center justify-between">
                {signedDateLabel && (
                  <p className="text-xs text-gray-400 italic">Signé le {signedDateLabel}</p>
                )}
                <button onClick={onClose} className="ml-auto text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                  Fermer
                </button>
              </div>
            ) : confirming ? (
              <div className="space-y-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
                  En confirmant, vous certifiez avoir lu et accepté ce document. Cette action est <strong>irréversible</strong>.
                </p>
                <div className="flex items-center justify-between">
                  <button onClick={() => setConfirming(false)} disabled={loading}
                    className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40">
                    Annuler
                  </button>
                  <button onClick={handleConfirmSign} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#7b68ee] text-white hover:bg-[#6a5bd6] transition-colors disabled:opacity-60">
                    {loading
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Signature…</>
                      : "J'ai lu et j'accepte"
                    }
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button onClick={handleClose} className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                  Fermer
                </button>
                <button onClick={() => setConfirming(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#7b68ee] border border-[#7b68ee]/30 bg-white/60 hover:bg-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Signer
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}
