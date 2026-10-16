'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Laptop, LayoutDashboard, Wrench, Database, Users, Sparkles, ExternalLink, X } from 'lucide-react';
import { getUser } from '../lib/auth';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [roleName, setRoleName] = useState<string | null>(null);
  useEffect(() => {
    setRoleName(getUser()?.role_name ?? null);
  }, []);

  const isSuperAdmin = roleName === 'Super Admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Service', href: '/data-service', icon: Wrench },
    { name: 'Master Data', href: '/master-data', icon: Database },
    { name: 'Daftar Akun Admin', href: '/daftar-akun-admin', icon: Users, superAdminOnly: true },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <aside className="w-72 bg-white border-r border-sky-100 flex flex-col h-full shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-sky-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-400/30 group-hover:scale-105 transition-transform duration-200">
            <Laptop className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-800">Z-Tech</span>
            </div>
            <span className="text-[10px] text-sky-600 font-semibold tracking-wider uppercase">Pusat Servis Laptop</span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Navigasi
        </div>

        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${isActive
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-400/25'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-sky-100/70 text-sky-600 group-hover:bg-sky-200/60'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span>{item.name}</span>
                </div>
              </div>

            </Link>
          );
        })}

        {/* Public Website Shortcut */}
        <div className="pt-4">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Portal Publik
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50/70 transition-all border border-transparent hover:border-sky-100"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Lihat Website Beranda</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
