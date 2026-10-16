'use client';

import Link from 'next/link';
import { Laptop, Phone, MapPin, ArrowUp } from 'lucide-react';
import { CONTACT_INFO } from '../helpers/item-beranda';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-800 text-slate-300 border-t border-slate-700 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand & About Column */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#beranda" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg text-white">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Z-Tech
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Pusat Servis Laptop</span>
              </div>
            </a>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Z-Tech adalah penyedia layanan servis laptop profesional spesialis perbaikan motherboard, ganti LCD, upgrade hardware, dan pemulihan data dengan garansi resmi dan pelacakan tiket real-time.
            </p>
          </div>

          {/* Nav Links Column 1 */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#beranda" className="hover:text-sky-400 transition">Beranda Utama</a>
              </li>
              <li>
                <Link href="/pencarian-tiket" className="hover:text-sky-400 transition">Pencarian Tiket Servis</Link>
              </li>
              <li>
                <a href="#layanan" className="hover:text-sky-400 transition">Katalog Jenis Perbaikan</a>
              </li>
              <li>
                <a href="#keunggulan" className="hover:text-sky-400 transition">Keunggulan Tempat Servis</a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-sky-400 transition">Lokasi Workshop</a>
              </li>
            </ul>
          </div>

          {/* Layanan Servis Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Layanan Spesialis</h4>
            <ul className="space-y-2 text-xs">
              <li>Perbaikan Motherboard</li>
              <li>Ganti Layar LCD/LED</li>
              <li>Perbaikan Keyboard &amp; Touchpad</li>
              <li>Perbaikan Overheat &amp; Kipas Rusak</li>
              <li>Liquid Damage Recovery</li>
              <li>Install OS &amp; Driver Original</li>
            </ul>
          </div>

          {/* Store Hours & Quick Support */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Jam Buka Workshop</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {CONTACT_INFO.operatingHours}
            </p>

            <div className="pt-2">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Halo CS Z-Tech, saya ingin konsultasi servis laptop.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Bantuan Cepat WhatsApp CS</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} Z-Tech Laptop Repair Center. Hak Cipta Dilindungi Undang-Undang.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Kembali ke atas"
            >
              <span className="text-[11px] font-medium">Kembali ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
