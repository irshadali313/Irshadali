'use client';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    confirmClassName?: string;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Delete',
    confirmClassName = 'admin-btn-danger',
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="admin-dialog-overlay" onClick={onCancel}>
            <div
                className="admin-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-dialog-icon">
                    <AlertTriangle size={24} className="text-red-400" />
                </div>
                <h3 className="admin-dialog-title">{title}</h3>
                <p className="admin-dialog-message">{message}</p>
                <div className="admin-dialog-actions">
                    <button onClick={onCancel} className="admin-btn admin-btn-secondary">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`admin-btn ${confirmClassName}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
