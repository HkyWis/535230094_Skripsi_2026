'use client';

import Navbar from './beranda/Navbar';
import Hero from './beranda/Hero';
import Services from './beranda/Services';
import Advantages from './beranda/Advantages';
import Contact from './beranda/Contact';
import Footer from './beranda/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800 overflow-x-hidden">
      {/* Navigasi */}
      <Navbar />

      {/* Beranda */}
      <main className="flex-1">
        <Hero />
        <Services />
        <Advantages />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
