'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Ticket, Wrench, Search, Eye, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, TrendingUp, Laptop, CalendarDays, Clock
} from 'lucide-react';
import { getDataService, DataServiceItem } from '@/app/lib/dataservice';
import { show, rupiah, getActiveKeluhan, getStep, ymd, parseTanggal, addHariKerja, isEstimasiHariIni } from '@/app/helpers/item';

/* ===================== Helpers ===================== */

const getDueDate = (item: DataServiceItem): Date | null => {
  const done = parseTanggal(item.tanggal_selesai);
  if (done) return done;
  const masuk = parseTanggal(item.tanggal_masuk);
  if (masuk && item.estimasi_hari != null) {
    return addHariKerja(masuk, Number(item.estimasi_hari));
  }
  return null;
};


const countBy = (labels: string[]): { label: string; value: number }[] => {
  const map = new Map<string, number>();
  labels.forEach((l) => map.set(l, (map.get(l) ?? 0) + 1));
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DEFAULT_RANGE_DAYS = 7;
const MAX_DAILY_BUCKETS = 92;

const toDate = (s: string): Date => new Date(`${s}T00:00:00`);

const daysAgo = (n: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return ymd(d);
};

const formatTgl = (s: string): string => {
  const d = toDate(s);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

const diffDays = (from: string, to: string): number =>
  Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000) + 1;

type Preset = { key: string; label: string; range: () => { from: string; to: string } };

const PRESETS: Preset[] = [
  { key: 'today', label: 'Hari Ini', range: () => ({ from: daysAgo(0), to: daysAgo(0) }) },
  { key: '7d', label: '7 Hari', range: () => ({ from: daysAgo(6), to: daysAgo(0) }) },
  { key: '30d', label: '30 Hari', range: () => ({ from: daysAgo(29), to: daysAgo(0) }) },
  {
    key: 'month',
    label: 'Bulan Ini',
    range: () => {
      const n = new Date();
      return { from: ymd(new Date(n.getFullYear(), n.getMonth(), 1)), to: daysAgo(0) };
    },
  },
  {
    key: 'year',
    label: 'Tahun Ini',
    range: () => ({ from: ymd(new Date(new Date().getFullYear(), 0, 1)), to: daysAgo(0) }),
  },
];

type TrendBucket = { key: string; label: string; value: number; isCurrent: boolean };

const buildTrend = (items: DataServiceItem[], from: string, to: string): TrendBucket[] => {
  const start = toDate(from);
  const end = toDate(to);
  const todayStr = ymd(new Date());
  const total = diffDays(from, to);
  let buckets: TrendBucket[] = [];

  if (total > MAX_DAILY_BUCKETS) {
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const thisMonthKey = todayStr.slice(0, 7);
    while (cur <= end) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({
        key,
        label: `${BULAN[cur.getMonth()]} ${String(cur.getFullYear()).slice(2)}`,
        value: 0,
        isCurrent: key === thisMonthKey,
      });
      cur.setMonth(cur.getMonth() + 1);
    }
  } else {
    const cur = new Date(start);
    while (cur <= end) {
      const key = ymd(cur);
      const label =
        total <= 7
          ? HARI[cur.getDay()]
          : `${String(cur.getDate()).padStart(2, '0')}/${String(cur.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({ key, label, value: 0, isCurrent: key === todayStr });
      cur.setDate(cur.getDate() + 1);
    }
  }

  items.forEach((s) => {
    const tgl = (s.tanggal_masuk ?? '').slice(0, 10);
    const slot = buckets.find((b) => tgl.slice(0, b.key.length) === b.key);
    if (slot) slot.value += 1;
  });
  return buckets;
};

/* Komponen Card */
function BarList({
  items, barClass = 'bg-sky-500', empty = 'Belum ada data',
}: { items: { label: string; value: number }[]; barClass?: string; empty?: string }) {
  if (items.length === 0) return <p className="text-xs text-slate-400 py-4 text-center">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value));
  const scrollable = items.length > 4;
  return (
    <div className={`space-y-2.5 ${scrollable ? 'max-h-36 overflow-y-auto pr-2' : ''}`}>
      {items.map((it) => (
        <div key={it.label}>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-700 truncate pr-2">{it.label}</span>
            <span className="font-bold text-slate-500">{it.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-sky-50 overflow-hidden">
            <div
              className={`h-full rounded-full ${barClass} transition-all duration-500`}
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({
  title, subtitle, icon, children, className = '',
}: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-sky-100 rounded-2xl p-5 shadow-sm shadow-sky-100/60 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        {icon && <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">{icon}</div>}
      </div>
      {children}
    </div>
  );
}

function StepBadge({ step }: { step: 1 | 2 | 3 }) {
  const cfg = {
    1: ['Diagnostik', 'bg-sky-50 text-sky-700 border-sky-200'],
    2: ['Perbaikan', 'bg-amber-50 text-amber-700 border-amber-200'],
    3: ['Selesai', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
  }[step];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-xl border text-[11px] font-bold ${cfg[1]}`}>
      {cfg[0]}
    </span>
  );
}

