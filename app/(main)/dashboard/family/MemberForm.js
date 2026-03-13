'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── Utilitaires adresse ── */

export function parseAddress(str) {
  if (!str) return { line: '', postal: '', city: '' };
  const m = str.match(/^(.*?),?\s*(\d{4,5})\s+(.+)$/);
  if (m) return { line: m[1].trim(), postal: m[2], city: m[3].trim() };
  return { line: str.trim(), postal: '', city: '' };
}

export function joinAddress(line, postal, city) {
  const parts = [line?.trim(), [postal?.trim(), city?.trim()].filter(Boolean).join(' ')].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/* ── Constantes ── */

const GENDER_AVATAR = { MALE: '👦', FEMALE: '👧', OTHER: '🧒' };
const GENDER_COLOR  = { MALE: 'bg-blue-100 text-blue-600', FEMALE: 'bg-pink-100 text-pink-600', OTHER: 'bg-purple-100 text-purple-600' };

const REG_STATUS = {
  DRAFT:              { label: 'Brouillon',  cls: 'bg-gray-200 text-gray-700' },
  PENDING_VALIDATION: { label: 'En attente', cls: 'bg-amber-100 text-amber-800' },
  VALIDATED:          { label: 'Validée',    cls: 'bg-green-100 text-green-800' },
  CANCELED:           { label: 'Annulée',    cls: 'bg-red-100 text-red-700' },
};
const PAY_STATUS = {
  PENDING: { label: 'Non payé', cls: 'bg-red-100 text-red-700' },
  PARTIAL: { label: 'Partiel',  cls: 'bg-amber-100 text-amber-800' },
  PAID:    { label: 'Payé',     cls: 'bg-green-100 text-green-800' },
};

const LINK_OPTIONS = ['Père', 'Mère', 'Grand-père', 'Grand-mère', 'Oncle', 'Tante', 'Tuteur', 'Tutrice', 'Frère', 'Sœur', 'Autre'];

const inputCls = 'px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7b68ee]/30 focus:border-[#7b68ee] bg-white/80 transition-all w-full';
const selectCls = inputCls + ' appearance-none';

/* ── Composants de base ── */

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-800 mt-0.5 leading-snug">
        {value || <span className="text-gray-300 italic text-xs">—</span>}
      </dd>
    </div>
  );
}

