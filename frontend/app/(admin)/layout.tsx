'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '../components/admin-sidebar';
import { Menu, Calendar, LogOut, User } from 'lucide-react';
import { isLoggedIn, getUser, logout } from '../lib/auth';
import { useConfirm } from '../components/confirm';

const SUPER_ADMIN_ONLY_PATHS = ['/daftar-akun-admin'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const pathname = usePathname();
  const currentUser = getUser();

  const isRestricted = SUPER_ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  const isBlocked = isRestricted && currentUser?.role_name !== 'Super Admin';
  const { confirm, confirmDialog } = useConfirm();

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/';
      return;
    }
    if (isBlocked) {
      window.location.replace('/dashboard');
      return;
    }
    setAuthChecked(true);
  }, [isBlocked]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Keluar',
      message: 'Apakah Anda yakin ingin keluar?',
      confirmText: 'Ya, Keluar',
      variant: 'default',
    });
    if (!ok) return;
    logout();
    window.location.href = '/login';
  };

  if (!authChecked || isBlocked) {
    return (
      <div className="min-h-screen bg-sky-50/50 flex items-center justify-center">
        <div className="text-sm text-slate-400 font-medium">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/50 flex text-slate-800 font-sans isolation-isolate">
      {confirmDialog}
      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-20 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-in slide-in-from-left duration-200">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-sky-200"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                Sistem Manajemen Laptop
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>{todayDate}</span>
            </div>

            {/* User Info & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentUser.username}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${currentUser.role_name === 'Super Admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-sky-100 text-sky-700'
                    }`}>
                    {currentUser.role_name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
