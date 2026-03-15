'use client';

import { useState, useRef, useEffect } from 'react';
import ModalPortal from '@/app/components/ModalPortal';
import sortieText from '@/data/autorisation_texts.json';

/* ─── Utilitaires ─── */

function parseCity(address) {
  if (!address) return '';
  const m = address.match(/\d{4,5}\s+(.+)$/);
  return m ? m[1].trim() : '';
}

function getToday() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const MAX_PERSONS = 3;
const EMPTY_PERSON = { firstName: '', lastName: '', quality: '', phone: '' };

/* ─── Ligne personne ─── */

function PersonRow({ person, index, suggestions, onChange, onFill, onRemove, canRemove, readOnly }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const inputCls = `w-full text-sm px-2.5 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/30 focus:border-[#7b68ee]/50 placeholder:text-gray-300 ${readOnly ? 'bg-gray-50 text-gray-600 cursor-default' : ''}`;

  const query = person.firstName.toLowerCase();
  const filtered = suggestions.filter(s =>
    !query ||
    s.firstName.toLowerCase().startsWith(query) ||
    s.lastName.toLowerCase().startsWith(query)
  );

  return (
    <div className="flex items-center gap-2">

      {/* Prénom — avec combobox */}
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          className={inputCls}
          placeholder="Prénom"
          value={person.firstName}
          readOnly={readOnly}
          onChange={e => { if (!readOnly) { onChange(index, 'firstName', e.target.value); setOpen(true); } }}
          onFocus={() => { if (!readOnly) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {!readOnly && open && filtered.length > 0 && (
          <div className="absolute top-full mt-1 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {filtered.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={e => { e.preventDefault(); onFill(index, s); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between gap-2"
              >
                <span className="font-medium text-gray-800">{s.firstName} {s.lastName}</span>
                {s.quality && <span className="text-gray-400 shrink-0">{s.quality}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nom */}
      <div className="flex-1 min-w-0">
        <input className={inputCls} placeholder="Nom" value={person.lastName} readOnly={readOnly}
          onChange={e => { if (!readOnly) onChange(index, 'lastName', e.target.value); }} />
      </div>

      {/* Qualité */}
      <div className="flex-1 min-w-0">
        <input className={inputCls} placeholder="Qualité" value={person.quality} readOnly={readOnly}
          onChange={e => { if (!readOnly) onChange(index, 'quality', e.target.value); }} />
      </div>

      {/* Téléphone */}
      <div className="flex-1 min-w-0">
        <input className={inputCls} placeholder="Téléphone" value={person.phone} readOnly={readOnly}
          onChange={e => { if (!readOnly) onChange(index, 'phone', e.target.value); }} />
      </div>

      {/* Supprimer */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 disabled:opacity-0 disabled:pointer-events-none"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {readOnly && <div className="w-7 h-7 shrink-0" />}
    </div>
  );
}

/* ─── Modal principale ─── */

export default function SortieModal({ memberName, guardian1, guardian2, emergency, onSign, onClose, readOnly = false, signatureData = null, signedAt = null }) {
  const civility = guardian1?.gender === 'FEMALE' ? 'Madame'
                 : guardian1?.gender === 'MALE'   ? 'Monsieur'
                 : '';
  const soussigne = guardian1?.gender === 'FEMALE' ? 'Je soussignée'
                  : guardian1?.gender === 'MALE'   ? 'Je soussigné'
                  : 'Je soussigné(e)';
  const guardianFullName = [guardian1?.firstName, guardian1?.lastName].filter(Boolean).join(' ');
  const city = parseCity(guardian1?.address);

  const knownPersons = [
    guardian1?.firstName ? { firstName: guardian1.firstName, lastName: guardian1.lastName ?? '', quality: guardian1.quality ?? '', phone: guardian1.phone ?? '' } : null,
    guardian2?.firstName ? { firstName: guardian2.firstName, lastName: guardian2.lastName ?? '', quality: guardian2.quality ?? '', phone: guardian2.phone ?? '' } : null,
    emergency?.firstName ? { firstName: emergency.firstName, lastName: emergency.lastName  ?? '', quality: emergency.quality  ?? '', phone: emergency.phone  ?? '' } : null,
  ].filter(Boolean);

  // Init depuis signatureData si readOnly
  const initAuthorized = readOnly ? (signatureData?.authorized ?? true) : true;
  const initPersons    = readOnly && signatureData?.persons?.length > 0
    ? signatureData.persons
    : [{ ...EMPTY_PERSON }];

  const [authorized,     setAuthorized]     = useState(initAuthorized);
  const [persons,        setPersons]        = useState(initPersons);
  const [confirming,     setConfirming]     = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [closeConfirm,   setCloseConfirm]   = useState(false);

  /* ─── Détecter les modifications ─── */
  function hasChanges() {
    if (readOnly) return false;
    if (!authorized) return true;
    return persons.some(p => p.firstName || p.lastName || p.quality || p.phone);
  }

  /* ─── Fermeture avec confirmation ─── */
  function handleClose() {
    if (readOnly) { onClose(); return; }
    if (hasChanges()) {
      setCloseConfirm(true);
    } else {
      onClose();
    }
  }

  /* ─── ESC key ─── */
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (closeConfirm) { onClose(); return; }
      handleClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [authorized, persons, readOnly, closeConfirm]);  // eslint-disable-line

  /* ─── Validation réactive ─── */
  useEffect(() => {
    if (!validationError) return;
    if (authorized) { setValidationError(null); return; }
    const allValid = persons.every(
      p => p.firstName.trim() && p.lastName.trim() && p.quality.trim() && p.phone.trim()
    );
    if (allValid) setValidationError(null);
  }, [persons, authorized, validationError]);

  function handleToggle(val) {
    setAuthorized(val);
    if (val) setPersons([{ ...EMPTY_PERSON }]);
  }

  function updateField(idx, field, value) {
    setPersons(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  function fillRow(idx, data) {
    setPersons(prev => prev.map((p, i) => i === idx ? { ...data } : p));
  }

  function addPerson() {
    if (persons.length >= MAX_PERSONS) return;
    setPersons(prev => [...prev, { ...EMPTY_PERSON }]);
  }

  function removePerson(idx) {
    setPersons(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length > 0 ? next : [{ ...EMPTY_PERSON }];
    });
  }

  async function handleConfirmSign() {
    setLoading(true);
    await onSign({ authorized, persons: authorized ? [] : persons });
    setLoading(false);
  }

  /* ─── Date de signature (readOnly) ─── */
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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >

          {/* Overlay confirmation de fermeture */}
          {closeConfirm && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
              <div className="text-center px-8 space-y-4">
                <p className="text-sm font-bold text-gray-800">Fermer sans sauvegarder ?</p>
                <p className="text-xs text-gray-500 leading-relaxed">Vos modifications seront perdues.</p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => setCloseConfirm(false)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Rester
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Fermer quand même
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800">Autorisation de sortie</h3>
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
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5 text-sm text-gray-700">

            <p>{soussigne} <span className="font-bold">{[civility, guardianFullName].filter(Boolean).join(' ')}</span>,</p>

            {/* Toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-6">
                {[{ val: true, label: 'Autorise' }, { val: false, label: "N'autorise pas" }].map(({ val, label }) => (
                  <label
                    key={String(val)}
                    className={`flex items-center gap-2 select-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                    onClick={() => { if (!readOnly) handleToggle(val); }}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${authorized === val ? 'border-[#7b68ee] bg-[#7b68ee]' : 'border-gray-300 bg-white'}`}>
                      {authorized === val && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="font-semibold text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
              <p>mon enfant <span className="font-bold">{memberName}</span> {sortieText.SORTIE.legalText}</p>
            </div>

            {/* Personnes autorisées */}
            <div className={`space-y-3 transition-opacity ${authorized ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Dans le cas contraire — personnes autorisées à récupérer l'enfant ({persons.length}/{MAX_PERSONS})
              </p>

              {/* En-têtes colonnes */}
              <div className="grid gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide pr-9" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <span>Prénom</span>
                <span>Nom</span>
                <span>Qualité</span>
                <span>Téléphone</span>
              </div>

              <div className="space-y-2">
                {persons.map((p, i) => {
                  const usedKeys = new Set(
                    persons
                      .filter((_, j) => j !== i)
                      .map(r => `${r.firstName}|${r.lastName}`.toLowerCase())
                      .filter(k => k !== '|')
                  );
                  const rowSuggestions = knownPersons.filter(
                    s => !usedKeys.has(`${s.firstName}|${s.lastName}`.toLowerCase())
                  );
                  return (
                    <PersonRow
                      key={i}
                      person={p}
                      index={i}
                      suggestions={rowSuggestions}
                      onChange={updateField}
                      onFill={fillRow}
                      onRemove={removePerson}
                      canRemove={persons.length > 1}
                      readOnly={readOnly}
                    />
                  );
                })}
              </div>

              {!readOnly && persons.length < MAX_PERSONS && (
                <button
                  type="button"
                  onClick={addPerson}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#7b68ee] hover:underline"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une personne
                </button>
              )}
            </div>

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
              <div className="space-y-2">
                {validationError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {validationError}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <button onClick={handleClose} className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      if (!authorized) {
                        const invalid = persons.find(
                          p => !p.firstName.trim() || !p.lastName.trim() || !p.quality.trim() || !p.phone.trim()
                        );
                        if (invalid) {
                          setValidationError('Veuillez remplir tous les champs (prénom, nom, qualité, téléphone) pour chaque personne autorisée.');
                          return;
                        }
                      }
                      setValidationError(null);
                      setConfirming(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#7b68ee] border border-[#7b68ee]/30 bg-white/60 hover:bg-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Signer
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}
