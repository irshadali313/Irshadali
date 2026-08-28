'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil, ExternalLink, Image as ImageIcon, LayoutGrid, List } from 'lucide-react';
import { IProject } from '@/types';
import { defaultProjects } from '@/lib/adminData';
import { showToast } from '../_components/Toast';
import ConfirmDialog from '../_components/ConfirmDialog';
import { notifyPortfolioUpdated } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

export default function ProjectsPage() {
    const [projects, setLocalProjects] = useState<IProject[]>(defaultProjects);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetch('/api/portfolio/data')
            .then((r) => r.json())
            .then((data) => {
                if (data.projects) setLocalProjects(data.projects);
            })
            .catch(() => showToast('Failed to load data', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const updated = projects.filter((p) => p.slug !== deleteTarget);
        try {
            const res = await fetch('/api/portfolio/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                body: JSON.stringify({ projects: updated }),
            });
            if (!res.ok) throw new Error('Delete failed');
            setLocalProjects(updated);
            notifyPortfolioUpdated();
            showToast('Project deleted', 'info');
        } catch {
            showToast('Failed to delete project', 'error');
        } finally {
            setDeleteTarget(null);
        }
    };

    const targetProject = projects.find((p) => p.slug === deleteTarget);

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
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Projects</h1>
                    <p className="admin-page-subtitle">
                        {projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* View Mode Toggle */}
                    <div className="admin-view-toggle">
                        <button
                            className={`admin-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button
                            className={`admin-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <List size={15} />
                        </button>
                    </div>
                    <Link href="/admin/projects/new" className="admin-btn admin-btn-primary">
                        <Plus size={15} />
                        Add Project
                    </Link>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="admin-card">
                    <div className="admin-empty">
                        <div className="admin-empty-icon">
                            <ImageIcon size={24} />
                        </div>
                        <p className="admin-empty-title">No projects yet</p>
                        <p className="admin-empty-subtitle">Click &quot;Add Project&quot; to showcase your work</p>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── Grid View ── */
                <div className="admin-projects-grid">
                    {projects.map((project) => (
                        <div key={project.slug} className="admin-project-grid-card">
                            {/* Thumbnail */}
                            <div className="admin-project-grid-thumb">
                                {project.thumbnail ? (
                                    <img
                                        src={project.thumbnail}
                                        alt={project.title}
                                        className="admin-project-grid-img"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="admin-project-grid-placeholder">
                                        <ImageIcon size={28} />
                                    </div>
                                )}
                                {/* Overlay actions on hover */}
                                <div className="admin-project-grid-overlay">
                                    <Link
                                        href={`/admin/projects/${project.slug}`}
                                        className="admin-btn admin-btn-primary admin-btn-sm"
                                    >
                                        <Pencil size={12} />
                                        Edit
                                    </Link>
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="admin-btn admin-btn-secondary admin-btn-sm"
                                        >
                                            <ExternalLink size={12} />
                                            Live
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="admin-project-grid-body">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p className="admin-project-title" style={{ fontSize: 14 }}>{project.title}</p>
                                        <div className="admin-project-meta" style={{ marginTop: 4 }}>
                                            <span>{project.year}</span>
                                            <span>·</span>
                                            <span>{project.techStack.slice(0, 2).join(', ')}{project.techStack.length > 2 ? ` +${project.techStack.length - 2}` : ''}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDeleteTarget(project.slug)}
                                        className="admin-btn admin-btn-ghost admin-btn-icon"
                                        style={{ flexShrink: 0 }}
                                    >
                                        <Trash2 size={14} style={{ color: 'var(--admin-danger)' }} />
                                    </button>
                                </div>
                                <span className="admin-badge" style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8, display: 'inline-block' }}>
                                    /{project.slug}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ── List View ── */
                <div className="admin-card">
                    <div className="admin-list">
                        {projects.map((project) => (
                            <div key={project.slug} className="admin-list-item">
                                {project.thumbnail ? (
                                    <img
                                        src={project.thumbnail}
                                        alt={project.title}
                                        className="admin-project-thumb"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="admin-project-thumb-placeholder">
                                        <ImageIcon size={18} />
                                    </div>
                                )}
                                <div className="admin-project-info">
                                    <p className="admin-project-title">{project.title}</p>
                                    <div className="admin-project-meta">
                                        <span>{project.year}</span>
                                        <span>·</span>
                                        <span>{project.techStack.slice(0, 3).join(', ')}{project.techStack.length > 3 ? ` +${project.techStack.length - 3}` : ''}</span>
                                        {project.liveUrl && (
                                            <>
                                                <span>·</span>
                                                <a
                                                    href={project.liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--admin-accent)', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Live <ExternalLink size={10} />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="admin-badge" style={{ fontFamily: 'monospace', fontSize: 10 }}>
                                    /{project.slug}
                                </span>
                                <div className="admin-list-item-actions">
                                    <Link
                                        href={`/admin/projects/${project.slug}`}
                                        className="admin-btn admin-btn-secondary admin-btn-sm"
                                    >
                                        <Pencil size={12} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteTarget(project.slug)}
                                        className="admin-btn admin-btn-ghost admin-btn-icon"
                                    >
                                        <Trash2 size={14} style={{ color: 'var(--admin-danger)' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Project?"
                message={`Are you sure you want to delete "${targetProject?.title}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
