'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { IProject } from '@/types';
import { showToast } from '../../_components/Toast';
import { notifyPortfolioUpdated } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

interface ProjectFormProps {
    initialData: IProject;
    isNew?: boolean;
    allProjects?: IProject[]; // passed from edit page to know the full list
}

export default function ProjectForm({ initialData, isNew = false }: ProjectFormProps) {
    const router = useRouter();
    const [form, setForm] = useState<IProject>(initialData);
    const [techInput, setTechInput] = useState('');
    const [imgInput, setImgInput] = useState('');
    const [saving, setSaving] = useState(false);

    const update = <K extends keyof IProject>(key: K, value: IProject[K]) =>
        setForm((p) => ({ ...p, [key]: value }));

    const addTech = () => {
        const val = techInput.trim();
        if (!val || form.techStack.includes(val)) return;
        update('techStack', [...form.techStack, val]);
        setTechInput('');
    };

    const removeTech = (t: string) =>
        update('techStack', form.techStack.filter((x) => x !== t));

    const addImage = () => {
        const val = imgInput.trim();
        if (!val) return;
        update('images', [...form.images, val]);
        setImgInput('');
    };

    const removeImage = (i: number) =>
        update('images', form.images.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        if (!form.title.trim() || !form.slug.trim()) {
            showToast('Title and Slug are required', 'error');
            return;
        }
        setSaving(true);

        try {
            // Fetch current projects from API
            const res = await fetch('/api/portfolio/data');
            const data = await res.json();
            const projects: IProject[] = data.projects || [];

            let updated: IProject[];
            if (isNew) {
                if (projects.some((p) => p.slug === form.slug)) {
                    showToast('Slug already exists, please choose another', 'error');
                    setSaving(false);
                    return;
                }
                updated = [...projects, form];
            } else {
                updated = projects.map((p) => (p.slug === initialData.slug ? form : p));
            }

            const saveRes = await fetch('/api/portfolio/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                body: JSON.stringify({ projects: updated }),
            });

            if (!saveRes.ok) throw new Error('Save failed');

            notifyPortfolioUpdated();
            showToast(isNew ? 'Project created!' : 'Project saved!', 'success');
            if (isNew) router.push('/admin/projects');
        } catch {
            showToast('Failed to save project', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Link href="/admin/projects" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '4px 8px' }}>
                            <ArrowLeft size={14} />
                            Back
                        </Link>
                    </div>
                    <h1 className="admin-page-title">
                        {isNew ? 'New Project' : `Edit: ${initialData.title}`}
                    </h1>
                    <p className="admin-page-subtitle">
                        {isNew ? 'Add a new project to your portfolio' : 'Edit project details'}
                    </p>
                </div>
                <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
                    <Save size={15} />
                    {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
                </button>
            </div>

            {/* Basic Info */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '1.25rem' }}>Basic Information</p>
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label className="admin-label">Project Title *</label>
                        <input
                            className="admin-input"
                            value={form.title}
                            onChange={(e) => update('title', e.target.value)}
                            placeholder="Electro EV"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Slug * (URL-safe identifier)</label>
                        <input
                            className="admin-input"
                            value={form.slug}
                            onChange={(e) =>
                                update('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                            }
                            placeholder="electro-ev"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Year</label>
                        <input
                            className="admin-input"
                            type="number"
                            value={form.year}
                            onChange={(e) => update('year', parseInt(e.target.value) || new Date().getFullYear())}
                            min="2000"
                            max="2099"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Live URL</label>
                        <input
                            className="admin-input"
                            value={form.liveUrl || ''}
                            onChange={(e) => update('liveUrl', e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                    <div className="admin-form-group full">
                        <label className="admin-label">Source Code URL</label>
                        <input
                            className="admin-input"
                            value={form.sourceCode || ''}
                            onChange={(e) => update('sourceCode', e.target.value)}
                            placeholder="https://github.com/..."
                        />
                    </div>
                </div>
            </div>

            {/* Description & Role */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '1.25rem' }}>Description & Role</p>
                <div className="admin-form-grid single">
                    <div className="admin-form-group">
                        <label className="admin-label">Description (supports HTML)</label>
                        <textarea
                            className="admin-textarea"
                            value={form.description}
                            onChange={(e) => update('description', e.target.value)}
                            rows={6}
                            placeholder="Describe the project..."
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Your Role (supports HTML)</label>
                        <textarea
                            className="admin-textarea"
                            value={form.role}
                            onChange={(e) => update('role', e.target.value)}
                            rows={5}
                            placeholder="Describe your role..."
                        />
                    </div>
                </div>
            </div>

            {/* Tech Stack */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '1rem' }}>Tech Stack</p>
                <div className="admin-chip-list" style={{ marginBottom: '1rem' }}>
                    {form.techStack.map((t) => (
                        <button
                            key={t}
                            className="admin-chip"
                            onClick={() => removeTech(t)}
                            title="Click to remove"
                        >
                            {t}
                            <Trash2 size={10} />
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        className="admin-input"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTech()}
                        placeholder="Type a technology and press Enter or +"
                        style={{ flex: 1 }}
                    />
                    <button onClick={addTech} className="admin-btn admin-btn-secondary">
                        <Plus size={14} />
                        Add
                    </button>
                </div>
            </div>

            {/* Images */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '0.5rem' }}>Images</p>
                <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>
                    Use paths like <code style={{ fontFamily: 'monospace', background: 'var(--admin-surface-3)', padding: '1px 5px', borderRadius: 4 }}>/projects/thumbnail/name.webp</code>
                </p>

                <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label className="admin-label">Thumbnail (small card image)</label>
                    <input
                        className="admin-input"
                        value={form.thumbnail}
                        onChange={(e) => update('thumbnail', e.target.value)}
                        placeholder="/projects/thumbnail/project.webp"
                    />
                    {form.thumbnail && (
                        <img src={form.thumbnail} alt="thumb" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                </div>

                <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                    <label className="admin-label">Long Thumbnail (project detail image)</label>
                    <input
                        className="admin-input"
                        value={form.longThumbnail}
                        onChange={(e) => update('longThumbnail', e.target.value)}
                        placeholder="/projects/long/project.webp"
                    />
                    {form.longThumbnail && (
                        <img src={form.longThumbnail} alt="long" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Additional Images ({form.images.length})</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                        {form.images.map((img, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                    className="admin-input"
                                    value={img}
                                    onChange={(e) => {
                                        const arr = [...form.images];
                                        arr[i] = e.target.value;
                                        update('images', arr);
                                    }}
                                    style={{ flex: 1 }}
                                />
                                {img && <img src={img} alt="" style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 4 }} onError={(e) => (e.currentTarget.style.display = 'none')} />}
                                <button onClick={() => removeImage(i)} className="admin-btn admin-btn-ghost admin-btn-icon">
                                    <Trash2 size={13} style={{ color: 'var(--admin-danger)' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            className="admin-input"
                            value={imgInput}
                            onChange={(e) => setImgInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addImage()}
                            placeholder="/projects/images/name-1.png"
                            style={{ flex: 1 }}
                        />
                        <button onClick={addImage} className="admin-btn admin-btn-secondary">
                            <Plus size={14} />
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Save bottom */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: '2rem' }}>
                <Link href="/admin/projects" className="admin-btn admin-btn-secondary">
                    Cancel
                </Link>
                <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
                    <Save size={15} />
                    {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
