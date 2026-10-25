'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../beranda/Navbar';
import Footer from '../beranda/Footer';
import { CONTACT_INFO } from '../helpers/item-beranda';
import { getDataService, DataServiceItem } from '../lib/dataservice';
import {
  Search, CheckCircle2, Clock, Wrench, ShieldCheck, AlertCircle,
  MessageSquare, FileText, User, Laptop, Calendar, CheckSquare, Loader2
} from 'lucide-react';
import { show, rupiah, getKeluhan, getActiveKeluhan, getStep, ymd, parseTanggal, addHariKerja, getEstimasiSelesai } from '../helpers/item';


function TicketSearchContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';

  const [searchCode, setSearchCode] = useState(codeFromUrl.toUpperCase());
  const [searchedCode, setSearchedCode] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<DataServiceItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupTicket = useCallback(async (code: string) => {
    const upper = code.trim().toUpperCase();

    if (!upper) {
      setTicketData(null);
      setSearched(false);
      setError(null);
      setInputError('Nomor tiket tidak boleh kosong. Silakan masukkan nomor tiket Anda.');
      return;
    }

    setInputError(null);
    setSearchedCode(upper);   // simpan kode yang dicari
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const list = await getDataService();
      const found = list.find(
        (s) => (s.nomor_tiket_service ?? '').toUpperCase() === upper
      );
      setTicketData(found ?? null);
    } catch (err) {
      setTicketData(null);
      setError(err instanceof Error ? err.message : 'Gagal memuat data tiket');
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupTicket(searchCode);
  };

  // Auto-cari kalau ada ?code= di URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const upper = code.trim().toUpperCase();
      setSearchCode(upper);
      lookupTicket(upper);
    }
  }, [searchParams, lookupTicket]);

  const getWhatsAppLink = (ticketCode?: string, laptop?: string) => {
    const text = encodeURIComponent(
      `Halo Z-Tech, saya ingin menanyakan status servis laptop dengan Nomor Tiket: ${ticketCode || searchCode} (${laptop || 'Unit Servis'})`
    );
    return `https://wa.me/${CONTACT_INFO.whatsapp}?text=${text}`;
  };

  const step = ticketData ? getStep(ticketData.status_service) : 1;
  const keluhan = ticketData ? getKeluhan(ticketData) : null;
  const keluhanAktif = ticketData ? getActiveKeluhan(ticketData) : [];
  const estimasi = ticketData ? getEstimasiSelesai(ticketData) : { text: '-', pasti: false };
  const garansiAktif = ['active', 'aktif'].includes(
    (ticketData?.status_garansi ?? '').toLowerCase()
  );

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800 font-sans">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-wider">
                <Search className="w-3.5 h-3.5" />
                <span>Pencarian Tiket Perbaikan Real-Time</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                Lacak Status Servis Laptop Anda
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-sm shadow-sky-100/50">
            <form onSubmit={handleSearchSubmit} noValidate>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => {
                    setSearchCode(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Masukkan Nomor Tiket Anda..."
                  aria-invalid={!!inputError}
                  className={`flex-1 w-full bg-sky-50 text-slate-800 placeholder-slate-400 text-sm font-mono font-bold px-5 py-4 rounded-2xl border focus:outline-none focus:ring-2 uppercase transition ${inputError
                      ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                      : 'border-sky-200 focus:border-sky-400 focus:ring-sky-400/20'
                    }`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-sky-400/25 flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Cari Status Tiket</span>
                </button>
              </div>

              {inputError && (
                <p className="mt-3 ml-1 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{inputError}</span>
                </p>
              )}
            </form>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-12 text-center bg-white border border-sky-100 rounded-3xl shadow-sm">
              <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Mencari tiket...
              </span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-12 text-center bg-white border border-rose-100 rounded-3xl space-y-3 shadow-sm">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Terjadi Kesalahan</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={() => lookupTicket(searchedCode)}
                className="text-xs font-semibold text-sky-600 underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Ticket Result Card */}
          {!loading && !error && ticketData && (
            <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-sm shadow-sky-100/50 space-y-6">

              {/* 1. Header Tiket */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 font-mono text-xs font-extrabold tracking-wider">
                      NO TIKET: {ticketData.nomor_tiket_service}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border ${garansiAktif
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Garansi: {show(ticketData.status_garansi)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-800 mt-2 flex items-center gap-2">
                    <Laptop className="w-6 h-6 text-sky-500 shrink-0" />
                    <span>{show(ticketData.jenis_laptop?.laptop_name)}</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Serial Number (SN): <span className="text-slate-600 font-bold">{show(ticketData.laptop_sn)}</span>
                  </p>
                </div>

                <div>
                  {step === 3 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      STEP 3: SELESAI &amp; SIAP DIAMBIL
                    </span>
                  ) : step === 2 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold shadow-xs">
                      <Wrench className="w-4 h-4 text-amber-600 animate-spin" />
                      STEP 2: DALAM PROSES PERBAIKAN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-100 border border-sky-300 text-sky-800 text-xs font-extrabold shadow-xs">
                      <Clock className="w-4 h-4 text-sky-600" />
                      STEP 1: PEMERIKSAAN &amp; DIAGNOSTIK
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Pelanggan</span>
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <User className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{show(ticketData.customer?.customer_name)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Jenis Service</span>
                  <div className="font-bold text-sky-700 text-sm pt-1">
                    {show(ticketData.jenis_service?.jenis_service)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Tanggal Masuk</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm pt-1">
                    <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{show(ticketData.tanggal_masuk)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                    {estimasi.pasti ? 'Tanggal Selesai' : 'Estimasi Selesai'}
                  </span>
                  <div className="flex items-center gap-1.5 text-sky-700 font-bold text-sm pt-1">
                    <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{estimasi.text}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {estimasi.pasti
                      ? 'Sudah selesai'
                      : ticketData.estimasi_hari != null
                        ? `Perkiraan ${ticketData.estimasi_hari} hari kerja (Senin–Jumat)`
                        : 'Belum Pasti'}
                  </span>

                  {!estimasi.pasti && estimasi.text !== '-' && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-2 text-[11px] text-amber-700 leading-snug">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>
                        Ini hanya estimasi dan bisa berubah. Hubungi teknisi jika melebihi tanggal ini.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Detail Kerusakan & Keluhan */}
              <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-500" />
                    <span>Kerusakan &amp; Detail Keluhan Pelanggan</span>
                  </h4>
                  {ticketData.kategori_kerusakan && (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold">
                      {ticketData.kategori_kerusakan}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 block">Deskripsi Rinci Keluhan:</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-sky-100 font-medium">
                    &quot;{show(keluhan?.keluhan)}&quot;
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
                    <span>Keluhan Terdeteksi:</span>
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {keluhanAktif.length > 0 ? (
                      keluhanAktif.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500 text-white text-xs font-bold shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Tidak ada keluhan khusus yang terdeteksi aktif.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Solusi, Teknisi & Biaya */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                <div className="lg:col-span-7 p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-sky-500" />
                      <span>Solusi Perbaikan</span>
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">
                      Teknisi: <strong className="text-slate-800">{show(ticketData.users?.username)}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-sky-100 font-medium">
                    &quot;{ticketData.solusi || 'Belum ada catatan solusi dari teknisi.'}&quot;
                  </p>
                </div>

                <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-sky-200 space-y-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-3">
                    <div className="pt-1 border-t border-sky-100">
                      <span className="text-xs text-slate-500 font-bold block">Estimasi Biaya Pengerjaan:</span>
                      <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
                        {rupiah(ticketData.harga)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        Termasuk Jasa, Pengecekan, &amp; Garansi Perbaikan
                      </span>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppLink(
                      ticketData.nomor_tiket_service,
                      ticketData.jenis_laptop?.laptop_name
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-sky-400/25 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Hubungi Teknisi via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tidak ditemukan */}
          {!loading && !error && !ticketData && searched && (
            <div className="p-12 text-center bg-white border border-sky-100 rounded-3xl space-y-4 shadow-sm">
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800">Tiket &quot;{searchedCode}&quot; Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan periksa kembali kode tiket Anda atau hubungi kami jika masih mengalami kendala.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TicketSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sky-50 text-slate-800 flex items-center justify-center text-sm font-bold">
        Memuat Halaman Pencarian Tiket...
      </div>
    }>
      <TicketSearchContent />
    </Suspense>
  );
}