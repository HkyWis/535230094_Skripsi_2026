'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export type ConfirmOptions = {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
};

type ConfirmState = (ConfirmOptions & { open: true }) | null;

export function useConfirm() {
    const [state, setState] = useState<ConfirmState>(null);
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            resolverRef.current?.(false);
            resolverRef.current = resolve;
            setState({ ...options, open: true });
        });
    }, []);

    const close = useCallback((result: boolean) => {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setState(null);
    }, []);

    useEffect(() => {
        return () => {
            resolverRef.current?.(false);
        };
    }, []);

    const confirmDialog = (
        <ConfirmDialog
            state={state}
            onConfirm={() => close(true)}
            onCancel={() => close(false)}
        />
    );

    return { confirm, confirmDialog };
}

export default function ConfirmDialog({ state, onConfirm, onCancel, }: {
    state: ConfirmState;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!state) return;
        confirmBtnRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [state, onCancel]);

    if (!state) return null;

    const isDanger = (state.variant ?? 'danger') === 'danger';
    const Icon = isDanger ? AlertTriangle : HelpCircle;

    return (
        <div
            className="fixed flex items-center justify-center inset-0 z-[10000] bg-slate-950/60 backdrop-blur-sm h-screen w-screen animate-in fade-in duration-150"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
                className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`shrink-0 rounded-xl p-2.5 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                            }`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 id="confirm-title" className="text-sm font-bold text-slate-800">
                            {state.title ?? (isDanger ? 'Konfirmasi Hapus' : 'Konfirmasi')}
                        </h3>
                        <p id="confirm-message" className="mt-1 text-xs leading-relaxed text-slate-500 break-words">
                            {state.message}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                        {state.cancelText ?? 'Batal'}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        type="button"
                        onClick={onConfirm}
                        className={`cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition ${isDanger
                            ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/25 hover:from-rose-400 hover:to-red-500'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500'
                            }`}
                    >
                        {state.confirmText ?? (isDanger ? 'Ya, Hapus' : 'Ya')}
                    </button>
                </div>
            </div>
        </div>
    );
}