'use client';

import Link from 'next/link';

/* ── KPI card ── */
function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Donut SVG ── */
function DonutChart({ segments, size = 100 }) {
  const r = 36, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="700" fill="#374151">
        {total}
      </text>
    </svg>
  );
}

/* ── Badge statut inscription ── */
const REG_BADGE = {
  DRAFT:          { label: 'Brouillon',  cls: 'bg-gray-100 text-gray-600' },
  PENDING_REVIEW: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  VALIDATED:      { label: 'Validée',    cls: 'bg-green-100 text-green-700' },
  CANCELLED:      { label: 'Annulée',    cls: 'bg-red-100 text-red-600' },
};
function RegBadge({ value }) {
  const b = REG_BADGE[value] ?? { label: value, cls: 'bg-gray-100 text-gray-500' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${b.cls}`}>{b.label}</span>;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Widget DB ── */
function DbWidget({ dbStatus }) {
  const expectedTables = 8;
  const isComplete = dbStatus.tables?.length === expectedTables;
  return (
    <div className="bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 text-sm">Diagnostic base de données</h3>
        <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-xl border border-white shadow-sm">
          <div className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-bold text-gray-700">{dbStatus.connected ? 'Connecté' : 'Erreur'}</span>
        </div>
      </div>
      {dbStatus.connected ? (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white/40 rounded-xl p-3 border border-white/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Hôte</p>
            <p className="font-semibold text-gray-700 truncate">{dbStatus.host}</p>
          </div>
          <div className="bg-white/40 rounded-xl p-3 border border-white/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Base</p>
            <p className="font-semibold text-gray-700 truncate">{dbStatus.dbName}</p>
          </div>
          <div className={`rounded-xl p-3 border ${isComplete ? 'bg-green-50/60 border-green-200/50' : 'bg-orange-50/60 border-orange-200/50'}`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Tables</p>
            <p className={`font-bold ${isComplete ? 'text-green-700' : 'text-orange-600'}`}>
              {dbStatus.tables.length} / {expectedTables} {isComplete ? '✓' : '⚠'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-mono">
          {dbStatus.error}
        </div>
      )}
    </div>
  );
}

/* ── Dashboard admin ── */
export default function AdminHome({ firstname, isSysAdmin, adminData }) {
  const d = adminData ?? {};

  const totalIns  = Object.values(d.byRegStatus ?? {}).reduce((s, v) => s + v, 0);
  const validated = d.byRegStatus?.VALIDATED      ?? 0;
  const pending   = d.byRegStatus?.PENDING_REVIEW ?? 0;

  const regSegments = [
    { value: d.byRegStatus?.VALIDATED      ?? 0, color: '#22c55e' },
    { value: d.byRegStatus?.PENDING_REVIEW ?? 0, color: '#f59e0b' },
    { value: d.byRegStatus?.DRAFT          ?? 0, color: '#d1d5db' },
    { value: d.byRegStatus?.CANCELLED      ?? 0, color: '#ef4444' },
  ];
  const paySegments = [
    { value: d.byPayStatus?.PAID    ?? 0, color: '#22c55e' },
    { value: d.byPayStatus?.PARTIAL ?? 0, color: '#f59e0b' },
    { value: d.byPayStatus?.PENDING ?? 0, color: '#ef4444' },
  ];

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Bonjour, {firstname} !</h1>
        <p className="text-sm text-gray-500 mt-1">Voici un aperçu de l'activité.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Inscriptions" value={totalIns}
          sub={`${validated} validée${validated > 1 ? 's' : ''}`}
          color="bg-linear-to-br from-rose-400 to-red-500"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KpiCard label="En attente" value={pending} sub="à traiter"
          color="bg-linear-to-br from-amber-400 to-orange-500"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard label="Adhérents" value={d.memberCount ?? 0}
          color="bg-linear-to-br from-orange-400 to-amber-500"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <KpiCard label="Comptes" value={d.userCount ?? 0}
          color="bg-linear-to-br from-cyan-500 to-blue-600"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
      </div>

      {/* Graphiques + liste récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-600 mb-4">Statut des inscriptions</h3>
          <div className="flex items-center gap-4">
            <DonutChart segments={regSegments} size={90} />
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Validées',   color: '#22c55e', key: 'VALIDATED' },
                { label: 'En attente', color: '#f59e0b', key: 'PENDING_REVIEW' },
                { label: 'Brouillons', color: '#d1d5db', key: 'DRAFT' },
                { label: 'Annulées',   color: '#ef4444', key: 'CANCELLED' },
              ].map(s => (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-500">{s.label}</span>
                  <span className="ml-auto font-bold text-gray-700">{d.byRegStatus?.[s.key] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-600 mb-4">Statut des paiements</h3>
          <div className="flex items-center gap-4">
            <DonutChart segments={paySegments} size={90} />
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Payés',     color: '#22c55e', key: 'PAID' },
                { label: 'Partiels',  color: '#f59e0b', key: 'PARTIAL' },
                { label: 'Non payés', color: '#ef4444', key: 'PENDING' },
              ].map(s => (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-500">{s.label}</span>
                  <span className="ml-auto font-bold text-gray-700">{d.byPayStatus?.[s.key] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/55 border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-600">Dernières inscriptions</h3>
            <Link href="/admin/inscriptions" className="text-xs text-[#7b68ee] hover:underline font-medium">Voir tout</Link>
          </div>
          <div className="space-y-1 flex-1">
            {(d.recent ?? []).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Aucune inscription</p>
            )}
            {(d.recent ?? []).map(ins => (
              <Link key={ins.id} href={`/admin/inscriptions/${ins.id}`}
                className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/60 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate group-hover:text-[#7b68ee] transition-colors">
                    {ins.first_name} {ins.last_name}
                  </p>
                  <p className="text-[10px] text-gray-400">{fmtDate(ins.created_at)}</p>
                </div>
                <RegBadge value={ins.registration_status} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* DB widget (SYS_ADMIN) */}
      {isSysAdmin && d.dbStatus && <DbWidget dbStatus={d.dbStatus} />}

    </div>
  );
}
