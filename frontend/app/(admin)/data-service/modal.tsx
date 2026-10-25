'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wrench, Ticket, Save, User, Phone, Laptop, X, ShieldCheck, CheckSquare, Pencil,
  ChevronDown, Search, UserPlus, Loader2
} from 'lucide-react';
import {
  createDataService, updateDataService, KeluhanFlags, DataServiceItem, CreateDataServicePayload, CustomerData, getCustomers
} from '@/app/lib/dataservice';
import { getJenisLaptops, getJenisService, JenisLaptopData, JenisServiceData } from '@/app/lib/masterdata';
import { getUsers, UserData } from '@/app/lib/api';
import { getToken } from '../../lib/auth';
import Toast, { useToast } from '@/app/components/toast';

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (mode: 'create' | 'edit') => void;
  editData?: DataServiceItem | null;
}

const generateTicket = () => `TK-${Date.now().toString().slice(-8)}`;

const inputClass =
  'w-full bg-slate-50 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition';

const readOnlyInputClass = inputClass
  .replace('bg-slate-50', 'bg-slate-100')
  .replace('text-slate-800', 'text-slate-600') + ' cursor-not-allowed';

const normalizePhone = (v: string) => {
  const d = (v ?? '').replace(/\D/g, '');
  if (d.startsWith('62')) return '0' + d.slice(2);
  return d;
};

const DEFAULT_18_KELUHAN = [
  { id: 'K0001', code: 'keluhan_lcd', name: 'Keluhan_lcd', label: 'LCD / Layar' },
  { id: 'K0002', code: 'keluhan_keyboard', name: 'Keluhan_keyboard', label: 'Keyboard' },
  { id: 'K0003', code: 'keluhan_charger', name: 'Keluhan_charger', label: 'Charger / Adaptor' },
  { id: 'K0004', code: 'keluhan_baterai', name: 'Keluhan_baterai', label: 'Baterai' },
  { id: 'K0005', code: 'keluhan_engsel', name: 'Keluhan_engsel', label: 'Engsel Laptop' },
  { id: 'K0006', code: 'keluhan_motherboard', name: 'Keluhan_motherboard', label: 'Motherboard' },
  { id: 'K0007', code: 'keluhan_storage', name: 'Keluhan_storage', label: 'Storage (SSD/HDD)' },
  { id: 'K0008', code: 'keluhan_memory', name: 'Keluhan_memory', label: 'Memory (RAM)' },
  { id: 'K0009', code: 'keluhan_booting', name: 'Keluhan_booting', label: 'Booting / Windows' },
  { id: 'K0010', code: 'keluhan_kipas', name: 'Keluhan_kipas', label: 'Kipas / Fan Heatsink' },
  { id: 'K0011', code: 'keluhan_port', name: 'Keluhan_port', label: 'Port USB / Type-C' },
  { id: 'K0012', code: 'keluhan_software_os', name: 'Keluhan_software_os', label: 'Software / OS' },
  { id: 'K0013', code: 'keluhan_password', name: 'Keluhan_password', label: 'Password / Lock' },
  { id: 'K0014', code: 'keluhan_touchpad', name: 'Keluhan_touchpad', label: 'Touchpad' },
  { id: 'K0015', code: 'keluhan_speaker', name: 'Keluhan_speaker', label: 'Speaker Audio' },
  { id: 'K0016', code: 'keluhan_part', name: 'Keluhan_part', label: 'Casing / Part Fisik' },
  { id: 'K0017', code: 'keluhan_kamera', name: 'Keluhan_kamera', label: 'Kamera Webcam' },
  { id: 'K0018', code: 'keluhan_power', name: 'Keluhan_power', label: 'Power / Mati Total' },
];

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-[11px] text-rose-600 font-medium mt-1">{msg}</p> : null;

