'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { createUser, getRoles, RoleData, updateUser, UserData } from '../../lib/api';
import { getToken } from '../../lib/auth';

type DaftarAkunAdminModalProps = {
  onClose: () => void;
  onSaved: (username: string, roleName: string, isEdit: boolean) => Promise<void> | void;
  editUser?: UserData | null;
};

export default function DaftarAkunAdminModal({
  onClose,
  onSaved,
  editUser
}: DaftarAkunAdminModalProps) {
  const isEdit = !!editUser;
  const isTargetSuperAdmin = editUser?.role_name === 'Super Admin';
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [username, setUsername] = useState(editUser?.username ?? '');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      const token = getToken();
      if (!token) {
        setErrorMessage('Sesi login tidak ditemukan. Silakan login kembali.');
        setLoadingRoles(false);
        return;
      }
      try {
        const rolesData = await getRoles(token);
        setRoles(rolesData);
        // const adminRole = rolesData.find((role) => role.role_name === 'Admin');
        setRoleId(
          editUser?.role_id ??
          rolesData.find((r) => r.role_name === 'Admin')?.role_id ??
          rolesData[0]?.role_id ?? ''
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat daftar role.');
      } finally {
        setLoadingRoles(false);
      }
    };
    void fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const token = getToken();
    if (!token) {
      setErrorMessage('Sesi login tidak ditemukan. Silakan login kembali.');
      return;
    }
    if (!username.trim() || (!isEdit && !password)) {
      setErrorMessage(isEdit ? 'Username tidak boleh kosong!' : 'Mohon isi username dan password!');
      return;
    }
    if (password && password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (!roleId) {
      setErrorMessage('Silakan pilih peran akun.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && editUser) {
        const payload: { username?: string; password?: string; role_id?: string } = {};
        if (username.trim() !== editUser.username) payload.username = username.trim();
        if (roleId !== editUser.role_id) payload.role_id = roleId;
        if (password) payload.password = password;
        if (Object.keys(payload).length === 0) {
          setErrorMessage('Tidak ada perubahan.');
          setSubmitting(false);
          return;
        }
        await updateUser(token, editUser.user_id, payload);
      } else {
        await createUser(token, { username: username.trim(), password, role_id: roleId });
      }
      const roleName = roles.find((r) => r.role_id === roleId)?.role_name ?? 'Admin';
      await onSaved(username.trim(), roleName, isEdit);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan akun.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 bg-slate-900/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-admin-title"
        className="my-auto w-full max-w-lg space-y-6 rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 id="add-admin-title" className="text-base font-bold text-slate-800">
              {isEdit ? 'Edit Akun Admin' : 'Tambah Akun Admin Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup modal"
            className="text-lg font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loadingRoles ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-500" />
            Memuat daftar role...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="block text-xs font-semibold text-slate-700">
                Username Login
              </label>
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: admin_baru"
                disabled={submitting}
                className="w-full rounded-xl border border-sky-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <input
                id="admin-password"
                type="password"
                required={!isEdit}
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                disabled={submitting}
                className="w-full rounded-xl border border-sky-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-role" className="block text-xs font-semibold text-slate-700">
                Peran (Role)
              </label>
              <select
                id="admin-role"
                required
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={submitting || roles.length === 0 || isTargetSuperAdmin}
                className="w-full rounded-xl border border-sky-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none disabled:opacity-50"
              >
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-sky-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || loadingRoles || roles.length === 0}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Akun Baru'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
