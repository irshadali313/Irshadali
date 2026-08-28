'use client';
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, Image as ImageIcon, Award } from 'lucide-react';
import { ICertificate, getDirectImageUrl, defaultCertificates } from '@/lib/adminData';
import { showToast } from '../_components/Toast';
import ConfirmDialog from '../_components/ConfirmDialog';
import { notifyPortfolioUpdated } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

export default function CertificatesPage() {
    const [certificates, setLocalCertificates] = useState<ICertificate[]>(defaultCertificates);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<ICertificate>({
        id: '',
        title: '',
        issuer: '',
        date: '',
        image: '',
        url: '',
    });
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/portfolio/data')
            .then((r) => r.json())
            .then((data) => {
                if (data.certificates) setLocalCertificates(data.certificates);
            })
            .catch(() => showToast('Failed to load data', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const save = async (certsToSave?: ICertificate[]) => {
        // Commit any in-progress edit before saving
        let finalCertificates = certsToSave ?? certificates;
        if (!certsToSave && editingIndex !== null) {
            if (!editForm.title.trim() || !editForm.issuer.trim()) {
                showToast('Please save or cancel the current edit first', 'error');
                return;
            }
            finalCertificates = certificates.map((item, i) =>
                i === editingIndex ? { ...editForm } : item
            );
            setLocalCertificates(finalCertificates);
            setEditingIndex(null);
        }

        setSaving(true);
        try {
            const res = await fetch('/api/portfolio/certificates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                body: JSON.stringify({ certificates: finalCertificates }),
            });
            if (!res.ok) throw new Error('Save failed');
            notifyPortfolioUpdated();
            showToast('Certificates saved!', 'success');
        } catch {
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (idx: number) => {
        setEditingIndex(idx);
        setEditForm({ ...certificates[idx] });
    };

    const saveEdit = () => {
        if (!editForm.title.trim() || !editForm.issuer.trim()) {
            showToast('Title and Issuer are required', 'error');
            return;
        }
        setLocalCertificates((prev) =>
            prev.map((item, i) => (i === editingIndex ? { ...editForm } : item)),
        );
        setEditingIndex(null);
    };

    const cancelEdit = () => setEditingIndex(null);

    const addNew = () => {
        const newItem: ICertificate = {
            id: `cert-${Date.now()}`,
            title: 'New Certificate',
            issuer: 'Issuing Organization',
            date: new Date().getFullYear().toString(),
            image: '',
            url: '',
        };
        setLocalCertificates((prev) => [...prev, newItem]);
        setEditingIndex(certificates.length);
        setEditForm(newItem);
    };

    const confirmDelete = () => {
        if (deleteTarget === null) return;
        const updated = certificates.filter((_, i) => i !== deleteTarget);
        setLocalCertificates(updated);
        setDeleteTarget(null);
        showToast('Certificate removed', 'info');
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-empty" style={{ paddingTop: '4rem' }}>
                    <p className="admin-empty-title">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Certificates</h1>
                    <p className="admin-page-subtitle">Manage your certifications and awards</p>
                </div>
                <button onClick={() => save()} disabled={saving} className="admin-btn admin-btn-primary">
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-section-header">
                    <p className="admin-section-title">All Certificates</p>
                    <button onClick={addNew} className="admin-btn admin-btn-secondary admin-btn-sm">
                        <Plus size={14} />
                        Add Certificate
                    </button>
                </div>

                <div className="admin-list">
                    {certificates.length === 0 && (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">
                                <Award size={24} />
                            </div>
                            <p className="admin-empty-title">No certificates yet</p>
                            <p className="admin-empty-subtitle">Click &quot;Add Certificate&quot; to showcase your achievements</p>
                        </div>
                    )}

                    {certificates.map((cert, idx) => (
                        <div key={cert.id}>
                            {editingIndex === idx ? (
                                <div className="admin-inline-form">
                                    <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Certificate Title</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                                placeholder="Frontend Developer Certification"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Issuer Organization</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.issuer}
                                                onChange={(e) => setEditForm((p) => ({ ...p, issuer: e.target.value }))}
                                                placeholder="Udacity"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Year / Date</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                                                placeholder="2023"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Image URL / Path</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.image}
                                                onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.value }))}
                                                placeholder="/certificates/cert1.jpg or Google Drive URL"
                                            />
                                        </div>
                                        <div className="admin-form-group full">
                                            <label className="admin-label">Verification URL (Optional)</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.url || ''}
                                                onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))}
                                                placeholder="https://verify.example.com/cert"
                                            />
                                        </div>
                                        {editForm.image && (
                                            <div className="admin-form-group full">
                                                <label className="admin-label">Image Preview</label>
                                                <img
                                                    src={getDirectImageUrl(editForm.image)}
                                                    alt="preview"
                                                    style={{ maxWidth: 200, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--admin-border)' }}
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={saveEdit} className="admin-btn admin-btn-primary admin-btn-sm">
                                            <Save size={13} /> Save
                                        </button>
                                        <button onClick={cancelEdit} className="admin-btn admin-btn-secondary admin-btn-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="admin-list-item">
                                    <GripVertical size={16} style={{ color: 'var(--admin-text-subtle)', flexShrink: 0 }} />
                                    <div style={{ width: 40, height: 40, background: 'var(--admin-surface-3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {cert.image ? (
                                            <img src={getDirectImageUrl(cert.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                                        ) : (
                                            <ImageIcon size={18} style={{ color: 'var(--admin-text-muted)' }} />
                                        )}
                                    </div>
                                    <div className="admin-list-item-content">
                                        <p className="admin-list-item-title">{cert.title}</p>
                                        <p className="admin-list-item-subtitle">{cert.issuer} • {cert.date}</p>
                                    </div>
                                    <div className="admin-list-item-actions">
                                        <button
                                            onClick={() => startEdit(idx)}
                                            className="admin-btn admin-btn-secondary admin-btn-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(idx)}
                                            className="admin-btn admin-btn-ghost admin-btn-icon"
                                        >
                                            <Trash2 size={14} style={{ color: 'var(--admin-danger)' }} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Remove Certificate?"
                message={`Are you sure you want to remove "${deleteTarget !== null ? certificates[deleteTarget]?.title : ''}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                confirmLabel="Remove"
            />
        </div>
    );
}