export default function ServiceFormModal({
  open,
  onClose,
  onSuccess,
  editData = null
}: ServiceFormModalProps) {
  const isEdit = !!editData;
  const [ticketCode, setTicketCode] = useState('');
  const [customerMode, setCustomerMode] = useState<'existing' | 'edit' | 'new'>('existing');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [origCustomer, setOrigCustomer] = useState({ name: '', phone: '' });
  const [customerList, setCustomerList] = useState<CustomerData[]>([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [errorCustomer, setErrorCustomer] = useState('');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const customerBoxRef = useRef<HTMLDivElement>(null);
  const [laptopId, setLaptopId] = useState('');
  const [laptopSn, setLaptopSn] = useState('SN-');
  const [statusGaransi, setStatusGaransi] = useState('');
  const [tanggalMasuk, setTanggalMasuk] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jenisServiceId, setJenisServiceId] = useState('');
  const [kategoriKerusakan, setKategoriKerusakan] = useState('');
  const [solusi, setSolusi] = useState('');
  const [biaya, setBiaya] = useState('');
  const [statusService, setStatusService] = useState<string>('Diagnostik');
  const [userId, setUserId] = useState('');
  const [userList, setUserList] = useState<UserData[]>([]);
  const [deskripsiKeluhan, setDeskripsiKeluhan] = useState('');
  const [keluhanBiner, setKeluhanBiner] = useState<Record<string, number>>({});
  const [jenisLaptopList, setJenisLaptopList] = useState<JenisLaptopData[]>([]);
  const [jenisServiceList, setJenisServiceList] = useState<JenisServiceData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [errorMaster, setErrorMaster] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast, showToast, hideToast } = useToast();

  const activeKeluhanCount = Object.values(keluhanBiner).filter((val) => val === 1).length;

  const findDuplicateCustomer = (phone: string, excludeId?: string): CustomerData | undefined => {
    const n = normalizePhone(phone);
    if (n.length < 5) return undefined;
    return customerList.find(
      (c) => c.customer_id !== excludeId && normalizePhone(c.no_telepon) === n
    );
  };
  const duplicateCustomer =
    customerMode !== 'existing'
      ? findDuplicateCustomer(noTelepon, customerMode === 'edit' ? customerId : undefined)
      : undefined;

  const customerChanged =
    customerName.trim() !== origCustomer.name.trim() ||
    normalizePhone(noTelepon) !== normalizePhone(origCustomer.phone);

  const clearErrors = (...keys: string[]) =>
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const hargaRaw = parseInt(biaya.replace(/\D/g, ''), 10);
    const harga = !isNaN(hargaRaw) && hargaRaw > 0 ? hargaRaw : null;
    const isPerbaikan = statusService === 'Perbaikan';
    const isSelesai = statusService === 'Selesai';
    const perluTahapPerbaikan = isPerbaikan || isSelesai;

    // ===== Tahap 1: Diagnostik  =====
    if (customerMode === 'existing') {
      if (!customerId) e.customerName = 'Customer wajib dipilih';
    } else {
      if (customerMode === 'edit' && !customerId) e.customerName = 'Customer wajib dipilih';
      if (!customerName.trim()) e.customerName = 'Nama pelanggan wajib diisi';

      if (!noTelepon.trim()) e.noTelepon = 'Nomor telepon wajib diisi';
      else if (!/^(\+62|62|0)8\d{7,12}$/.test(noTelepon.replace(/[\s-]/g, '')))
        e.noTelepon = 'Format nomor tidak valid (contoh: 081234567890)';
      else {
        const dup = findDuplicateCustomer(noTelepon, customerMode === 'edit' ? customerId : undefined);
        if (dup)
          e.noTelepon = `Nomor sudah dipakai customer ${dup.customer_name}. Gunakan nomor lain atau pilih customer tersebut.`;
      }
    }

    if (!laptopId) e.laptopId = 'Laptop wajib dipilih';
    if (!statusGaransi) e.statusGaransi = 'Status garansi wajib dipilih';
    if (!jenisServiceId) e.jenisServiceId = 'Jenis service wajib dipilih';
    if (!tanggalMasuk) e.tanggalMasuk = 'Tanggal masuk wajib diisi';

    if (activeKeluhanCount === 0) e.keluhanBiner = 'Pilih minimal 1 keluhan';
    if (!deskripsiKeluhan.trim()) e.deskripsiKeluhan = 'Deskripsi keluhan wajib diisi';

    // ===== Tahap 2: Perbaikan =====
    if (perluTahapPerbaikan) {
      if (!userId) e.userId = `Teknisi wajib dipilih pada tahap ${statusService}`;
      if (!kategoriKerusakan.trim())
        e.kategoriKerusakan = `Kerusakan dialami wajib diisi pada tahap ${statusService}`;
      if (!harga) e.biaya = `Biaya wajib diisi (lebih dari 0) pada tahap ${statusService}`;
    }

    // ===== Tahap 3: Selesai =====
    if (isSelesai) {
      if (!solusi.trim()) e.solusi = 'Solusi perbaikan wajib diisi pada tahap Selesai';
      if (!tanggalSelesai) e.tanggalSelesai = 'Tanggal selesai wajib diisi pada tahap Selesai';
    }

    if (tanggalSelesai && tanggalMasuk && tanggalSelesai < tanggalMasuk)
      e.tanggalSelesai = 'Tanggal selesai tidak boleh sebelum tanggal masuk';

    return e;
  };

  const keluhanItems = DEFAULT_18_KELUHAN;

  const initForm = () => {
    setCustomerOpen(false);
    setCustomerQuery('');
    setErrors({});

    if (editData) {
      const k = (Array.isArray(editData.keluhan) ? editData.keluhan[0] : editData.keluhan) ?? null;
      const kr = (k ?? {}) as unknown as Record<string, unknown>;

      const selesai = editData.tanggal_selesai ?? '';

      setTicketCode(editData.nomor_tiket_service);
      setCustomerMode('existing');
      setCustomerId(editData.customer_id ?? '');
      setCustomerName(editData.customer?.customer_name ?? '');
      setNoTelepon(editData.customer?.no_telepon ?? '');
      setOrigCustomer({
        name: editData.customer?.customer_name ?? '',
        phone: editData.customer?.no_telepon ?? '',
      });
      setLaptopId(editData.laptop_id);
      setLaptopSn(editData.laptop_sn ?? '');
      setStatusGaransi(editData.status_garansi ?? '');
      setTanggalMasuk(editData.tanggal_masuk);
      setTanggalSelesai(selesai);
      setJenisServiceId(editData.jenis_service_id);
      setKategoriKerusakan(editData.kategori_kerusakan ?? '');
      setDeskripsiKeluhan(k?.keluhan ?? '');
      setSolusi(editData.solusi ?? '');
      setUserId(editData.user_id ?? '');
      setBiaya(editData.harga != null && editData.harga > 0 ? String(editData.harga) : '');
      setStatusService(editData.status_service ?? 'Diagnostik');

      const biner: Record<string, number> = {};
      keluhanItems.forEach((item) => {
        biner[item.code] = kr[item.code] === true ? 1 : 0;
      });
      setKeluhanBiner(biner);
      return;
    }
    const todayStr = new Date().toLocaleDateString('en-CA');

    setTicketCode(generateTicket());
    setCustomerMode('existing');
    setCustomerId('');
    setCustomerName('');
    setNoTelepon('');
    setOrigCustomer({ name: '', phone: '' });
    setLaptopId('');
    setLaptopSn('SN-');
    setStatusGaransi('');
    setTanggalMasuk(todayStr);
    setTanggalSelesai('');
    setJenisServiceId('');
    setKategoriKerusakan('');
    setDeskripsiKeluhan('');
    setSolusi('');
    setUserId('');
    setBiaya('');
    setStatusService('Diagnostik');

    const initialBiner: Record<string, number> = {};
    keluhanItems.forEach((item) => {
      initialBiner[item.code] = 0;
    });
    setKeluhanBiner(initialBiner);
  };

  useEffect(() => {
    if (open) initForm();
  }, [open, editData]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!customerOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (customerBoxRef.current && !customerBoxRef.current.contains(e.target as Node)) {
        setCustomerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [customerOpen]);

  const loadCustomers = useCallback(async () => {
    setLoadingCustomer(true);
    setErrorCustomer('');
    try {
      const token = getToken();
      const data = await getCustomers(token || '');
      setCustomerList(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorCustomer(err instanceof Error ? err.message : 'Gagal memuat daftar customer');
    } finally {
      setLoadingCustomer(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadCustomers();
  }, [open, loadCustomers]);

  const MAX_CUSTOMER_SHOWN = 50;
  const q = customerQuery.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const uniqueCustomers = (() => {
    const seen = new Map<string, CustomerData>();
    for (const c of customerList) {
      const key = (c.customer_name ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
      if (!key) {
        seen.set(`__noname_${c.customer_id}`, c);
        continue;
      }
      const existing = seen.get(key);
      if (!existing || (c.customer_id === customerId && existing.customer_id !== customerId)) {
        seen.set(key, c);
      }
    }
    return Array.from(seen.values());
  })();

  const filteredCustomers = uniqueCustomers.filter((c) => {
    if (!q) return true;
    const nameMatch = (c.customer_name ?? '').toLowerCase().includes(q);
    const phoneMatch =
      qDigits.length > 0 && (c.no_telepon ?? '').replace(/\D/g, '').includes(qDigits);
    return nameMatch || phoneMatch;
  });
  const shownCustomers = filteredCustomers.slice(0, MAX_CUSTOMER_SHOWN);

  const selectCustomer = (c: CustomerData) => {
    setCustomerMode('existing');
    setCustomerId(c.customer_id);
    setCustomerName(c.customer_name ?? '');
    setNoTelepon(c.no_telepon ?? '');
    setOrigCustomer({ name: c.customer_name ?? '', phone: c.no_telepon ?? '' });
    setCustomerOpen(false);
    setCustomerQuery('');
    clearErrors('customerName', 'noTelepon');
  };

  const startNewCustomer = () => {
    setCustomerMode('new');
    setCustomerId('');
    setCustomerName('');
    setNoTelepon('');
    setOrigCustomer({ name: '', phone: '' });
    setCustomerOpen(false);
    setCustomerQuery('');
    clearErrors('customerName', 'noTelepon');
  };

  const startEditCustomer = () => {
    if (!customerId) return;
    setCustomerMode('edit');
    clearErrors('customerName', 'noTelepon');
  };

  const backToExistingCustomer = () => {
    clearErrors('customerName', 'noTelepon');
    if (customerMode === 'edit') {
      setCustomerName(origCustomer.name);
      setNoTelepon(origCustomer.phone);
      setCustomerMode('existing');
      return;
    }
    setCustomerMode('existing');
    setCustomerId('');
    setCustomerName('');
    setNoTelepon('');
  };

  const toggleKeluhanBiner = (code: string) => {
    setKeluhanBiner((prev) => ({
      ...prev,
      [code]: prev[code] === 1 ? 0 : 1
    }));
  };

  const resetAllKeluhanBiner = () => {
    const cleared: Record<string, number> = {};
    keluhanItems.forEach((item) => {
      cleared[item.code] = 0;
    });
    setKeluhanBiner(cleared);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      showToast('error', 'Mohon lengkapi form sesuai tahap ' + statusService);
      document
        .querySelector<HTMLElement>('[data-error="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Sesi login berakhir, silakan login ulang.');
      return;
    }

    const flags = Object.fromEntries(
      DEFAULT_18_KELUHAN.map((item) => [item.code, keluhanBiner[item.code] === 1])
    ) as unknown as KeluhanFlags;
    const jumlahKeluhan = Object.values(flags).filter(Boolean).length;

    const hargaRaw = parseInt(biaya.replace(/\D/g, ''), 10);
    const harga = !isNaN(hargaRaw) && hargaRaw > 0 ? hargaRaw : null;

    const isNewCustomer = customerMode === 'new';
    const isEditCustomer = customerMode === 'edit';

    const estimasiHari = tanggalSelesai
      ? Math.max(
        0,
        Math.round(
          (new Date(tanggalSelesai).getTime() - new Date(tanggalMasuk).getTime()) / 86400000
        )
      )
      : null;

    setSubmitting(true);
    try {
      const payload: CreateDataServicePayload = {
        customer_id: isNewCustomer ? null : customerId,
        update_customer: isEditCustomer && customerChanged,
        customer_name: customerName.trim(),
        no_telepon: isNewCustomer || isEditCustomer ? noTelepon.replace(/[\s-]/g, '') : noTelepon,

        user_id: userId || null,
        laptop_id: laptopId,
        jenis_service_id: jenisServiceId,

        nomor_tiket_service: ticketCode,
        tanggal_masuk: tanggalMasuk,
        laptop_sn: laptopSn || null,

        status_garansi: statusGaransi,
        status_service: statusService,

        solusi: solusi || null,
        kategori_kerusakan: kategoriKerusakan || null,
        harga,
        estimasi_hari: estimasiHari,
        tanggal_selesai: tanggalSelesai || null,

        keluhan: deskripsiKeluhan,
        jumlah_keluhan: jumlahKeluhan,
        ...flags,
      };

      if (editData) {
        await updateDataService(token, editData.service_id, payload);
      } else {
        await createDataService(token, payload);
      }

      onSuccess(editData ? 'edit' : 'create');
      onClose();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menyimpan data service');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const token = getToken();

    const fetchMaster = async () => {
      setLoadingMaster(true);
      setErrorMaster('');
      try {
        const [laptops, services, users] = await Promise.all([
          getJenisLaptops(token || ''),
          getJenisService(token || ''),
          getUsers(token || '')
        ]);
        setJenisLaptopList(laptops);
        setJenisServiceList(services);
        setUserList(users);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat master data';
        setErrorMaster(msg);
        showToast('error', msg);
      } finally {
        setLoadingMaster(false);
      }
    };

    fetchMaster();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <Toast toast={toast} onClose={hideToast} />
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-gradient-to-r from-sky-50 via-white to-sky-50 border-b border-sky-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isEdit ? 'Edit Data Servis' : 'Formulir Input Data Servis Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto px-6 sm:px-8 py-5 space-y-6">

            {/* A. Data Pelanggan*/}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-500" />
                  <span>A. Data Pelanggan</span>
                </h3>
                {customerMode === 'new' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Customer Baru
                  </span>
                )}
                {customerMode === 'edit' && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Ubah Data Customer
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Customer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {customerMode === 'existing' ? 'Pilih Customer' : 'Nama Lengkap Pelanggan'}{' '}
                  </label>

                  {customerMode === 'existing' ? (
                    <>
                      <div className="relative" ref={customerBoxRef}>
                        <button
                          type="button"
                          onClick={() => setCustomerOpen((o) => !o)}
                          aria-haspopup="listbox"
                          aria-expanded={customerOpen}
                          className={`${inputClass} flex items-center justify-between gap-2 text-left cursor-pointer`}
                        >
                          <span
                            className={`truncate ${customerId ? 'text-slate-800 font-medium' : 'text-slate-400'}`}
                          >
                            {customerId
                              ? `${customerName} · ${noTelepon}`
                              : loadingCustomer
                                ? 'Memuat daftar customer...'
                                : '-- Pilih customer --'}
                          </span>
                          {loadingCustomer ? (
                            <Loader2 className="w-4 h-4 text-sky-500 animate-spin shrink-0" />
                          ) : (
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 transition ${customerOpen ? 'rotate-180' : ''}`}
                            />
                          )}
                        </button>

                        {customerOpen && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-sky-200 rounded-xl shadow-xl overflow-hidden">
                            <div className="p-2 border-b border-sky-100 relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                autoFocus
                                value={customerQuery}
                                onChange={(e) => setCustomerQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    e.stopPropagation();
                                    setCustomerOpen(false);
                                  }
                                  if (e.key === 'Enter') e.preventDefault();
                                }}
                                placeholder="Cari nama atau nomor telepon..."
                                className={`${inputClass} pl-8`}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={startNewCustomer}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-sky-700 bg-sky-50/70 hover:bg-sky-100 border-b border-sky-100 transition cursor-pointer"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Tambah Customer Baru</span>
                            </button>

                            <ul role="listbox" className="max-h-56 overflow-y-auto">
                              {loadingCustomer && (
                                <li className="px-3.5 py-3 text-xs text-slate-500 flex items-center gap-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Memuat daftar customer...
                                </li>
                              )}

                              {!loadingCustomer && errorCustomer && (
                                <li className="px-3.5 py-3 text-xs text-rose-600">
                                  <p className="font-medium">{errorCustomer}</p>
                                  <button
                                    type="button"
                                    onClick={loadCustomers}
                                    className="mt-1 underline font-semibold cursor-pointer"
                                  >
                                    Coba lagi
                                  </button>
                                </li>
                              )}

                              {!loadingCustomer && !errorCustomer && customerList.length === 0 && (
                                <li className="px-3.5 py-3 text-xs text-slate-500">
                                  Belum ada customer terdaftar. Gunakan &quot;Tambah Customer Baru&quot;.
                                </li>
                              )}

                              {!loadingCustomer &&
                                !errorCustomer &&
                                customerList.length > 0 &&
                                filteredCustomers.length === 0 && (
                                  <li className="px-3.5 py-3 text-xs text-slate-500">
                                    Tidak ada customer yang cocok dengan pencarian.
                                  </li>
                                )}

                              {shownCustomers.map((c) => {
                                const selected = c.customer_id === customerId;
                                return (
                                  <li key={c.customer_id} role="option" aria-selected={selected}>
                                    <button
                                      type="button"
                                      onClick={() => selectCustomer(c)}
                                      className={`w-full text-left px-3.5 py-2.5 text-xs transition cursor-pointer border-b border-slate-100 last:border-b-0 ${selected
                                        ? 'bg-sky-50 text-sky-900'
                                        : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                      <span className="block font-semibold truncate">
                                        {c.customer_name || '(Tanpa nama)'}
                                      </span>
                                      <span className="block text-[11px] font-mono text-slate-500">
                                        {c.no_telepon || '-'}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}

                              {filteredCustomers.length > MAX_CUSTOMER_SHOWN && (
                                <li className="px-3.5 py-2 text-[11px] text-slate-400 bg-slate-50">
                                  Menampilkan {MAX_CUSTOMER_SHOWN} dari {filteredCustomers.length} hasil.
                                  Persempit pencarian untuk hasil lain.
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      {customerId && (
                        <button
                          type="button"
                          onClick={startEditCustomer}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          Ubah nama customer ini
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={backToExistingCustomer}
                        className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                      >
                        {customerMode === 'edit'
                          ? '← Batal ubah'
                          : '← Pilih customer terdaftar'}
                      </button>
                    </>
                  )}
                  <FieldError msg={errors.customerName} />
                </div>

                {/* Nomor Telepon */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={noTelepon}
                      readOnly={customerMode === 'existing'}
                      onChange={(e) => setNoTelepon(e.target.value)}
                      placeholder={
                        customerMode === 'existing'
                          ? 'Otomatis terisi setelah memilih customer'
                          : 'Contoh: 081234567890'
                      }
                      className={`${customerMode === 'existing' ? readOnlyInputClass : inputClass} pl-9`}
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>

                  {customerMode === 'existing' && (
                    <p className="text-[10px] text-slate-400">
                      Terisi otomatis dari data customer.
                    </p>
                  )}

                  {customerMode === 'edit' && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                      Perubahan akan memperbarui data customer ini dan berlaku untuk
                      <span className="font-bold"> semua service</span> miliknya.
                    </p>
                  )}

                  {duplicateCustomer && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                      Nomor ini sudah terdaftar atas nama{' '}
                      <span className="font-bold">{duplicateCustomer.customer_name}</span>.{' '}
                      <button
                        type="button"
                        onClick={() => selectCustomer(duplicateCustomer)}
                        className="underline font-bold cursor-pointer"
                      >
                        Gunakan customer ini
                      </button>
                    </p>
                  )}
                  <FieldError msg={errors.noTelepon} />
                </div>
              </div>
            </div>

            {/* B. Data Perangkat Laptop */}
            <div className="space-y-3 pt-4 border-t border-sky-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-500" />
                  <span>B. Data Perangkat Laptop</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Laptop Name*/}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Pilih Laptop
                  </label>
                  <select
                    required
                    value={laptopId}
                    onChange={(e) => setLaptopId(e.target.value)}
                    disabled={loadingMaster}
                    className={`${inputClass} font-medium`}
                  >
                    <option value="">
                      {loadingMaster ? 'Memuat data laptop...' : '-- Pilih laptop --'}
                    </option>

                    {jenisLaptopList.map((l) => (
                      <option key={l.laptop_id} value={l.laptop_id}>
                        {l.laptop_name}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.laptopId} />
                </div>

                {/* SN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Nomor Seri (Serial Number / SN)
                  </label>
                  <input
                    type="text"
                    value={laptopSn}
                    onChange={(e) => setLaptopSn(e.target.value)}
                    placeholder="Contoh: SN-88320491A"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* C. Ketentuan Servis & Tanggal Service  */}
            <div className="space-y-3 pt-4 border-t border-sky-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>C. Ketentuan Servis &amp; Tanggal Service</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Garansi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Status Garansi
                  </label>
                  <select
                    value={statusGaransi}
                    onChange={(e) => setStatusGaransi(e.target.value)}
                    className={`${inputClass} font-medium`}
                  >
                    <>
                      <option value="">-- Pilih status garansi --</option>
                      <option value="Active">Active (Bergaransi)</option>
                      <option value="Expired">Expired (Non-Garansi)</option>
                    </>
                  </select>
                  <FieldError msg={errors.statusGaransi} />
                </div>

                {/* Jenis Service */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Jenis Service
                  </label>
                  <select
                    required
                    value={jenisServiceId}
                    onChange={(e) => setJenisServiceId(e.target.value)}
                    disabled={loadingMaster}
                    className={`${inputClass} font-medium`}
                  >
                    <option value="">
                      {loadingMaster ? 'Memuat jenis service...' : '-- Pilih jenis service --'}
                    </option>
                    {jenisServiceList.map((s) => (
                      <option key={s.jenis_service_id} value={s.jenis_service_id}>
                        {s.jenis_service}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.jenisServiceId} />
                </div>

                {/* Tanggal Masuk */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Tanggal Masuk
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMasuk}
                    onChange={(e) => setTanggalMasuk(e.target.value)}
                    className={inputClass}
                  />
                  <FieldError msg={errors.tanggalMasuk} />
                </div>

                {/* Tanggal Selesai */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold block ${statusService !== 'Selesai' ? 'text-slate-400' : 'text-slate-700'}`}>
                    Tanggal Selesai{statusService !== 'Selesai' && <span className="ml-1 text-[10px] font-normal">(hanya pada Step 3)</span>}
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    disabled={statusService !== 'Selesai'}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className={statusService !== 'Selesai' ? readOnlyInputClass : inputClass}
                  />
                  <FieldError msg={errors.tanggalSelesai} />
                </div>
              </div>
            </div>

            {/* D. Keluhan & Kerusakan Laptop */}
            <div className="space-y-3 pt-4 border-t border-sky-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sky-500" />
                  <span>D. Keluhan & Kerusakan Laptop</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Line 1: Checkbox Keluhan*/}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Pilihan Keluhan
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {activeKeluhanCount} dari 18 aktif (1)
                      </span>
                      {activeKeluhanCount > 0 && (
                        <button
                          type="button"
                          onClick={resetAllKeluhanBiner}
                          className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-64 overflow-y-auto bg-slate-50 border border-sky-200 rounded-xl p-2.5 space-y-1.5 focus-within:border-sky-500 focus-within:bg-white transition">
                    {keluhanItems.map((item) => {
                      const isChecked = keluhanBiner[item.code] === 1;
                      return (
                        <label
                          key={item.code}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs transition cursor-pointer select-none ${isChecked
                            ? 'bg-sky-50/90 border-sky-400 text-sky-900 font-semibold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-sky-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleKeluhanBiner(item.code)}
                            className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-400 cursor-pointer"
                          />
                          <span className="flex-1 text-xs truncate">
                            {item.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FieldError msg={errors.keluhanBiner} />
                </div>

                {/* Right Line 1: Deskripsi Keluhan & Kerusakan*/}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Deskripsi Keluhan Pelanggan
                    </label>
                    <textarea
                      rows={5}
                      value={deskripsiKeluhan}
                      onChange={(e) => setDeskripsiKeluhan(e.target.value)}
                      placeholder="Jelaskan detail kendala laptop, kronologi kerusakan (misal tersiram teh, jatuh, mati mendadak saat render video, dsb)..."
                      className="w-full bg-slate-50 border border-sky-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition leading-relaxed"
                    />
                    <FieldError msg={errors.deskripsiKeluhan} />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className={`text-xs font-semibold block ${statusService === 'Diagnostik' ? 'text-slate-400' : 'text-slate-700'}`}>
                      Kerusakan Dialami{statusService === 'Diagnostik' && <span className="ml-1 text-[10px] font-normal">(tersedia di Step 2)</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={kategoriKerusakan}
                      disabled={statusService === 'Diagnostik'}
                      onChange={(e) => setKategoriKerusakan(e.target.value)}
                      placeholder="Contoh: LCD Bergaris & Flicker, Mati Total Short IC, Korosi Tumpahan Cairan, Overheating..."
                      className={`w-full border rounded-xl p-3 text-xs placeholder-slate-400 focus:outline-none transition leading-relaxed ${statusService === 'Diagnostik' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 text-slate-800 border-sky-200 focus:border-sky-500 focus:bg-white'}`}
                    />
                    <FieldError msg={errors.kategoriKerusakan} />
                  </div>
                </div>
              </div>

              {/* Line 2: Solusi */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold block ${statusService !== 'Selesai' ? 'text-slate-400' : 'text-slate-700'}`}>
                  Solusi Perbaikan{statusService !== 'Selesai' && <span className="ml-1 text-[10px] font-normal">(hanya pada Step 3)</span>}
                </label>
                <input
                  type="text"
                  value={solusi}
                  disabled={statusService !== 'Selesai'}
                  onChange={(e) => setSolusi(e.target.value)}
                  placeholder="Catatan diagnosa teknisi & langkah perbaikan (misal: Deep cleaning & repaste PTM7950, reballing IC Power)..."
                  className={statusService !== 'Selesai' ? readOnlyInputClass : inputClass}
                />
                <FieldError msg={errors.solusi} />
              </div>
            </div>

            {/* E. Teknisi, Biaya, dan Tahapan Service*/}
            <div className="space-y-3 pt-4 border-t border-sky-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-sky-500" />
                  <span>E. Teknisi, Biaya &amp; Tahapan Service</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold block ${statusService === 'Diagnostik' ? 'text-slate-400' : 'text-slate-700'}`}>
                    Teknisi Penanggung Jawab{statusService === 'Diagnostik' && <span className="ml-1 text-[10px] font-normal">(tersedia di Step 2)</span>}
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled={loadingMaster || statusService === 'Diagnostik'}
                    className={`${statusService === 'Diagnostik' ? readOnlyInputClass : inputClass} font-medium`}
                  >
                    <option value="">
                      {loadingMaster ? 'Memuat data user...' : '-- Pilih teknisi --'}
                    </option>

                    {userList.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.userId} />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold block ${statusService === 'Diagnostik' ? 'text-slate-400' : 'text-slate-700'}`}>
                    Estimasi Biaya Pengerjaan{statusService === 'Diagnostik' && <span className="ml-1 text-[10px] font-normal">(tersedia di Step 2)</span>}
                  </label>
                  <input
                    type="text"
                    value={biaya}
                    disabled={statusService === 'Diagnostik'}
                    onChange={(e) => setBiaya(e.target.value)}
                    placeholder="Rp 450.000"
                    className={statusService === 'Diagnostik' ? readOnlyInputClass : inputClass}
                  />
                  <FieldError msg={errors.biaya} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Tahapan Servis Awal
                  </label>
                  <select
                    value={statusService}
                    onChange={(e) => setStatusService(e.target.value)}
                    className={`${inputClass} text-sky-800`}
                  >
                    {!['Diagnostik', 'Perbaikan', 'Selesai'].includes(statusService) && statusService && (
                      <option value={statusService}>{statusService}</option>
                    )}
                    <option value="Diagnostik">Step 1 - Diagnostik</option>
                    <option value="Perbaikan">Step 2 - Perbaikan</option>
                    <option value="Selesai">Step 3 - Selesai</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Submit */}
          <div className="px-6 sm:px-8 py-3.5 bg-slate-50 border-t border-sky-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>
                  {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Data Service'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}