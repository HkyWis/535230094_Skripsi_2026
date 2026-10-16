'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Pencil, Trash2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'create' | 'edit' | 'delete' | 'error';
export type ToastState = { type: ToastType; message: string } | null;

const TOAST_STYLES = {
    create: {
        title: 'Berhasil Ditambahkan',
        icon: CheckCircle2,
        box: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        iconBox: 'bg-emerald-100 text-emerald-600',
    },
    edit: {
        title: 'Berhasil Diperbarui',
        icon: Pencil,
        box: 'bg-sky-50 border-sky-200 text-sky-800',
        iconBox: 'bg-sky-100 text-sky-600',
    },
    delete: {
        title: 'Berhasil Dihapus',
        icon: Trash2,
        box: 'bg-amber-50 border-amber-200 text-amber-800',
        iconBox: 'bg-amber-100 text-amber-600',
    },
    error: {
        title: 'Terjadi Kesalahan',
        icon: AlertCircle,
        box: 'bg-rose-50 border-rose-200 text-rose-800',
        iconBox: 'bg-rose-100 text-rose-600',
    },
} as const;

export function useToast(duration = 4500) {
    const [toast, setToast] = useState<ToastState>(null);
    const timerRef = useRef<number | null>(null);

    const hideToast = useCallback(() => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        setToast(null);
    }, []);

    const showToast = useCallback(
        (type: ToastType, message: string) => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            setToast({ type, message });
            timerRef.current = window.setTimeout(() => setToast(null), duration);
        },
        [duration]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    return { toast, showToast, hideToast };
}

export default function Toast({ toast, onClose, }: {
    toast: ToastState;
    onClose: () => void;
}) {
    if (!toast) return null;

    const style = TOAST_STYLES[toast.type];
    const Icon = style.icon;

    return (
        <div className="fixed top-4 right-4 z-[200] w-[calc(100%-2rem)] max-w-sm">
            <div
                role={toast.type === 'error' ? 'alert' : 'status'}
                className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg animate-in slide-in-from-right fade-in duration-200 ${style.box}`}
            >
                <div className={`shrink-0 rounded-xl p-2 ${style.iconBox}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{style.title}</p>
                    <p className="mt-0.5 text-xs font-medium break-words opacity-90">{toast.message}</p>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Tutup notifikasi"
                    className="shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100 cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}