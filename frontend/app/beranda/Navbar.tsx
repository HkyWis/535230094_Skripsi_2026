'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laptop, Search, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm shadow-sky-100/60 py-3.5'
        : 'bg-white/80 backdrop-blur-sm py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-400/30 group-hover:scale-105 transition-transform duration-200">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                Z-Tech
              </span>
              <span className="text-[10px] text-sky-500 font-medium tracking-wider uppercase">Pusat Servis Laptop</span>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center space-x-2 bg-sky-50 p-1.5 rounded-full border border-sky-200">
            <Link
              href="/"
              className="px-5 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-white transition-all"
            >
              Beranda
            </Link>
            <Link
              href="/pencarian-tiket"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-sm shadow-sky-400/30 flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Pencarian Tiket</span>
            </Link>
          </nav>

          {/* Tombol Akses Cek Tiket */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/pencarian-tiket"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all shadow-sm shadow-sky-400/30"
            >
              <Search className="w-4 h-4" />
              <span>Cek Tiket</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/pencarian-tiket"
              className="p-2 rounded-lg bg-sky-100 text-sky-600 border border-sky-200"
              title="Cek Tiket"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-sky-100 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600"
            >
              Beranda
            </Link>
            <Link
              href="/pencarian-tiket"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-base font-semibold text-sky-600 bg-sky-50"
            >
              Pencarian Tiket
            </Link>
          </div>

          <div className="pt-3 border-t border-sky-100 flex flex-col gap-2">
            <Link
              href="/pencarian-tiket"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status Tiket Servis</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
