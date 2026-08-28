'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Settings,
    Layers,
    Briefcase,
    FolderOpen,
    Download,
    Upload,
    RotateCcw,
    ArrowRight,
    Award,
    MessageSquare,
    Sparkles,
    Shield,
    CheckCircle2,
    Database,
} from 'lucide-react';
import { showToast } from './_components/Toast';
import ConfirmDialog from './_components/ConfirmDialog';
import { notifyPortfolioUpdated, usePortfolio } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

export default function AdminDashboard() {
    const { projects, myStack, myExperience, generalInfo, refresh } = usePortfolio();
    const [resetOpen, setResetOpen] = useState(false);

    const totalStack = Object.values(myStack || {}).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0,
    );

    const handleExport = async () => {
        try {
            const res = await fetch('/api/portfolio/data');
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const cleanData = { ...data };
            delete cleanData._id;
            delete cleanData.__v;
            delete cleanData.createdAt;
            delete cleanData.updatedAt;

            const blob = new Blob([JSON.stringify(cleanData, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'portfolio-data.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported successfully!', 'success');
        } catch {
            showToast('Failed to export data', 'error');
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target?.result as string);
                    const res = await fetch('/api/portfolio/seed?force=true', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) throw new Error();
                    notifyPortfolioUpdated();
                    await refresh();
                    showToast('Data imported successfully!', 'success');
                } catch {
                    showToast('Invalid JSON file or import failed', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleReset = async () => {
        try {
            const res = await fetch('/api/portfolio/seed?force=true', {
                method: 'POST',
                headers: { 'X-CSRF-Token': getCsrfToken() },
            });
            if (!res.ok) throw new Error();
            notifyPortfolioUpdated();
            await refresh();
            showToast('All data reset to defaults', 'info');
            setResetOpen(false);
        } catch {
            showToast('Failed to reset data', 'error');
        }
    };

    const sections = [
        {
            href: '/admin/general',
            icon: Settings,
            label: 'General Info',
            desc: 'Personal details, email, bio, social links',
            color: 'purple',
            tag: 'Config',
        },
        {
            href: '/admin/stack',
            icon: Layers,
            label: 'Tech Stack',
            desc: `${totalStack} skills across categories`,
            color: 'cyan',
            tag: `${totalStack} Items`,
        },
        {
            href: '/admin/experience',
            icon: Briefcase,
            label: 'Experience',
            desc: `${(myExperience || []).length} career timeline entries`,
            color: 'orange',
            tag: `${(myExperience || []).length} Positions`,
        },
        {
            href: '/admin/projects',
            icon: FolderOpen,
            label: 'Projects',
            desc: `${(projects || []).length} showcase items`,
            color: 'pink',
            tag: `${(projects || []).length} Active`,
        },
        {
            href: '/admin/certificates',
            icon: Award,
            label: 'Certificates',
            desc: 'Manage honors, awards & certifications',
            color: 'cyan',
            tag: 'Credentials',
        },
        {
            href: '/admin/inquiries',
            icon: MessageSquare,
            label: 'Inquiries',
            desc: 'View incoming contact messages',
            color: 'purple',
            tag: 'Inbox',
        },
    ];

    return (
        <div className="admin-page">
            {/* Hero Header Banner */}
            <div className="admin-hero-banner">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="admin-section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Sparkles size={12} />
                            Portfolio OS v2.0
                        </span>
                    </div>
                    <h1 className="admin-page-title">
                        Welcome back, {generalInfo?.fullName ? generalInfo.fullName.split(' ')[0] : 'Admin'}!
                    </h1>
                    <p className="admin-page-subtitle">
                        Manage your live portfolio content, monitor statistics, and control data snapshots.
                    </p>
                </div>
                <div className="admin-tools-row">
                    <button
                        onClick={handleExport}
                        className="admin-btn admin-btn-secondary"
                    >
                        <Download size={15} />
                        Export Data
                    </button>
                    <button
                        onClick={handleImport}
                        className="admin-btn admin-btn-secondary"
                    >
                        <Upload size={15} />
                        Import Data
                    </button>
                    <button
                        onClick={() => setResetOpen(true)}
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        title="Reset to default seed data"
                    >
                        <RotateCcw size={14} />
                        Reset Defaults
                    </button>
                </div>
            </div>

            {/* Metrics Stats Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon purple">
                        <FolderOpen size={24} />
                    </div>
                    <div>
                        <p className="admin-stat-value">{(projects || []).length}</p>
                        <p className="admin-stat-label">Featured Projects</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">
                        <Layers size={24} />
                    </div>
                    <div>
                        <p className="admin-stat-value">{totalStack}</p>
                        <p className="admin-stat-label">Tech Stack Skills</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon orange">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="admin-stat-value">{(myExperience || []).length}</p>
                        <p className="admin-stat-label">Work Experiences</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="admin-stat-value" style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>
                            {generalInfo?.fullName || 'Portfolio Owner'}
                        </p>
                        <p className="admin-stat-label">Primary Profile</p>
                    </div>
                </div>
            </div>

            {/* Quick Access Section */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <h2 className="admin-section-title">Quick Content Management</h2>
                        <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                            Direct shortcuts to edit each module of your portfolio
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {sections.map(({ href, icon: Icon, label, desc, color, tag }) => (
                        <Link
                            key={href}
                            href={href}
                            className="admin-card"
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                    <div className={`admin-stat-icon ${color}`}>
                                        <Icon size={22} />
                                    </div>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            padding: '3px 8px',
                                            borderRadius: '999px',
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid var(--admin-border)',
                                            color: 'var(--admin-text-muted)',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                </div>
                                <h3 className="admin-card-title">{label}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
                                    {desc}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1.5rem', fontSize: '13px', fontWeight: '600', color: '#c4b5fd' }}>
                                <span>Manage section</span>
                                <ArrowRight size={14} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* System Status Overview Card */}
            <div className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.6))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Database size={22} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--admin-text)' }}>Database Snapshot & Backups</h4>
                        <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                            All data mutations sync directly with database or local storage fallback.
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                    <CheckCircle2 size={16} />
                    <span>Synchronized</span>
                </div>
            </div>

            <ConfirmDialog
                isOpen={resetOpen}
                title="Reset All Data?"
                message="This action will replace your current portfolio data with default initial values. Are you sure you want to proceed?"
                onConfirm={handleReset}
                onCancel={() => setResetOpen(false)}
                confirmLabel="Reset Everything"
            />
        </div>
    );
}
