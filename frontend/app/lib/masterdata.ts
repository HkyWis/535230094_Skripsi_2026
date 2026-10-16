const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface JenisLaptopData {
    laptop_id: string;
    laptop_name: string;
    create_at: string;
    update_at: string;
}

export interface JenisServiceData {
    jenis_service_id: string;
    jenis_service: string;
    create_at: string;
    update_at: string;
}

// ---- Master Data (Tipe Laptop) ----

export async function getJenisLaptopsPublic(): Promise<JenisLaptopData[]> {
    const res = await fetch(`${API_URL}/api/master/jenis_laptop_public`);

    if (!res.ok) {
        throw new Error('Gagal memuat jenis laptop');
    }

    return res.json();
}

export async function getJenisLaptops(token: string): Promise<JenisLaptopData[]> {
    const res = await fetch(`${API_URL}/api/master/jenis_laptop`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal memuat jenis laptop');
    }

    return res.json();
}

export async function createJenisLaptop(token: string, name: string): Promise<JenisLaptopData> {
    const res = await fetch(`${API_URL}/api/master/jenis_laptop`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ laptop_name: name }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal menambah jenis laptop');
    }

    return res.json();
}

export async function updateJenisLaptop(token: string, id: string, name: string): Promise<JenisLaptopData> {
    const res = await fetch(`${API_URL}/api/master/jenis_laptop/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ laptop_name: name }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal mengubah jenis laptop');
    }

    return res.json();
}

export async function deleteJenisLaptop(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/master/jenis_laptop/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal menghapus jenis laptop');
    }
}

// Jenis Service

export async function getJenisService(token: string): Promise<JenisServiceData[]> {
    const res = await fetch(`${API_URL}/api/master/jenis_service`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal memuat jenis service');
    }

    return res.json();
}

export async function createJenisService(token: string, name: string): Promise<JenisServiceData> {
    const res = await fetch(`${API_URL}/api/master/jenis_service`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jenis_service: name }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal menambah jenis service');
    }

    return res.json();
}

export async function updateJenisService(token: string, id: string, name: string): Promise<JenisServiceData> {
    const res = await fetch(`${API_URL}/api/master/jenis_service/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jenis_service: name }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal mengubah jenis service');
    }

    return res.json();
}

export async function deleteJenisService(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/master/jenis_service/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal menghapus jenis service');
    }
}