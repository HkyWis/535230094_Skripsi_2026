'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, Trash2, Pencil, Loader2 } from 'lucide-react';
import { getUsers, UserData } from '../../lib/api';
import { getToken, getUser } from '../../lib/auth';
import DaftarAkunAdminModal from './modal';
import Toast, { useToast } from '@/app/components/toast';
import { useConfirm } from '@/app/components/confirm';

const PROTECTED_USERNAME = 'administrator';
const isProtectedAccount = (u: UserData) =>
  u.username.trim().toLowerCase() === PROTECTED_USERNAME;

export default function DaftarAkunAdminPage() {
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const currentUser = getUser();
  const isSuperAdmin = currentUser?.role_name === 'Super Admin';
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  const fetchAdmins = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      showToast('error', 'Sesi login tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);
    try {
      const usersData = await getUsers(token);
      setAdmins(usersData);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Gagal memuat data akun.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async (user: UserData) => {
    if (!isSuperAdmin || isProtectedAccount(user)) return;
    const { user_id: id, username: adminName } = user;
    const ok = await confirm({
      title: 'Hapus Akun',
      message: `Apakah Anda yakin ingin menghapus akun ${adminName}?`,
    });
    if (!ok) return;

    const token = getToken();
    if (!token) {
      showToast('error', 'Sesi login tidak ditemukan. Silakan login kembali.');
      return;
    }

    try {
      const { deleteUser } = await import('../../lib/api');
      await deleteUser(token, id);
      await fetchAdmins();
      showToast('delete', `Akun ${adminName} berhasil dihapus.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menghapus akun.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleAccountSaved = async (username: string, roleName: string, isEdit: boolean) => {
    await fetchAdmins();
    setShowAddModal(false);
    setEditingUser(null);
    if (isEdit) {
      showToast('edit', `Akun "${username}" (${roleName}) berhasil diperbarui!`);
    } else {
      showToast('create', `Akun baru "${username}" (${roleName}) berhasil didaftarkan!`);
    }
  };

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={hideToast} />
      {confirmDialog}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-sky-100 text-sky-600">
            <Users className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800">Daftar Akun Admin</h1>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Tambah Akun Admin Baru</span>
          </button>
        )}
      </div>

      {/* Tabel Daftar Akun */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-sm shadow-sky-100/60 space-y-4">
        <h2 className="text-base font-bold text-slate-800">Daftar Akun Pengguna Sistem</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
            <span className="ml-3 text-sm text-slate-500 font-medium">Memuat data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-sky-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-sky-50/70 text-slate-700 uppercase text-[11px] font-bold border-b border-sky-100">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Peran (Role)</th>
                  <th className="px-4 py-3">Terdaftar Sejak</th>
                  {isSuperAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 font-medium">
                {admins.map((adm) => (
                  <tr key={adm.user_id} className="hover:bg-sky-50/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {adm.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="font-bold text-slate-800">{adm.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${adm.role_name === 'Super Admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                        {adm.role_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">{formatDate(adm.create_at)}</td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingUser(adm)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                            title="Edit Akun"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(adm)}
                            disabled={isProtectedAccount(adm)}
                            className={`p-1.5 rounded-lg transition ${isProtectedAccount(adm)
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'}`}
                            title={isProtectedAccount(adm) ? 'Akun Administrator tidak bisa dihapus' : 'Hapus Akun'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={isSuperAdmin ? 4 : 3} className="px-4 py-8 text-center text-slate-400 text-sm">
                      Belum ada akun admin terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAddModal || editingUser) && isSuperAdmin && (
        <DaftarAkunAdminModal
          key={editingUser?.user_id ?? 'new'}
          editUser={editingUser}
          onClose={() => { setShowAddModal(false); setEditingUser(null); }}
          onSaved={handleAccountSaved}
        />
      )}
    </div>
  );
}
