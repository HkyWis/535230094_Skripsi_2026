'use client';

import { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../helpers/item-beranda';
import {
  Phone, MessageSquare, MapPin, Clock,
  Send, CheckCircle, Building
} from 'lucide-react';

import { JenisLaptopData, getJenisLaptopsPublic } from '../lib/masterdata';

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    laptopModel: '',
    issue: '',
  });
  const [laptopName, setLaptopName] = useState('');
  const [jenisLaptopList, setJenisLaptopList] = useState<JenisLaptopData[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [errorMaster, setErrorMaster] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.issue) return;

    const message = `Halo Z-Tech, saya ${formData.name} (${formData.phone}). Model laptop: ${laptopName || '-'}. Keluhan: ${formData.issue}`; window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');

    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  useEffect(() => {
    const fetchMaster = async () => {
      setLoadingMaster(true);
      setErrorMaster('');
      try {
        const laptops = await getJenisLaptopsPublic();
        setJenisLaptopList(laptops);
      } catch (err) {
        setErrorMaster(err instanceof Error ? err.message : 'Gagal memuat master data');
      } finally {
        setLoadingMaster(false);
      }
    };

    fetchMaster();
  }, []);

  return (
    <section id="kontak" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Hubungi Teknisi &amp; Lokasi Store</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Konsultasi Gratis &amp; Lokasi Toko Kami
          </h2>
          <p className="text-base text-slate-500">
            Punya pertanyaan mengenai kendala laptop Anda? Datang langsung ke workshop kami atau konsultasi cepat via WhatsApp.
          </p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Card*/}
          <div className="lg:col-span-7 bg-sky-50 border border-sky-100 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-500" />
                Formulir Konsultasi
              </h3>
              <p className="text-xs text-slate-500">
                Isi form di bawah untuk terhubung langsung dengan teknisi kami via WhatsApp.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <span>Pesan berhasil dikirim! Anda sedang dialihkan ke WhatsApp teknisi FixTech.</span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-white border border-sky-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-300/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">No. WhatsApp / HP *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="085255881278"
                      className="w-full bg-white border border-sky-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-300/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <select
                    required
                    value={laptopName}
                    onChange={(e) => setLaptopName(e.target.value)}
                    disabled={loadingMaster}
                    className="w-full bg-white border border-sky-200 rounded-xl px-4 py-3 text-xs text-slate-600 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-300/30"
                  >
                    <option value="">
                      {loadingMaster ? 'Memuat data laptop...' : '-- Pilih laptop --'}
                    </option>
                    {jenisLaptopList.map((l) => (
                      <option key={l.laptop_id} value={l.laptop_name}>
                        {l.laptop_name}
                      </option>
                    ))}
                  </select>
                  {errorMaster && (
                    <p className="text-[11px] text-rose-600">{errorMaster}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Deskripsikan Keluhan Laptop</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    placeholder="Contoh: Laptop mati total setelah kena air, lampu indikator charger mati..."
                    className="w-full bg-white border border-sky-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-300/30"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-300/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Pesan Konsultasi via WhatsApp</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Card*/}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-sky-100 pb-3">
                <Building className="w-5 h-5 text-sky-500" />
                Informasi Kontak &amp; Jam Kerja
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Alamat:</span>
                    <span className="text-slate-700 leading-relaxed font-medium block">{CONTACT_INFO.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Telepon &amp; WhatsApp CS:</span>
                    <span className="text-slate-700 font-mono font-medium block">{CONTACT_INFO.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Jam Operasional:</span>
                    <span className="text-amber-600 font-medium block">{CONTACT_INFO.operatingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="relative bg-sky-50 border border-sky-100 rounded-2xl p-4 overflow-hidden space-y-3 shadow-sm">
              <div className="h-30 w-full rounded-xl bg-white relative overflow-hidden border border-sky-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#7dd3fc_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <div className="relative z-10 text-center space-y-2 p-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 border border-rose-300 text-rose-500 flex items-center justify-center animate-bounce">
                    <MapPin className="w-5 h-5 fill-rose-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 block">Z-Tech Laptop Repair Store</span>
                  <span className="text-[10px] text-slate-400 block">Klik tombol di bawah untuk membuka navigasi rute Google Maps</span>
                </div>
              </div>

              <a
                href={CONTACT_INFO.googleMapsEmbed}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 border border-sky-200 transition cursor-pointer hover:text-sky-600"
              >
                <MapPin className="w-4 h-4 text-sky-500" />
                <span>Buka Petunjuk Rute Google Maps &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
