import type { DataServiceItem, KeluhanRow } from '@/app/lib/dataservice';

export const KELUHAN_LABELS: Record<string, string> = {
    keluhan_lcd: 'LCD',
    keluhan_keyboard: 'Keyboard',
    keluhan_charger: 'Charger',
    keluhan_baterai: 'Baterai',
    keluhan_engsel: 'Engsel',
    keluhan_motherboard: 'Motherboard',
    keluhan_storage: 'Storage',
    keluhan_memory: 'Memory',
    keluhan_booting: 'Booting',
    keluhan_kipas: 'Kipas',
    keluhan_port: 'Port',
    keluhan_software_os: 'Software / OS',
    keluhan_password: 'Password',
    keluhan_touchpad: 'Touchpad',
    keluhan_speaker: 'Speaker',
    keluhan_part: 'Part',
    keluhan_kamera: 'Kamera',
    keluhan_power: 'Power',
};

export const show = (v: unknown): string =>
    v === null || v === undefined || v === '' ? '-' : String(v);

export const rupiah = (v: unknown): string => {
    const n = Number(v);
    if (v === null || v === undefined || v === '' || Number.isNaN(n)) return '-';
    return `Rp ${n.toLocaleString('id-ID')}`;
};

// Ambil object keluhan (bisa array atau object tunggal)
export const getKeluhan = (item: DataServiceItem): KeluhanRow | null => {
    const k = item.keluhan;
    if (!k) return null;
    return Array.isArray(k) ? k[0] ?? null : k;
};

// Daftar label keluhan aktif (boolean atau 1/0)
export const getActiveKeluhan = (item: DataServiceItem): string[] => {
    const k = getKeluhan(item) as Record<string, unknown> | null;
    if (!k) return [];
    return Object.keys(KELUHAN_LABELS)
        .filter((key) => k[key] === true || k[key] === 1)
        .map((key) => KELUHAN_LABELS[key]);
};

// Normalisasi status_service ke step 1 / 2 / 3 (angka atau teks)
export const getStep = (status: string | null | undefined): 1 | 2 | 3 => {
    const raw = (status ?? '').toString().trim().toLowerCase();
    const n = Number(raw);
    if (n === 2 || n === 3) return n;
    if (raw.includes('selesai') || raw.includes('diambil')) return 3;
    if (raw.includes('perbaikan') || raw.includes('proses') || raw.includes('pengerjaan')) return 2;
    return 1;
};

// Format Date -> 'YYYY-MM-DD' lokal (hindari bug zona waktu dari toISOString)
export const ymd = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Parse 'YYYY-MM-DD' -> Date lokal (hindari bug timezone)
export const parseTanggal = (s: string | null | undefined): Date | null => {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m) {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

// Tambah hari kerja (Senin - Jumat)
export const addHariKerja = (start: Date, hari: number): Date => {
    const d = new Date(start);
    let sisa = Math.max(0, Math.floor(hari));
    while (sisa > 0) {
        d.setDate(d.getDate() + 1);
        const day = d.getDay();
        if (day !== 0 && day !== 6) sisa--;
    }
    return d;
};

// Dapatkan perkiraan tanggal selesai (YYYY-MM-DD) berdasarkan hari kerja
export const getEstimasiSelesai = (item: DataServiceItem): { text: string; pasti: boolean } => {
    if (item.tanggal_selesai) return { text: item.tanggal_selesai, pasti: true };
    if (item.tanggal_masuk && item.estimasi_hari != null) {
        const start = parseTanggal(item.tanggal_masuk);
        if (start) {
            return { text: ymd(addHariKerja(start, Number(item.estimasi_hari))), pasti: false };
        }
    }
    return { text: '-', pasti: false };
};

// Cek apakah estimasi selesai jatuh pada hari ini
export const isEstimasiHariIni = (item: DataServiceItem): boolean => {
    if (!item.tanggal_masuk || item.estimasi_hari == null) return false;
    const start = parseTanggal(item.tanggal_masuk);
    if (!start) return false;
    const target = ymd(addHariKerja(start, Number(item.estimasi_hari)));
    const today = ymd(new Date());
    return target === today;
};
