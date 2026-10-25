'use client';

import { ADVANTAGES } from '../helpers/item-beranda';
import { Award, ShieldCheck, Clock, Search, CheckCircle2, Zap, Star } from 'lucide-react';

export default function Advantages() {
  const getAdvantageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return <Award className="w-6 h-6 text-sky-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case 'Clock': return <Clock className="w-6 h-6 text-amber-500" />;
      case 'Search': return <Search className="w-6 h-6 text-indigo-500" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-6 h-6 text-cyan-500" />;
      case 'Zap': return <Zap className="w-6 h-6 text-yellow-500" />;
      default: return <ShieldCheck className="w-6 h-6 text-sky-500" />;
    }
  };

  return (
    <section id="keunggulan" className="py-24 bg-sky-50 relative overflow-hidden border-t border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-emerald-500" />
            <span>Alasan Pelanggan Memilih Kami</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Keunggulan Service Laptop di Z-Tech
          </h2>
          <p className="text-base text-slate-500">
            Kami mengutamakan kejujuran, transparansi biaya, ketepatan estimasi waktu, serta rasa aman untuk semua unit laptop yang Anda percayakan.
          </p>
        </div>
        {/* Advantages */}
        <div className="flex flex-wrap justify-center gap-8">
          {ADVANTAGES.map((adv) => (
            <div
              key={adv.id}
              className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] relative p-7 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition-all duration-300 group space-y-4 shadow-sm hover:shadow-md hover:shadow-sky-100 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center group-hover:scale-110 transition duration-300">
                  {getAdvantageIcon(adv.iconName)}
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[11px] font-semibold">
                  {adv.badge}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                  {adv.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
