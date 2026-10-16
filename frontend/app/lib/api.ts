const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---- Types ----

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  token_type: string;
  user: {
    user_id: string;
    username: string;
    role_id: string;
    role_name: string;
  };
}

export interface UserData {
  user_id: string;
  username: string;
  role_id: string;
  role_name: string;
  create_at: string;
  update_at: string;
}

export interface RoleData {
  role_id: string;
  role_name: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role_id: string;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  role_id?: string;
}

// ---- API Functions ----

export async function login(data: LoginData): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Login gagal');
  }

  return res.json();
}

export async function getUsers(token: string): Promise<UserData[]> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Gagal memuat data user');
  }

  return res.json();
}

export async function createUser(token: string, data: CreateUserData): Promise<UserData> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Gagal membuat akun');
  }

  return res.json();
}

export async function updateUser(token: string, userId: string, data: UpdateUserData) {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail ?? 'Gagal mengubah akun.');
  return body;
}

export async function deleteUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Gagal menghapus akun');
  }
}

export async function getRoles(token: string): Promise<RoleData[]> {
  const res = await fetch(`${API_URL}/api/admin/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Gagal memuat data role');
  }

  return res.json();
}