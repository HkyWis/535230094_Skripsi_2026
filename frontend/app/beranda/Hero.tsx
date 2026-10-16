'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Zap, ArrowRight, Sparkles, CheckCircle, X } from 'lucide-react';

export default function Hero() {
  const router = useRouter();
  const [ticketInput, setTicketInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) {
      setErrorMsg('Masukkan nomor tiket Anda (contoh: TK-8812)');
      return;
    }
    setErrorMsg('');
    router.push(`/pencarian-tiket?code=${encodeURIComponent(ticketInput.trim().toUpperCase())}`);
  };

  return (
    <section id="beranda" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Card */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-sky-600 text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>Pusat Servis Laptop Z</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-[1.15]">
              Laptop Bermasalah? <br />
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Perbaikan Cepat &amp; Transparan
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl font-normal">
              Layanan perbaikan profesional untuk Mati Total, Layar Pecah, Kena Air, Upgrade SSD/RAM, hingga Deep Cleaning. Cek perkembangan perbaikan laptop Anda secara real-time.
            </p>

            {/* Search Tiket */}
            <div className="w-full max-w-xl bg-white border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-xl shadow-sky-100/60 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 text-sky-600 font-semibold">
                  <Search className="w-3.5 h-3.5" />
                  Cek Status Servis Laptop
                </span>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => {
                      setTicketInput(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Masukkan No. Tiket (Contoh: TK-8812)..."
                    className="w-full bg-sky-50 text-slate-800 placeholder-slate-400 text-sm font-mono px-4 py-3.5 rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20 transition-all uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Cari Tiket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Cek Unit 100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Pelacakan Tiket Real Time</span>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white border border-sky-100 rounded-2xl p-6 shadow-2xl shadow-sky-100/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <X className="w-4 h-4"/>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-600 text-[11px] font-semibold">
                    LIVE STATUS
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">No. Tiket: TK-8812</span>
                      <h3 className="text-base font-bold text-slate-800 mt-0.5">Laptop A</h3>
                      <p className="text-xs text-slate-400">Overheat &amp; Fan Berisik</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold">
                      Dalam Perbaikan
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Kemajuan Perbaikan</span>
                      <span className="text-sky-600 font-bold">65%</span>
                    </div>
                    <div className="w-full h-2.5 bg-sky-50 rounded-full overflow-hidden border border-sky-100">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full w-[65%] transition-all duration-500"></div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Diagnostik Thermal Camera Selesai</span>
                    </div>
                    <div className="flex items-center gap-2 text-sky-600 font-medium">
                      <Zap className="w-3.5 h-3.5 shrink-0 text-sky-500 animate-spin" />
                      <span>Penggantian Liquid Metal &amp; Cleaning Dual Fan</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Estimasi Biaya:</span>
                      <span className="text-slate-800 font-bold">Rp 275.000</span>
                    </div>
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-sky-100">
                      &quot;Suhu CPU turun dari 96°C ke 71°C. Pengujian QC 24 jam.&quot;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