function EditRow({ label, children }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ── Combobox : texte libre + suggestions filtrées ── */

function Combobox({ value, onChange, suggestions = [], placeholder, required, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = suggestions.filter(s =>
    !value || s.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        required={required}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={className ?? inputCls}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 w-full">
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              onMouseDown={e => { e.preventDefault(); onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                value === opt ? 'font-bold text-[#7b68ee] bg-[#7b68ee]/5' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Groupe adresse : 3 champs avec suggestion auto-fill ── */

function AddressGroup({ line, postal, city, onLine, onPostal, onCity, suggestions = [] }) {
  const [open, setOpen] = useState(false);

  const filtered = suggestions.filter(s =>
    !line || s.toLowerCase().includes(line.toLowerCase())
  );

  return (
    <>
      <div className="col-span-2 relative">
        <EditRow label="Adresse">
          <input
            value={line}
            onChange={e => { onLine(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className={inputCls}
            placeholder="Adresse ligne principale"
          />
          {open && filtered.length > 0 && (
            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 w-full">
              {filtered.map(addr => {
                const p = parseAddress(addr);
                return (
                  <button
                    key={addr}
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      onLine(p.line); onPostal(p.postal); onCity(p.city);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors truncate"
                  >
                    {addr}
                  </button>
                );
              })}
            </div>
          )}
        </EditRow>
      </div>
      <EditRow label="Code postal">
        <input value={postal} onChange={e => onPostal(e.target.value)} className={inputCls} placeholder="13200" maxLength={10} />
      </EditRow>
      <EditRow label="Ville">
        <input value={city} onChange={e => onCity(e.target.value)} className={inputCls} placeholder="Arles" />
      </EditRow>
    </>
  );
}

/* ── Badge-dropdown lien de parenté ── */

function LinkBadge({ value, onChange, colorCls = 'bg-[#7b68ee]/10 text-[#7b68ee]' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div className="relative shrink-0 ml-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorCls} hover:opacity-80 transition-opacity flex items-center gap-1`}
      >
        {value || '+ Lien'}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[130px]">
          {LINK_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                value === opt ? 'font-bold text-[#7b68ee] bg-[#7b68ee]/5' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── État initial ── */

const EMPTY = {
  firstName: '', lastName: '', gender: 'MALE', birthDate: '',
  addressLine: '', addressPostal: '', addressCity: '',
  guardian1Link: '',
  guardian2FirstName: '', guardian2LastName: '', guardian2Gender: '',
  guardian2Email: '', guardian2Phone: '',
  guardian2AddressLine: '', guardian2AddressPostal: '', guardian2AddressCity: '',
  guardian2Link: '',
  emergencyFirstName: '', emergencyLastName: '',
  emergencyEmail: '', emergencyPhone: '', emergencyLink: '',
};

function memberToState(m) {
  const addr   = parseAddress(m.address);
  const g2addr = parseAddress(m.guardian2Address);
  return {
    firstName:          m.firstName          ?? '',
    lastName:           m.lastName           ?? '',
    gender:             m.gender             ?? 'MALE',
    birthDate:          m.birthDate          ?? '',
    addressLine:        addr.line,
    addressPostal:      addr.postal,
    addressCity:        addr.city,
    guardian1Link:      m.guardian1Link      ?? '',
    guardian2FirstName: m.guardian2FirstName ?? '',
    guardian2LastName:  m.guardian2LastName  ?? '',
    guardian2Gender:    m.guardian2Gender    ?? '',
    guardian2Email:     m.guardian2Email     ?? '',
    guardian2Phone:     m.guardian2Phone     ?? '',
    guardian2AddressLine:   g2addr.line,
    guardian2AddressPostal: g2addr.postal,
    guardian2AddressCity:   g2addr.city,
    guardian2Link:      m.guardian2Link      ?? '',
    emergencyFirstName: m.emergencyFirstName ?? '',
    emergencyLastName:  m.emergencyLastName  ?? '',
    emergencyEmail:     m.emergencyEmail     ?? '',
    emergencyPhone:     m.emergencyPhone     ?? '',
    emergencyLink:      m.emergencyLink      ?? '',
  };
}

/* ── Composant principal ── */

export default function MemberForm({
  member,
  accountUser,
  inscriptions = [],
  hints        = {},
  backUrl      = '/dashboard/family',
  successUrl   = '/dashboard/family',
}) {
  const isEdit = Boolean(member?.id);
  const router = useRouter();
  const [form, setForm]     = useState(member ? memberToState(member) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const set    = (key) => (e)   => setForm(f => ({ ...f, [key]: e.target.value }));
  const setVal = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const lastNameSuggestions  = hints.lastNames  ?? [];
  const addressSuggestions   = hints.addresses  ?? [];

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      first_name:                   form.firstName,
      last_name:                    form.lastName,
      gender:                       form.gender,
      birth_date:                   form.birthDate,
      address:                      joinAddress(form.addressLine, form.addressPostal, form.addressCity),
      guardian1_link_to_member:     form.guardian1Link      || null,
      guardian2_first_name:         form.guardian2FirstName || null,
      guardian2_last_name:          form.guardian2LastName  || null,
      guardian2_gender:             form.guardian2Gender    || null,
      guardian2_email:              form.guardian2Email     || null,
      guardian2_phone:              form.guardian2Phone     || null,
      guardian2_address:            joinAddress(form.guardian2AddressLine, form.guardian2AddressPostal, form.guardian2AddressCity),
      guardian2_link_to_member:     form.guardian2Link      || null,
      emergency_contact_first_name: form.emergencyFirstName,
      emergency_contact_last_name:  form.emergencyLastName,
      emergency_contact_email:      form.emergencyEmail     || null,
      emergency_contact_phone:      form.emergencyPhone,
      emergency_link_to_member:     form.emergencyLink      || null,
    };

    const url    = isEdit ? `/api/members/${member.id}` : '/api/members';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Une erreur est survenue.');
      return;
    }

    router.push(successUrl);
    router.refresh();
  }

  const displayName = (form.firstName || form.lastName)
    ? `${form.firstName} ${form.lastName}`.trim()
    : isEdit ? `${member.firstName} ${member.lastName}` : 'Nouveau membre';

  const accountAddr = accountUser ? parseAddress(accountUser.address) : null;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${GENDER_COLOR[form.gender] ?? 'bg-gray-100'}`}>
            {GENDER_AVATAR[form.gender] ?? '🧒'}
          </div>
          <div>
            <Link href={backUrl} className="text-gray-400 hover:text-[#7b68ee] text-sm transition-colors block mb-1">
              ← {isEdit ? 'Annuler les modifications' : 'Ma famille'}
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{displayName}</h1>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {error && <p className="text-sm text-red-500 font-medium text-right">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#7b68ee] border border-[#7b68ee]/30 hover:bg-[#7b68ee]/5 transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le membre'}
          </button>
        </div>
      </div>

      {/* ── Grille 2×2 ── */}
      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Col 1 — Informations personnelles */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <h3 className="text-xs font-bold text-[#7b68ee] uppercase tracking-widest mb-4">Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <EditRow label="Prénom *">
              <input required value={form.firstName} onChange={set('firstName')} className={inputCls} placeholder="Prénom" />
            </EditRow>
            <EditRow label="Nom *">
              <Combobox
                required
                value={form.lastName}
                onChange={setVal('lastName')}
                suggestions={lastNameSuggestions}
                placeholder="Nom de famille"
              />
            </EditRow>
            <EditRow label="Genre *">
              <select required value={form.gender} onChange={set('gender')} className={selectCls}>
                <option value="MALE">Masculin</option>
                <option value="FEMALE">Féminin</option>
                <option value="OTHER">Autre</option>
              </select>
            </EditRow>
            <EditRow label="Date de naissance *">
              <input required type="date" value={form.birthDate} onChange={set('birthDate')} className={inputCls} />
            </EditRow>
            <AddressGroup
              line={form.addressLine}   postal={form.addressPostal}   city={form.addressCity}
              onLine={setVal('addressLine')} onPostal={setVal('addressPostal')} onCity={setVal('addressCity')}
              suggestions={addressSuggestions}
            />
          </div>
        </div>

        {/* Col 2 — Inscriptions (lecture seule) */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <h3 className="text-xs font-bold text-[#7b68ee] uppercase tracking-widest mb-4">
            Inscriptions ({inscriptions.length})
          </h3>
          {inscriptions.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune inscription pour ce membre.</p>
          ) : (
            <div className="space-y-2">
              {inscriptions.map(i => {
                const reg = REG_STATUS[i.registrationStatus] ?? REG_STATUS.DRAFT;
                const pay = PAY_STATUS[i.paymentStatus]       ?? PAY_STATUS.PENDING;
                return (
                  <div key={i.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/60 border border-white/80">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{i.season}</p>
                      <p className="text-xs text-gray-500 truncate">{i.packageName ?? 'À la carte'}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${reg.cls}`}>{reg.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.cls}`}>{pay.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Col 3 — Responsable Légal 1 (compte — lecture seule) */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Responsable Légal 1</h3>
            <LinkBadge value={form.guardian1Link} onChange={setVal('guardian1Link')} />
          </div>
          {accountUser ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow label="Prénom"    value={accountUser.firstName} />
              <InfoRow label="Nom"       value={accountUser.lastName} />
              <InfoRow label="Email"     value={accountUser.email} />
              <InfoRow label="Téléphone" value={accountUser.phone} />
              {accountAddr && (
                <>
                  <div className="col-span-2"><InfoRow label="Adresse"     value={accountAddr.line} /></div>
                  <InfoRow label="Code postal" value={accountAddr.postal} />
                  <InfoRow label="Ville"       value={accountAddr.city} />
                </>
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-300 italic">—</p>
          )}
        </div>

        {/* Col 4 — Responsable Légal 2 */}
        <div className="glass-panel rounded-2xl border border-white/60 p-5 h-full">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Responsable Légal 2</h3>
            <LinkBadge value={form.guardian2Link} onChange={setVal('guardian2Link')} />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <EditRow label="Prénom">
              <input value={form.guardian2FirstName} onChange={set('guardian2FirstName')} className={inputCls} placeholder="Prénom" />
            </EditRow>
            <EditRow label="Nom">
              <Combobox
                value={form.guardian2LastName}
                onChange={setVal('guardian2LastName')}
                suggestions={lastNameSuggestions}
                placeholder="Nom de famille"
              />
            </EditRow>
            <EditRow label="Email">
              <input type="email" value={form.guardian2Email} onChange={set('guardian2Email')} className={inputCls} placeholder="email@exemple.fr" />
            </EditRow>
            <EditRow label="Téléphone">
              <input type="tel" value={form.guardian2Phone} onChange={set('guardian2Phone')} className={inputCls} placeholder="06 XX XX XX XX" />
            </EditRow>
            <AddressGroup
              line={form.guardian2AddressLine}   postal={form.guardian2AddressPostal}   city={form.guardian2AddressCity}
              onLine={setVal('guardian2AddressLine')} onPostal={setVal('guardian2AddressPostal')} onCity={setVal('guardian2AddressCity')}
              suggestions={addressSuggestions}
            />
          </div>
        </div>

      </div>

      {/* ── Contact d'urgence — pleine largeur ── */}
      <div className="glass-panel rounded-2xl border border-white/60 p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">Contact d'urgence</h3>
          <LinkBadge value={form.emergencyLink} onChange={setVal('emergencyLink')} colorCls="bg-red-100 text-red-600" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
          <EditRow label="Prénom *">
            <input required value={form.emergencyFirstName} onChange={set('emergencyFirstName')} className={inputCls} placeholder="Prénom" />
          </EditRow>
          <EditRow label="Nom *">
            <input required value={form.emergencyLastName} onChange={set('emergencyLastName')} className={inputCls} placeholder="Nom" />
          </EditRow>
          <EditRow label="Téléphone *">
            <input required type="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} className={inputCls} placeholder="06 XX XX XX XX" />
          </EditRow>
          <EditRow label="Email">
            <input type="email" value={form.emergencyEmail} onChange={set('emergencyEmail')} className={inputCls} placeholder="email@exemple.fr" />
          </EditRow>
        </div>
      </div>

    </form>
  );
}
