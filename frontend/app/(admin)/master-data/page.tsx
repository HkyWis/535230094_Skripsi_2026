'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Layers, Wrench, Edit2, Loader2 } from 'lucide-react';

import {
  getJenisLaptops,
  createJenisLaptop,
  updateJenisLaptop,
  deleteJenisLaptop,
  JenisLaptopData,

  getJenisService,
  createJenisService,
  updateJenisService,
  deleteJenisService,
  JenisServiceData
} from '../../lib/masterdata';
import Toast, { useToast } from '@/app/components/toast';
import { getToken } from '../../lib/auth';
import { useConfirm } from '@/app/components/confirm';

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<'jenisLaptop' | 'jenisService'>('jenisLaptop');
  const [tipeLaptops, setTipeLaptops] = useState<JenisLaptopData[]>([]);
  const [jenisServices, setJenisServices] = useState<JenisServiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  const tabConfigs = [
    { key: 'jenisLaptop' as const, label: 'Tipe Laptop', icon: Layers },
    { key: 'jenisService' as const, label: 'Jenis Service', icon: Wrench }
  ];

  const resetForm = () => {
    setName('');
    setEditingId(null);
  };

  const fetchTipeLaptops = async () => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Anda belum login')
      return;
    }
    setLoading(true);
    try {
      const data = await getJenisLaptops(token);
      setTipeLaptops(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat tipe laptop')
    } finally {
      setLoading(false);
    }
  };

  const fetchJenisServices = async () => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Anda belum login');
      return;
    }
    setLoading(true);
    try {
      const data = await getJenisService(token);
      setJenisServices(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat jenis service')
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resetForm();
    setErrorMessage(null);
    if (activeTab === 'jenisLaptop') {
      fetchTipeLaptops();
    } else {
      fetchJenisServices();
    }
  }, [activeTab]);

  const handleEditClick = (item: JenisLaptopData | JenisServiceData) => {
    if (activeTab === 'jenisLaptop') {
      const laptop = item as JenisLaptopData;
      setEditingId(laptop.laptop_id);
      setName(laptop.laptop_name ?? '');
    } else {
      const service = item as JenisServiceData;
      setEditingId(service.jenis_service_id);
      setName(service.jenis_service ?? '');
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Nama opsi tidak boleh kosong!')
      return;
    }
    const token = getToken();
    if (!token) {
      showToast('error', 'Anda belum login');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      if (activeTab === 'jenisLaptop') {
        if (editingId) {
          await updateJenisLaptop(
            token,
            editingId,
            name.trim()
          );
          showToast('edit', 'Tipe Laptop berhasil diubah!')
        } else {
          await createJenisLaptop(
            token,
            name.trim()
          );
          showToast('create', `Tipe Laptop "${name.trim()}" berhasil ditambahkan!`)
        }
        await fetchTipeLaptops();
      }
      else {
        if (editingId) {
          await updateJenisService(
            token,
            editingId,
            name.trim()
          );
          showToast('edit', 'Jenis Service berhasil diubah!')
        } else {
          await createJenisService(
            token,
            name.trim()
          );
          showToast('create', `Jenis Service "${name.trim()}" berhasil ditambahkan!`)
        }
        await fetchJenisServices();
      }
      resetForm();
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4500);
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    const ok = await confirm({
      title: 'Hapus Opsi',
      message: `Hapus opsi "${itemName}" dari master data?`,
    });
    if (!ok) return;
    const token = getToken();
    if (!token) {
      showToast('error', 'Anda belum login')
      return;
    }
    setErrorMessage(null);
    try {
      if (activeTab === 'jenisLaptop') {
        await deleteJenisLaptop(
          token,
          id
        );
        showToast('delete', `Tipe Laptop "${itemName}" berhasil dihapus.`)
        await fetchTipeLaptops();
      }
      else {
        await deleteJenisService(
          token,
          id
        );
        showToast('delete', `Jenis Service "${itemName}" berhasil dihapus.`)
        await fetchJenisServices();
      }
      if (editingId === id) {
        resetForm();
      }
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4500);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus item')
    }
  };

  const currentOptions =
    activeTab === 'jenisLaptop'
      ? tipeLaptops
      : jenisServices;

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={hideToast} />
      {confirmDialog}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-600">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Master Data
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Buat dan kelola pilihan opsi untuk semua dropdown formulir di dalam sistem secara dinamis.
          </p>
        </div>
      </div>

      {/* Active Tab*/}
      <div className="bg-white border border-sky-100 rounded-2xl p-2 shadow-sm shadow-sky-100/60 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabConfigs.map((tab) => {
            const Icon = tab.icon;
            const isSelected =
              activeTab === tab.key;
            const count =
              tab.key === 'jenisLaptop'
                ? tipeLaptops.length
                : jenisServices.length;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  resetForm();
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>
                  {tab.label}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 bg-white border border-sky-100 rounded-3xl p-6 shadow-sm shadow-sky-100/60 h-fit space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {editingId ? 'Edit Opsi' : 'Tambah Opsi Baru'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Kategori:{' '}
                <strong className="text-sky-600">
                  {
                    tabConfigs.find(
                      t => t.key === activeTab
                    )?.label
                  }
                </strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nama / Nilai Opsi{' '} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Masukkan Nama"
                disabled={submitting}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : editingId
                    ? <Edit2 className="w-4 h-4" />
                    : <Plus className="w-4 h-4" />
                }
                <span>
                  {editingId
                    ? 'Simpan Perubahan'
                    : 'Simpan Opsi Baru'
                  }
                </span>
              </button>

              {editingId && (

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white border border-sky-100 rounded-3xl p-6 shadow-sm shadow-sky-100/60 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Daftar Dropdown ({currentOptions.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Pilihan yang tersedia di dropdown "{tabConfigs.find(
                  t => t.key === activeTab
                )?.label}"
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                <span className="ml-3 text-sm text-slate-500 font-medium">
                  Memuat data...
                </span>
              </div>
            ) : currentOptions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Belum ada opsi untuk kategori ini.
                Tambahkan di form sebelah kiri!
              </div>
            ) : (
              currentOptions.map((opt, index) => {
                const id =
                  activeTab === 'jenisLaptop'
                    ? (opt as JenisLaptopData).laptop_id
                    : (opt as JenisServiceData).jenis_service_id;
                const itemName =
                  activeTab === 'jenisLaptop'
                    ? (opt as JenisLaptopData).laptop_name
                    : (opt as JenisServiceData).jenis_service;
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition group border ${editingId === id
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-100'
                      : 'bg-sky-50/40 hover:bg-sky-50/80 border-sky-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          {itemName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEditClick(opt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                        title="Edit Opsi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(id, itemName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Opsi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}