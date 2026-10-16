export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
  badge: string;
  iconName: string;
}


export const REPAIR_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Perbaikan Motherboard & IC Power',
    description: 'Solusi untuk laptop mati total, mati mendadak, kena petir, short circuit, atau indikator pengisian daya mati.',
    iconName: 'Cpu'
  },
  {
    id: 'srv-2',
    title: 'Ganti Layar LCD / LED & Engsel',
    description: 'Perbaikan layar pecah, bergaris, blank putih/hitam, flickering, serta servis engsel laptop yang patah atau longgar.',
    iconName: 'Monitor'
  },
  {
    id: 'srv-3',
    title: 'Perbaikan Keyboard & Touchpad',
    description: 'Servis keyboard laptop yang tombolnya macet, tidak berfungsi, atau mengetik sendiri, serta perbaikan touchpad yang tidak responsif atau klik tidak berfungsi.',
    iconName: 'Keyboard'
  },
  {
    id: 'srv-4',
    title: 'Perbaikan Laptop Overheat & Kipas Rusak',
    description: 'Atasi laptop panas berlebih, kipas berisik atau mati, serta laptop yang sering mati sendiri atau hang karena masalah sistem pendingin.',
    iconName: 'Thermometer'
  },
  {
    id: 'srv-5',
    title: 'Perbaikan Liquid Damage',
    description: 'Penanganan darurat laptop yang tersiram air, kopi, atau cairan lainnya menggunakan metode Ultra-Sonic Chemical Cleaner.',
    iconName: 'Droplets'
  },
  {
    id: 'srv-6',
    title: 'Install OS Original & Pemulihan Data',
    description: 'Instalasi ulang Windows, instalasi driver lengkap, aplikasi desain/office, dan recovery file terhapus.',
    iconName: 'HardDrive'
  }
];

export const ADVANTAGES: Advantage[] = [
  {
    id: 'adv-1',
    title: 'Teknisi Bersertifikat',
    description: 'Diproses oleh teknisi ahli spesialis perbaikan jalur motherboard, IC power, dan arsitektur laptop terkini.',
    badge: 'Keahlian Tinggi',
    iconName: 'Award'
  },
  {
    id: 'adv-2',
    title: 'Cek Unit 100% Gratis',
    description: 'Diagnostik dan pembongkaran awal untuk estimasi kerusakan tidak dipungut biaya sedikit pun jika batal diperbaiki.',
    badge: 'Bebas Risiko',
    iconName: 'ShieldCheck'
  },
  {
    id: 'adv-3',
    title: 'Pelacakan Tiket Real-Time 24/7',
    description: 'Pantau posisi status perbaikan, rincian biaya, dan catatan teknisi kapan saja secara transparan melalui website.',
    badge: 'Transparan',
    iconName: 'Search'
  },
  {
    id: 'adv-4',
    title: 'Sparepart Original',
    description: 'Kami hanya mengimpor dan menggunakan komponen asli (OEM / Original Grade) untuk ketahanan jangka panjang.',
    badge: 'Kualitas Utama',
    iconName: 'CheckCircle2'
  },
  {
    id: 'adv-5',
    title: 'Estimasi Waktu & Biaya Jelas',
    description: 'Estimasi lama pengerjaan dan total biaya diberikan di awal. Perbaikan baru dimulai setelah Anda setuju, tanpa biaya tersembunyi.',
    badge: 'Tepat Janji',
    iconName: 'Clock'
  }
];

export const CONTACT_INFO = {
  phone: '+62 852-3995-5999',
  whatsapp: '6285239955999',
  email: 'support@ztech-laptop.id',
  address: 'Jl. Pemuda No. 145, Komplek Ruko Niaga Tekno Block B3, Jakarta Selatan',
  operatingHours: 'Senin - Jumat: 09.00 - 17.00 WIB',
  googleMapsEmbed: 'https://maps.google.com'
};

