const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface KeluhanFlags {
    keluhan_lcd: boolean;
    keluhan_keyboard: boolean;
    keluhan_charger: boolean;
    keluhan_baterai: boolean;
    keluhan_engsel: boolean;
    keluhan_motherboard: boolean;
    keluhan_storage: boolean;
    keluhan_memory: boolean;
    keluhan_booting: boolean;
    keluhan_kipas: boolean;
    keluhan_port: boolean;
    keluhan_software_os: boolean;
    keluhan_password: boolean;
    keluhan_touchpad: boolean;
    keluhan_speaker: boolean;
    keluhan_part: boolean;
    keluhan_kamera: boolean;
    keluhan_power: boolean;
}

export interface CreateDataServicePayload extends KeluhanFlags {
    // customer
    customer_id?: string | null;
    update_customer?: boolean;
    customer_name: string;
    no_telepon: string;

    // service
    user_id?: string | null;
    laptop_id: string;
    jenis_service_id: string;
    nomor_tiket_service: string;
    tanggal_masuk: string; // YYYY-MM-DD
    laptop_sn?: string | null;
    status_garansi: string;
    status_service: string;
    solusi?: string | null;
    kategori_kerusakan?: string | null;
    harga?: number | null;
    estimasi_hari?: number | null;
    tanggal_selesai?: string | null;

    // keluhan
    keluhan: string;
    jumlah_keluhan: number;
}

export interface CreateDataServiceResponse {
    message: string;
    customer: {
        customer_id: string;
        customer_name: string;
        no_telepon: string;
        create_at: string;
        update_at: string;
    };
    service: {
        service_id: string;
        customer_id: string;
        user_id: string | null;
        laptop_id: string;
        jenis_service_id: string;
        nomor_tiket_service: string;
        tanggal_masuk: string;
        [key: string]: unknown;
    };
    keluhan: {
        keluhan_id: string;
        service_id: string;
        keluhan: string;
        jumlah_keluhan: number;
        [key: string]: unknown;
    };
}

export interface KeluhanRow extends Partial<KeluhanFlags> {
    keluhan: string;
    jumlah_keluhan: number;
}

export interface DataServiceItem {
    service_id: string;
    customer_id: string;
    user_id: string | null;
    laptop_id: string;
    jenis_service_id: string;
    nomor_tiket_service: string;
    tanggal_masuk: string;
    laptop_sn: string | null;
    status_garansi: string | null;
    status_service: string | null;
    solusi: string | null;
    kategori_kerusakan: string | null;
    harga: number | null;
    estimasi_hari: number | null;
    tanggal_selesai: string | null;
    customer: { customer_name: string; no_telepon: string } | null;
    jenis_laptop: { laptop_name: string } | null;
    jenis_service: { jenis_service: string } | null;
    users: { username: string } | null;
    keluhan: KeluhanRow[] | KeluhanRow | null;
}

export interface CustomerData {
    customer_id: string;
    customer_name: string;
    no_telepon: string;
    create_at?: string;
    update_at?: string;
}

export async function createDataService(token: string, payload: CreateDataServicePayload): Promise<CreateDataServiceResponse> {
    const res = await fetch(`${API_URL}/api/data/data_service`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        let message = 'Gagal membuat data service';
        try {
            const error = await res.json();
            if (typeof error.detail === 'string') {
                message = error.detail;
            } else if (Array.isArray(error.detail)) {
                message = error.detail.map((d: { msg: string }) => d.msg).join('\n');
            }
        } catch {
        }
        throw new Error(message);
    }

    return res.json();
}


export async function getDataService(): Promise<DataServiceItem[]> {
    const res = await fetch(`${API_URL}/api/data/data_service`);

    if (!res.ok) {
        throw new Error('Gagal memuat data service');
    }

    return res.json();
}

export async function getCustomers(_token?: string): Promise<CustomerData[]> {
    const services = await getDataService();
    if (!Array.isArray(services)) return [];

    const map = new Map<string, CustomerData>();
    for (const s of services) {
        if (!s?.customer_id || map.has(s.customer_id)) continue;
        map.set(s.customer_id, {
            customer_id: s.customer_id,
            customer_name: s.customer?.customer_name ?? '',
            no_telepon: s.customer?.no_telepon ?? '',
        });
    }

    return Array.from(map.values()).sort((a, b) =>
        a.customer_name.localeCompare(b.customer_name, 'id')
    );
}

export async function updateDataService(
    token: string,
    serviceId: string,
    payload: CreateDataServicePayload
): Promise<CreateDataServiceResponse> {
    const res = await fetch(`${API_URL}/api/data/data_service/${serviceId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        let message = 'Gagal memperbarui data service';
        try {
            const error = await res.json();
            if (typeof error.detail === 'string') {
                message = error.detail;
            } else if (Array.isArray(error.detail)) {
                message = error.detail.map((d: { msg: string }) => d.msg).join('\n');
            }
        } catch {
        }
        throw new Error(message);
    }

    return res.json();
}

export async function deleteDataService(token: string, serviceId: string): Promise<{ message: string; service_id: string }> {
    const res = await fetch(`${API_URL}/api/data/data_service/${encodeURIComponent(serviceId)}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        let message = 'Gagal menghapus data service';
        try {
            const error = await res.json();
            if (typeof error.detail === 'string') message = error.detail;
        } catch {
        }
        throw new Error(message);
    }

    return res.json();
}