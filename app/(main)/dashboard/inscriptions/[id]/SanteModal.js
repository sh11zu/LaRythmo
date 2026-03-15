'use client';

import { useState, useEffect } from 'react';
import ModalPortal from '@/app/components/ModalPortal';

const SECTIONS = [
  {
    label: 'Durant les 12 derniers mois',
    questions: [
      "Un membre de votre famille est-il décédé subitement d'une cause cardiaque ou inexpliquée ?",
      "Avez-vous ressenti une douleur dans la poitrine, des palpitations, un essoufflement inhabituel ou un malaise ?",
      "Avez-vous eu un épisode de respiration sifflante (asthme) ?",
      "Avez-vous eu une perte de connaissance ?",
      "Si vous avez arrêté le sport pendant 30 jours ou plus pour des raisons de santé, avez-vous repris sans l'accord d'un médecin ?",
      "Avez-vous débuté un traitement médical de longue durée (hors contraception et désensibilisation aux allergies) ?",
    ],
  },
  {
    label: 'À ce jour',
    questions: [
      "Ressentez-vous une douleur, un manque de force ou une raideur suite à un problème osseux, articulaire ou musculaire (fracture, entorse, luxation, déchirure, tendinite, etc.) survenu durant les 12 derniers mois ?",
      "Votre pratique sportive est-elle interrompue pour des raisons de santé ?",
      "Pensez-vous avoir besoin d'un avis médical pour poursuivre votre pratique sportive ?",
    ],
  },
];

const ALL_QUESTIONS = SECTIONS.flatMap(s => s.questions);

export default function SanteModal({ memberName, onSign, onClose, readOnly = false, signatureData = null, signedAt = null }) {
  const initAnswers = readOnly && Array.isArray(signatureData?.answers)
    ? signatureData.answers
    : new Array(ALL_QUESTIONS.length).fill(false);

  const [answers,     setAnswers]     = useState(initAnswers);
  const [confirming,  setConfirming]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);

  const hasOui = answers.some(a => a === true);

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

  function setAnswer(index, value) {
    if (readOnly) return;
    setAnswers(prev => prev.map((a, i) => i === index ? value : a));
  }

  async function handleConfirmSign() {
    setLoading(true);
    await onSign({ answers });
    setLoading(false);
  }

  const signedDateLabel = signedAt
    ? new Date(signedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  let qIndex = 0;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
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
              <h3 className="text-sm font-bold text-gray-800">Questionnaire de santé</h3>
              <span className="text-[10px] font-medium text-gray-400">QS-SPORT · cerfa N°15699*01</span>
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
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6 text-sm text-gray-700">

            <p className="text-xs text-gray-500 leading-relaxed">
              Ce questionnaire concerne <span className="font-semibold text-gray-700">{memberName}</span>.
              Répondez par <strong>OUI</strong> ou <strong>NON</strong> à chacune des questions.
            </p>

            {SECTIONS.map(section => {
              const sectionStart = qIndex;
              const sectionQuestions = section.questions;
              qIndex += sectionQuestions.length;

              return (
                <div key={section.label} className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{section.label}</p>
                  <div className="space-y-2">
                    {sectionQuestions.map((q, i) => {
                      const idx = sectionStart + i;
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="flex-1 text-xs text-gray-700 leading-relaxed pt-0.5">{q}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {[{ val: true, label: 'OUI' }, { val: false, label: 'NON' }].map(({ val, label }) => (
                              <label
                                key={String(val)}
                                className={`flex items-center gap-1.5 select-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                onClick={() => setAnswer(idx, val)}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                  answers[idx] === val
                                    ? val === true
                                      ? 'border-amber-500 bg-amber-500'
                                      : 'border-[#7b68ee] bg-[#7b68ee]'
                                    : 'border-gray-300 bg-white'
                                }`}>
                                  {answers[idx] === val && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span className={`text-[11px] font-bold ${answers[idx] === val ? (val ? 'text-amber-600' : 'text-[#7b68ee]') : 'text-gray-400'}`}>
                                  {label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Résultat dynamique */}
            {hasOui ? (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Un certificat médical est requis.</strong> Vous avez répondu OUI à au moins une question.
                  Vous devrez fournir un certificat médical d'absence de contre-indication à la pratique sportive.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200">
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-green-700 leading-relaxed">
                  <strong>Aucun certificat médical requis.</strong> Vous avez répondu NON à toutes les questions.
                </p>
              </div>
            )}

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
                  En confirmant, vous certifiez avoir répondu sincèrement à ce questionnaire. Cette action est <strong>irréversible</strong>.
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
