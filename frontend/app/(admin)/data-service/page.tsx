'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench, Plus, Database, ArrowUpRight, X, Loader2, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { getDataService, DataServiceItem, deleteDataService } from '@/app/lib/dataservice';
import ServiceFormModal from './modal';
import { getToken } from '@/app/lib/auth';
import Toast, { useToast } from '@/app/components/toast';
import { useConfirm } from '@/app/components/confirm';
import { show, rupiah, getKeluhan, getActiveKeluhan, isEstimasiHariIni } from '@/app/helpers/item';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-sky-50 last:border-0">
      <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-slate-800 text-right break-words">{value}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-sky-600 mb-1">{title}</h3>
      {children}
    </div>
  );
}

export default function DataServicePage() {
  const [services, setServices] = useState<DataServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [selected, setSelected] = useState<DataServiceItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DataServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [filterEstimasiHariIni, setFilterEstimasiHariIni] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { confirm, confirmDialog } = useConfirm();

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return services.filter((item) => {
      const matchStatus = statusFilter === 'Semua' || item.status_service === statusFilter;

      const matchSearch =
        !q ||
        (item.customer?.customer_name ?? '').toLowerCase().includes(q) ||
        (item.jenis_laptop?.laptop_name ?? '').toLowerCase().includes(q) ||
        (item.nomor_tiket_service ?? '').toLowerCase().includes(q);

      const matchEstimasiHariIni = !filterEstimasiHariIni || isEstimasiHariIni(item);

      return matchStatus && matchSearch && matchEstimasiHariIni;
    });
  }, [services, searchQuery, statusFilter, filterEstimasiHariIni]);

  const isFiltering = searchQuery.trim() !== '' || statusFilter !== 'Semua' || filterEstimasiHariIni;
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, filterEstimasiHariIni, pageSize]);


  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: DataServiceItem) => {
    setSelected(null);
    setEditing(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDataService();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    if (loading || services.length === 0) return;

    const code = new URLSearchParams(window.location.search).get('tiket');
    if (!code) return;

    const found = services.find((s) => s.nomor_tiket_service === code);
    if (found) setSelected(found);

    window.history.replaceState(null, '', window.location.pathname);
  }, [loading, services]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSuccess = (mode: 'create' | 'edit') => {
    if (mode === 'edit') showToast('edit', 'Data tiket berhasil diperbarui!');
    else showToast('create', 'Tiket berhasil disimpan dan masuk ke antrean pengerjaan!');
    loadServices();
  };

  const selKeluhan = selected ? getKeluhan(selected) : null;
  const selKeluhanList = selected ? getActiveKeluhan(selected) : [];

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (item: DataServiceItem) => {
    const ok = await confirm({
      title: 'Hapus Tiket',
      message: `Hapus tiket ${item.nomor_tiket_service}? Data pelanggan dan keluhannya ikut terhapus.`,
    });
    if (!ok) return;

    const token = getToken();
    if (!token) {
      showToast('error', 'Sesi login tidak ditemukan. Silakan login kembali.');
      return;
    }
    setDeletingId(item.service_id);
    try {
      await deleteDataService(token, item.service_id);
      setServices((prev) => prev.filter((s) => s.service_id !== item.service_id));
      if (selected?.service_id === item.service_id) setSelected(null);
      showToast('delete', `Tiket ${item.nomor_tiket_service} berhasil dihapus.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menghapus data service');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={hideToast} />
      {confirmDialog}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-600">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800">Data Service</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulir penerimaan unit laptop baru, input keluhan kerusakan, estimasi biaya, dan cetak tiket.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Service</span>
          </button>
        </div>
      </div>

      {/* Tabel Daftar Service */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-sm shadow-sky-100/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Data Servis</h2>
            <p className="text-xs text-slate-500">              {isFiltering
              ? `${filteredServices.length} dari ${services.length} Tiket`
              : `Total ${services.length} Tiket`}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Pelanggan / Laptop ...."
                className="w-full bg-slate-50 border border-sky-200 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-52 bg-slate-50 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Diagnostik">Diagnostik</option>
              <option value="Perbaikan">Perbaikan</option>
              <option value="Selesai">Selesai</option>
            </select>

            <button
              type="button"
              onClick={() => setFilterEstimasiHariIni((prev) => !prev)}
              aria-pressed={filterEstimasiHariIni}
              className={`group relative px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 select-none active:scale-[0.98] ${
                filterEstimasiHariIni
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/25 ring-2 ring-sky-400/30'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:bg-sky-50/60 hover:text-sky-700 shadow-2xs'
              }`}
              title="Klik untuk filter tiket dengan estimasi selesai hari ini"
            >
              <Clock
                className={`w-3.5 h-3.5 transition-colors duration-200 ${
                  filterEstimasiHariIni ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'
                }`}
              />
              <span>Estimasi Hari Ini</span>
              {/* Mini toggle switch indicator */}
              <span
                className={`inline-flex items-center w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ${
                  filterEstimasiHariIni ? 'bg-sky-400/40' : 'bg-slate-200 group-hover:bg-sky-100'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full transition-transform duration-200 transform shadow-xs ${
                    filterEstimasiHariIni
                      ? 'translate-x-3 bg-white'
                      : 'translate-x-0 bg-white group-hover:bg-sky-500'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-sky-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-sky-50/70 text-slate-700 uppercase text-[11px] font-bold border-b border-sky-100">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tiket</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Nama Laptop</th>
                <th className="px-4 py-3">SN Laptop</th>
                <th className="px-4 py-3">Tanggal Masuk</th>
                <th className="px-4 py-3">Estimasi Hari</th>
                <th className="px-4 py-3">Status Perbaikan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-medium">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memuat data...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-rose-500">
                    {error}{' '}
                    <button onClick={loadServices} className="underline font-semibold">
                      Coba lagi
                    </button>
                  </td>
                </tr>
              )}

              {!loading && !error && services.length > 0 && filteredServices.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada tiket yang cocok dengan pencarian atau filter.{' '}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('Semua');
                        setFilterEstimasiHariIni(false);
                      }}
                      className="underline font-semibold text-sky-600"
                    >
                      Reset filter
                    </button>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paginatedServices.map((item, index) => {
                  const tCode = show(item.nomor_tiket_service);
                  const estHariIni = isEstimasiHariIni(item);

                  return (
                    <tr
                      key={item.service_id}
                      onClick={() => setSelected(item)}
                      className={`hover:bg-sky-50/60 transition cursor-pointer ${estHariIni ? 'bg-sky-50/30' : ''}`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-sky-600">{startIndex + index + 1}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-sky-600">
                        <div>{tCode}</div>
                        {estHariIni && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Est. Hari Ini
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{show(item.customer?.customer_name)}</div>
                        <div className="text-[10px] text-slate-400">{show(item.customer?.no_telepon)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">{show(item.jenis_laptop?.laptop_name)}</td>
                      <td className="px-4 py-3.5 font-mono text-sky-600">{show(item.laptop_sn)}</td>
                      <td className="px-4 py-3.5">{show(item.tanggal_masuk)}</td>
                      <td className="px-4 py-3.5">
                        {item.estimasi_hari !== null && item.estimasi_hari !== undefined
                          ? `${item.estimasi_hari} hari`
                          : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-xl border text-[11px] font-bold whitespace-nowrap ${item.status_service === 'Diagnostik'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : item.status_service === 'Perbaikan'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.status_service === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          {show(item.status_service)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(item);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-sky-50 transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/pencarian-tiket?code=${tCode}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                            title="Lihat Tampilan Tiket Pelanggan"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                            disabled={deletingId === item.service_id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                            title="Hapus Tiket"
                          >
                            {deletingId === item.service_id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredServices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-50 border border-sky-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {[5, 10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-semibold text-slate-600 px-2">
                Halaman {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Service */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm h-screen w-screen"
            onClick={() => setSelected(null)}
          />
          <aside
            className="fixed right-0 top-0 bottom-0 h-screen z-[9999] w-full max-w-md bg-sky-50 shadow-2xl shadow-slate-900/30 border-l border-sky-100 flex flex-col animate-in slide-in-from-right duration-200"          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-sky-100 bg-white">
              <div>
                <p className="text-[11px] text-slate-400">Detail Tiket</p>
                <h2 className="font-mono text-lg font-extrabold text-sky-600">
                  {show(selected.nomor_tiket_service)}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <DetailSection title="Pelanggan">
                <DetailRow label="Nama" value={show(selected.customer?.customer_name)} />
                <DetailRow label="No. Telepon" value={show(selected.customer?.no_telepon)} />
              </DetailSection>

              <DetailSection title="Perangkat">
                <DetailRow label="Nama Laptop" value={show(selected.jenis_laptop?.laptop_name)} />
                <DetailRow label="Serial Number" value={show(selected.laptop_sn)} />
                <DetailRow label="Status Garansi" value={show(selected.status_garansi)} />
              </DetailSection>

              <DetailSection title="Servis">
                <DetailRow label="Jenis Servis" value={show(selected.jenis_service?.jenis_service)} />
                <DetailRow label="Status Servis" value={show(selected.status_service)} />
                <DetailRow label="Tanggal Masuk" value={show(selected.tanggal_masuk)} />
                <DetailRow
                  label="Estimasi"
                  value={
                    selected.estimasi_hari !== null && selected.estimasi_hari !== undefined
                      ? `${selected.estimasi_hari} hari`
                      : '-'
                  }
                />
                <DetailRow label="Tanggal Selesai" value={show(selected.tanggal_selesai)} />
                <DetailRow label="Kategori Kerusakan" value={show(selected.kategori_kerusakan)} />
                <DetailRow label="Harga" value={rupiah(selected.harga)} />
                <DetailRow label="Solusi" value={show(selected.solusi)} />
                <DetailRow label="Diinput Oleh" value={show(selected.users?.username)} />
              </DetailSection>

              <DetailSection title="Keluhan">
                <DetailRow label="Deskripsi" value={show(selKeluhan?.keluhan)} />
                <DetailRow label="Jumlah Keluhan" value={show(selKeluhan?.jumlah_keluhan)} />
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400">Keluhan aktif</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selKeluhanList.length === 0 ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : (
                      selKeluhanList.map((k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200"
                        >
                          {k}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </DetailSection>
            </div>

            <div className="p-4 border-t border-sky-100 bg-white flex flex-col gap-2">
              <Link
                href={`/pencarian-tiket?code=${show(selected.nomor_tiket_service)}`}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 transition"
              >
                <span>Buka Tampilan Tiket Pelanggan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Modal Form */}
      <ServiceFormModal
        open={modalOpen}
        editData={editing}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}