/* Halaman */

export default function DashboardPage() {
  const [services, setServices] = useState<DataServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [filterEstimasiHariIni, setFilterEstimasiHariIni] = useState<boolean>(false);
  const PAGE_SIZES = [5, 10, 25, 50];
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(() => daysAgo(DEFAULT_RANGE_DAYS - 1));
  const [endDate, setEndDate] = useState<string>(() => daysAgo(0));

  const rangeLabel =
    startDate === endDate ? formatTgl(startDate) : `${formatTgl(startDate)} – ${formatTgl(endDate)}`;
  const rangeDays = diffDays(startDate, endDate);

  const onChangeStart = (v: string) => {
    if (!v) return;
    setStartDate(v);
    if (v > endDate) setEndDate(v);
  };

  const onChangeEnd = (v: string) => {
    if (!v) return;
    setEndDate(v);
    if (v < startDate) setStartDate(v);
  };

  const applyPreset = (p: Preset) => {
    const { from, to } = p.range();
    setStartDate(from);
    setEndDate(to);
  };

  const activePreset = PRESETS.find((p) => {
    const r = p.range();
    return r.from === startDate && r.to === endDate;
  })?.key;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setServices(await getDataService());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStep, filterEstimasiHariIni, startDate, endDate, pageSize]);


  const periodServices = useMemo(() => {
    return services.filter((s) => {
      const d = (s.tanggal_masuk ?? '').slice(0, 10);
      return d >= startDate && d <= endDate;
    });
  }, [services, startDate, endDate]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = periodServices;
    const withStep = data.map((s) => ({ s, step: getStep(s.status_service) }));
    const count = (n: number) => withStep.filter((x) => x.step === n).length;

    const revenueDone = withStep
      .filter((x) => x.step === 3)
      .reduce((sum, x) => sum + (Number(x.s.harga) || 0), 0);
    const revenuePending = withStep
      .filter((x) => x.step !== 3)
      .reduce((sum, x) => sum + (Number(x.s.harga) || 0), 0);

    const overdue = withStep
      .filter((x) => {
        if (x.step === 3) return false;
        const due = getDueDate(x.s);
        return due !== null && due < today;
      })
      .map((x) => x.s);

    const trend = buildTrend(data, startDate, endDate);

    const garansiAktif = data.filter((s) =>
      ['active', 'aktif'].includes((s.status_garansi ?? '').toLowerCase())
    ).length;

    const estList = data.map((s) => Number(s.estimasi_hari)).filter((n) => !Number.isNaN(n) && n > 0);
    const avgEstimasi = estList.length ? estList.reduce((a, b) => a + b, 0) / estList.length : 0;

    return {
      total: data.length,
      s1: count(1), s2: count(2), s3: count(3),
      revenueDone, revenuePending,
      overdue, trend,
      trendTotal: trend.reduce((a, b) => a + b.value, 0),
      garansiAktif, garansiNon: data.length - garansiAktif,
      avgEstimasi,
      topKeluhan: countBy(data.flatMap(getActiveKeluhan)),
      topKategori: countBy(
        data.map((s) => s.kategori_kerusakan).filter((x): x is string => !!x)
      ).slice(0, 5),
      topLaptop: countBy(
        data.map((s) => s.jenis_laptop?.laptop_name).filter((x): x is string => !!x)
      ),
      jenisService: countBy(
        data.map((s) => s.jenis_service?.jenis_service).filter((x): x is string => !!x)
      ).slice(0, 5),
      teknisi: countBy(
        withStep.filter((x) => x.step !== 3).map((x) => x.s.users?.username).filter((x): x is string => !!x)
      ).slice(0, 5),
    };
  }, [periodServices, startDate, endDate]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return periodServices.filter((s) => {
      const match =
        (s.nomor_tiket_service ?? '').toLowerCase().includes(q) ||
        (s.customer?.customer_name ?? '').toLowerCase().includes(q) ||
        (s.jenis_laptop?.laptop_name ?? '').toLowerCase().includes(q);
      const matchStep = filterStep === 'all' || getStep(s.status_service).toString() === filterStep;
      const matchEstimasiHariIni = !filterEstimasiHariIni || isEstimasiHariIni(s);
      return match && matchStep && matchEstimasiHariIni;
    });
  }, [periodServices, searchQuery, filterStep, filterEstimasiHariIni]);


  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paged = useMemo(
    () => filtered.slice(startIdx, startIdx + pageSize),
    [filtered, startIdx, pageSize]
  );
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pageSize, filtered.length);

  const pct = (n: number) => (stats.total ? (n / stats.total) * 100 : 0);
  const maxDay = Math.max(1, ...stats.trend.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Welcome & Filter Kalender */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm inline-block">
              Welcome Admin Z-Tech
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard &amp; Monitoring Service
            </h1>
            <p className="text-xs text-white/80 font-medium">
              Periode: {rangeLabel} ({rangeDays} hari)
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-white/15 backdrop-blur-sm rounded-2xl p-3 self-start lg:self-auto">
            {/* Kalender mulai - akhir */}
            <div className="flex flex-wrap items-center gap-2">
              <CalendarDays className="w-4 h-4 text-white/80" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => onChangeStart(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                aria-label="Tanggal mulai"
                className="bg-white text-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
              />
              <span className="text-xs font-semibold text-white/80">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onChangeEnd(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                aria-label="Tanggal akhir"
                className="bg-white text-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
              />
            </div>

            {/* Aksi Cepat */}
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${activePreset === p.key
                    ? 'bg-white text-sky-700 shadow'
                    : 'text-white/90 bg-white/10 hover:bg-white/20'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </span>
          <button onClick={loadData} className="underline cursor-pointer">Coba lagi</button>
        </div>
      )}

      {/* Line 1: Total Tiket dan Pipeline Service */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Tiket Servis', value: stats.total, color: 'text-slate-800', sub: `Tiket masuk ${rangeLabel}`, icon: <Ticket className="w-4 h-4" />, tone: 'bg-sky-50 text-sky-600 border-sky-100' },
        ].map((k) => (
          <div key={k.label} className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm shadow-sky-100/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{k.label}</span>
              <div className={`p-2 rounded-xl border ${k.tone}`}>{k.icon}</div>
            </div>
            <div className={`text-3xl font-extrabold ${k.color}`}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : k.value}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{k.sub}</span>
          </div>
        ))}

        <Panel
          title="Pipeline Service"
          subtitle="Tahap pengerjaan service"
          icon={<TrendingUp className="w-4 h-4" />}
          className="lg:col-span-2"
        >
          <div className="flex h-4 rounded-full overflow-hidden bg-sky-50">
            <div className="bg-sky-400 transition-all duration-500" style={{ width: `${pct(stats.s1)}%` }} />
            <div className="bg-amber-400 transition-all duration-500" style={{ width: `${pct(stats.s2)}%` }} />
            <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${pct(stats.s3)}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            {[
              ['Diagnostik', stats.s1, 'bg-sky-400'],
              ['Perbaikan', stats.s2, 'bg-amber-400'],
              ['Selesai', stats.s3, 'bg-emerald-500'],
            ].map(([label, val, dot]) => (
              <div key={label as string} className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${dot}`} /> {label}
                </div>
                <div className="text-xl font-extrabold text-slate-800">{val as number}</div>
                <div className="text-[10px] text-slate-400">{pct(val as number).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Line 2: Tiket Masuk, Top Keluhan, dan Top Laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          title="Tiket Masuk"
          subtitle={`${stats.trendTotal} tiket • ${rangeLabel}`}
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <div className="max-h-44 overflow-y-auto pr-2 space-y-2">
            {stats.trend.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span
                  className={`w-12 shrink-0 text-[11px] font-semibold ${d.isCurrent ? 'text-sky-600' : 'text-slate-400'}`}
                >
                  {d.label}
                </span>

                <div className="flex-1 h-3 rounded-full bg-sky-50 overflow-hidden">
                  <div
                    title={`${d.label}: ${d.value} tiket`}
                    className={`h-full rounded-full transition-all duration-500 ${d.isCurrent
                      ? 'bg-gradient-to-r from-sky-500 to-blue-500'
                      : 'bg-sky-300'
                      }`}
                    style={{ width: `${Math.max((d.value / maxDay) * 100, d.value ? 4 : 0)}%` }}
                  />
                </div>

                <span className="w-6 shrink-0 text-right text-[11px] font-bold text-slate-500">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Keluhan Terbanyak" subtitle="Dari 18 kategori keluhan" icon={<Wrench className="w-4 h-4" />}>
          <BarList items={stats.topKeluhan} barClass="bg-gradient-to-r from-sky-400 to-blue-500" />
        </Panel>

        <Panel title="Laptop Terbanyak" subtitle="Model yang sering masuk" icon={<Laptop className="w-4 h-4" />}>
          <BarList items={stats.topLaptop} barClass="bg-gradient-to-r from-indigo-400 to-violet-500" />
        </Panel>
      </div>

      {/* Line 3: Tabel */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm shadow-sky-100/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Tiket Servis</h2>
            <p className="text-xs text-slate-500">
              Tiket masuk {rangeLabel} ({filtered.length} tiket)
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">Pencarian</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tiket / nama / model..."
                  className="bg-slate-50 border border-sky-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">Filter Status</label>
              <select
                value={filterStep}
                onChange={(e) => setFilterStep(e.target.value)}
                className="bg-slate-50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="all">Semua Status (3 Step)</option>
                <option value="1">Step 1 - Diagnostik</option>
                <option value="2">Step 2 - Perbaikan</option>
                <option value="3">Step 3 - Selesai</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFilterEstimasiHariIni((prev) => !prev)}
              aria-pressed={filterEstimasiHariIni}
              className={`group relative px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-2 select-none active:scale-[0.98] ${filterEstimasiHariIni
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/25 ring-2 ring-sky-400/30'
                : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:bg-sky-50/60 hover:text-sky-700 shadow-2xs'
                }`}
              title="Klik untuk filter tiket dengan estimasi selesai hari ini"
            >
              <Clock
                className={`w-3.5 h-3.5 transition-colors duration-200 ${filterEstimasiHariIni ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'
                  }`}
              />
              <span>Estimasi Hari Ini</span>
              <span
                className={`inline-flex items-center w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ${filterEstimasiHariIni ? 'bg-sky-400/40' : 'bg-slate-200 group-hover:bg-sky-100'
                  }`}
              >
                <span
                  className={`w-3 h-3 rounded-full transition-transform duration-200 transform shadow-xs ${filterEstimasiHariIni
                    ? 'translate-x-3 bg-white'
                    : 'translate-x-0 bg-white group-hover:bg-sky-500'
                    }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[28rem] overflow-y-auto rounded-xl border border-sky-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-sky-50 text-slate-700 uppercase text-[11px] font-bold border-b border-sky-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tiket</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Model Laptop</th>
                <th className="px-4 py-3">Tanggal Masuk</th>
                <th className="px-4 py-3">Estimasi Hari</th>
                <th className="px-4 py-3">Biaya</th>
                <th className="px-4 py-3">Status Progress</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memuat data...
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {filterEstimasiHariIni
                      ? 'Tidak ada tiket dengan estimasi selesai hari ini pada rentang tanggal ini.'
                      : 'Tidak ada tiket servis pada rentang tanggal ini.'}
                  </td>
                </tr>
              ) : (
                paged.map((t, index) => {
                  const estHariIni = isEstimasiHariIni(t);
                  return (
                    <tr key={t.service_id} className={`hover:bg-sky-50/50 transition ${estHariIni ? 'bg-sky-50/30' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-sky-600 font-bold">{show(startIdx + index + 1)}</td>
                      <td className="px-4 py-3.5 font-mono text-sky-600 font-bold">
                        <div>{show(t.nomor_tiket_service)}</div>
                        {estHariIni && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Est. Hari Ini
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{show(t.customer?.customer_name)}</div>
                        <div className="text-[10px] text-slate-400">{show(t.customer?.no_telepon)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{show(t.jenis_laptop?.laptop_name)}</td>
                      <td className="px-4 py-3.5 text-slate-500">{show(t.tanggal_masuk)}</td>
                      <td className="px-4 py-3.5 text-slate-500">{show(t.estimasi_hari)} hari</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{rupiah(t.harga)}</td>
                      <td className="px-4 py-3.5"><StepBadge step={getStep(t.status_service)} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/data-service?tiket=${encodeURIComponent(t.nomor_tiket_service ?? '')}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold border border-sky-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Kelola</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-50 border border-sky-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>data</span>
            <span className="text-slate-400">
              • {showingFrom}–{showingTo} dari {filtered.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold border border-sky-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-sky-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <span className="text-xs font-semibold text-slate-600 px-2">
              Hal {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold border border-sky-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-sky-50"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}