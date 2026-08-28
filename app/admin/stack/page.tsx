'use client';
import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { IMyStack, IStackItem, defaultMyStack } from '@/lib/adminData';
import { showToast } from '../_components/Toast';
import ConfirmDialog from '../_components/ConfirmDialog';
import { notifyPortfolioUpdated } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

const CATEGORIES = ['frontend', 'backend', 'database', 'tools'] as const;

export default function StackPage() {
    const [stack, setStack] = useState<IMyStack>(defaultMyStack);
    const [activeTab, setActiveTab] = useState<string>('frontend');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<IStackItem>({ name: '', icon: '' });
    const [deleteTarget, setDeleteTarget] = useState<{ cat: string; idx: number } | null>(null);

    useEffect(() => {
        fetch('/api/portfolio/data')
            .then((r) => r.json())
            .then((data) => {
                if (data.myStack) setStack(data.myStack);
            })
            .catch(() => showToast('Failed to load data', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/portfolio/stack', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                body: JSON.stringify({ myStack: stack }),
            });
            if (!res.ok) throw new Error('Save failed');
            notifyPortfolioUpdated();
            showToast('Tech stack saved!', 'success');
        } catch {
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (idx: number) => {
        setEditingIndex(idx);
        setEditForm({ ...stack[activeTab][idx] });
    };

    const saveEdit = () => {
        if (!editForm.name.trim()) return;
        setStack((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].map((item, i) =>
                i === editingIndex ? { ...editForm } : item,
            ),
        }));
        setEditingIndex(null);
    };

    const cancelEdit = () => setEditingIndex(null);

    const addNew = () => {
        const newItem: IStackItem = { name: 'New Skill', icon: '/logo/js.png' };
        setStack((prev) => ({
            ...prev,
            [activeTab]: [...prev[activeTab], newItem],
        }));
        const newIdx = stack[activeTab].length;
        setEditingIndex(newIdx);
        setEditForm(newItem);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setStack((prev) => ({
            ...prev,
            [deleteTarget.cat]: prev[deleteTarget.cat].filter(
                (_, i) => i !== deleteTarget.idx,
            ),
        }));
        setDeleteTarget(null);
        showToast('Skill removed', 'info');
    };

    const currentItems = stack[activeTab] || [];

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
                    <h1 className="admin-page-title">Tech Stack</h1>
                    <p className="admin-page-subtitle">
                        Manage your skills and technologies
                    </p>
                </div>
                <button onClick={save} disabled={saving} className="admin-btn admin-btn-primary">
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Category Tabs */}
            <div className="admin-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`admin-tab ${activeTab === cat ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(cat);
                            setEditingIndex(null);
                        }}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        <span style={{
                            marginLeft: 6,
                            background: 'rgba(255,255,255,0.12)',
                            borderRadius: '999px',
                            padding: '1px 7px',
                            fontSize: 11,
                        }}>
                            {(stack[cat] || []).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Item List */}
            <div className="admin-card">
                <div className="admin-section-header">
                    <p className="admin-section-title" style={{ textTransform: 'capitalize' }}>
                        {activeTab} Technologies
                    </p>
                    <button onClick={addNew} className="admin-btn admin-btn-secondary admin-btn-sm">
                        <Plus size={14} />
                        Add Skill
                    </button>
                </div>

                <div className="admin-list">
                    {currentItems.length === 0 && (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">
                                <Plus size={24} />
                            </div>
                            <p className="admin-empty-title">No skills yet</p>
                            <p className="admin-empty-subtitle">Click &quot;Add Skill&quot; to add your first technology</p>
                        </div>
                    )}

                    {currentItems.map((item, idx) => (
                        <div key={idx}>
                            {editingIndex === idx ? (
                                <div className="admin-inline-form">
                                    <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Skill Name</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm((p) => ({ ...p, name: e.target.value }))
                                                }
                                                placeholder="React"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Icon Path / URL</label>
                                            <input
                                                className="admin-input"
                                                value={editForm.icon}
                                                onChange={(e) =>
                                                    setEditForm((p) => ({ ...p, icon: e.target.value }))
                                                }
                                                placeholder="/logo/react.png"
                                            />
                                        </div>
                                    </div>
                                    {editForm.icon && (
                                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img
                                                src={editForm.icon}
                                                alt="preview"
                                                style={{ width: 32, height: 32, objectFit: 'contain', background: '#172033', borderRadius: 6, padding: 4 }}
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                            <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>Icon preview</span>
                                        </div>
                                    )}
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
                                    {item.icon && (
                                        <img
                                            src={item.icon}
                                            alt={item.name}
                                            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, background: '#172033', borderRadius: 6, padding: 4 }}
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    )}
                                    <div className="admin-list-item-content">
                                        <p className="admin-list-item-title">{item.name}</p>
                                        <p className="admin-list-item-subtitle">{item.icon}</p>
                                    </div>
                                    <div className="admin-list-item-actions">
                                        <button
                                            onClick={() => startEdit(idx)}
                                            className="admin-btn admin-btn-secondary admin-btn-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget({ cat: activeTab, idx })}
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
                isOpen={!!deleteTarget}
                title="Remove Skill?"
                message={`Are you sure you want to remove "${deleteTarget ? currentItems[deleteTarget.idx]?.name : ''}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                confirmLabel="Remove"
            />
        </div>
    );
}
