'use client';

import { REPAIR_SERVICES } from '../helpers/item-beranda';
import {
  Cpu, Monitor, Keyboard, Thermometer, Droplets, HardDrive, Sparkles
} from 'lucide-react';

export default function Services() {

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-6 h-6 text-sky-500" />;
      case 'Monitor': return <Monitor className="w-6 h-6 text-indigo-500" />;
      case 'Keyboard': return <Keyboard className="w-6 h-6 text-amber-500" />;
      case 'Thermometer': return <Thermometer className="w-6 h-6 text-rose-500" />;
      case 'Droplets': return <Droplets className="w-6 h-6 text-cyan-500" />;
      case 'HardDrive': return <HardDrive className="w-6 h-6 text-emerald-500" />;
      default: return <Cpu className="w-6 h-6 text-sky-500" />;
    }
  };

  return (
    <section id="layanan" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Layanan Perbaikan Lengkap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Jenis Perbaikan Laptop &amp; Layanan Spesialis
          </h2>
          <p className="text-base text-slate-500">
            Dikerjakan oleh teknisi ahli menggunakan peralatan presisi tinggi dan sparepart original.
          </p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPAIR_SERVICES.map((service) => (
            <div
              key={service.id}
              className="group relative bg-sky-50 hover:bg-white border border-sky-100 hover:border-sky-300 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-sky-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-sky-100 flex items-center justify-center group-hover:scale-110 group-hover:border-sky-300 transition-all shadow-sm">
                  {getServiceIcon(service.iconName)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
