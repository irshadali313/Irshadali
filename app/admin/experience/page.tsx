'use client';
import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { IExperience, defaultMyExperience } from '@/lib/adminData';
import { showToast } from '../_components/Toast';
import ConfirmDialog from '../_components/ConfirmDialog';
import { notifyPortfolioUpdated } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

const emptyExp = (): IExperience => ({ title: '', company: '', duration: '' });

export default function ExperiencePage() {
    const [experiences, setExperiences] = useState<IExperience[]>(defaultMyExperience);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<IExperience>(emptyExp());
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portfolio/data')
            .then((r) => r.json())
            .then((data) => {
                if (data.myExperience) setExperiences(data.myExperience);
            })
            .catch(() => showToast('Failed to load data', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/portfolio/experience', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                body: JSON.stringify({ myExperience: experiences }),
            });
            if (!res.ok) throw new Error('Save failed');
            notifyPortfolioUpdated();
            showToast('Experience saved!', 'success');
        } catch {
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (idx: number) => {
        setEditingIndex(idx);
        setEditForm({ ...experiences[idx] });
    };

    const startAdd = () => {
        setEditingIndex(-1);
        setEditForm(emptyExp());
    };

    const commitEdit = () => {
        if (!editForm.title.trim() || !editForm.company.trim()) {
            showToast('Title and Company are required', 'error');
            return;
        }
        if (editingIndex === -1) {
            setExperiences((prev) => [{ ...editForm }, ...prev]);
        } else {
            setExperiences((prev) =>
                prev.map((e, i) => (i === editingIndex ? { ...editForm } : e)),
            );
        }
        setEditingIndex(null);
    };

    const confirmDelete = () => {
        if (deleteTarget === null) return;
        setExperiences((prev) => prev.filter((_, i) => i !== deleteTarget));
        setDeleteTarget(null);
        showToast('Experience removed', 'info');
    };

    const updateForm = (k: keyof IExperience, v: string) =>
        setEditForm((p) => ({ ...p, [k]: v }));

    const InlineForm = () => (
        <div className="admin-inline-form" style={{ marginBottom: '0.5rem' }}>
            <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="admin-form-group">
                    <label className="admin-label">Job Title</label>
                    <input
                        className="admin-input"
                        value={editForm.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                        placeholder="Software Engineer (Frontend)"
                        autoFocus
                    />
                </div>
                <div className="admin-form-group">
                    <label className="admin-label">Company</label>
                    <input
                        className="admin-input"
                        value={editForm.company}
                        onChange={(e) => updateForm('company', e.target.value)}
                        placeholder="Strativ AB"
                    />
                </div>
                <div className="admin-form-group full">
                    <label className="admin-label">Duration</label>
                    <input
                        className="admin-input"
                        value={editForm.duration}
                        onChange={(e) => updateForm('duration', e.target.value)}
                        placeholder="Dec 2024 - Present"
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={commitEdit} className="admin-btn admin-btn-primary admin-btn-sm">
                    <Save size={13} />
                    {editingIndex === -1 ? 'Add Entry' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingIndex(null)} className="admin-btn admin-btn-secondary admin-btn-sm">
                    Cancel
                </button>
            </div>
        </div>
    );

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
                    <h1 className="admin-page-title">Experience</h1>
                    <p className="admin-page-subtitle">Manage your work history</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={startAdd}
                        className="admin-btn admin-btn-secondary"
                        disabled={editingIndex !== null}
                    >
                        <Plus size={15} />
                        Add Entry
                    </button>
                    <button onClick={save} disabled={saving} className="admin-btn admin-btn-primary">
                        <Save size={15} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="admin-card">
                {editingIndex === -1 && <InlineForm />}

                <div className="admin-list">
                    {experiences.length === 0 && editingIndex !== -1 && (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">
                                <Plus size={24} />
                            </div>
                            <p className="admin-empty-title">No experience entries</p>
                            <p className="admin-empty-subtitle">Click &quot;Add Entry&quot; to get started</p>
                        </div>
                    )}

                    {experiences.map((exp, idx) => (
                        <div key={idx}>
                            {editingIndex === idx ? (
                                <InlineForm />
                            ) : (
                                <div className="admin-list-item">
                                    <GripVertical
                                        size={16}
                                        style={{ color: 'var(--admin-text-subtle)', flexShrink: 0 }}
                                    />
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: idx === 0 ? 'var(--admin-accent-2)' : 'var(--admin-text-subtle)',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div className="admin-list-item-content">
                                        <p className="admin-list-item-title">{exp.title}</p>
                                        <p className="admin-list-item-subtitle">
                                            {exp.company} · {exp.duration}
                                        </p>
                                    </div>
                                    {idx === 0 && (
                                        <span className="admin-badge" style={{ background: 'rgba(90,240,196,0.1)', color: '#5af0c4', borderColor: 'rgba(90,240,196,0.2)', marginRight: 4 }}>
                                            Current
                                        </span>
                                    )}
                                    <div className="admin-list-item-actions">
                                        <button
                                            onClick={() => startEdit(idx)}
                                            className="admin-btn admin-btn-secondary admin-btn-sm"
                                            disabled={editingIndex !== null}
                                        >
                                            <Pencil size={12} />
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
                title="Remove Experience?"
                message={`Remove "${deleteTarget !== null ? experiences[deleteTarget]?.title : ''}" from ${deleteTarget !== null ? experiences[deleteTarget]?.company : ''}?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                confirmLabel="Remove"
            />
        </div>
    );
}
