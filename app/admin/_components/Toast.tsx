'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={18} className="text-emerald-400" />,
        error: <XCircle size={18} className="text-red-400" />,
        info: <AlertCircle size={18} className="text-blue-400" />,
    };

    return (
        <div className={`admin-toast admin-toast-${type}`}>
            {icons[type]}
            <span>{message}</span>
            <button onClick={onClose} className="admin-toast-close">
                <X size={14} />
            </button>
        </div>
    );
}

// Global toast container
interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

let addToastFn: ((_msg: string, _type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'success') {
    if (addToastFn) addToastFn(message, type);
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        addToastFn = (message, type) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type }]);
        };
        return () => { addToastFn = null; };
    }, []);

    const remove = (id: number) =>
        setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <div className="admin-toast-container">
            {toasts.map((t) => (
                <Toast
                    key={t.id}
                    message={t.message}
                    type={t.type}
                    onClose={() => remove(t.id)}
                />
            ))}
        </div>
    );
}
