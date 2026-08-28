'use client';
import { useEffect, useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import {
    IGeneralInfo,
    ISocialLink,
    IBannerStats,
    IAboutMe,
    defaultGeneralInfo,
    defaultSocialLinks,
    defaultBannerStats,
    defaultAboutMe,
} from '@/lib/adminData';
import { showToast } from '../_components/Toast';
import { notifyPortfolioUpdated } from '@/lib/portfolioContext';
import { getCsrfToken } from '@/lib/csrf';

export default function GeneralPage() {
    const [info, setInfo] = useState<IGeneralInfo>(defaultGeneralInfo);
    const [socialLinks, setSL] = useState<ISocialLink[]>(defaultSocialLinks);
    const [bannerStats, setBS] = useState<IBannerStats>(defaultBannerStats);
    const [aboutMe, setAM] = useState<IAboutMe>(defaultAboutMe);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load data from API on mount
    useEffect(() => {
        fetch('/api/portfolio/data')
            .then((r) => r.json())
            .then((data) => {
                if (data.generalInfo) setInfo(data.generalInfo);
                if (data.socialLinks) setSL(data.socialLinks);
                if (data.bannerStats) setBS(data.bannerStats);
                if (data.aboutMe) setAM(data.aboutMe);
            })
            .catch(() => showToast('Failed to load data', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const saveAll = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/portfolio/general', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
                body: JSON.stringify({ generalInfo: info, socialLinks, bannerStats, aboutMe }),
            });
            if (!res.ok) throw new Error('Save failed');
            notifyPortfolioUpdated();
            showToast('General info saved!', 'success');
        } catch {
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateInfo = (k: keyof IGeneralInfo, v: string) =>
        setInfo((prev) => ({ ...prev, [k]: v }));
    const updateStats = (k: keyof IBannerStats, v: string) =>
        setBS((prev) => ({ ...prev, [k]: v }));
    const updateAbout = (k: keyof IAboutMe, v: string) =>
        setAM((prev) => ({ ...prev, [k]: v }));

    const updateLink = (i: number, k: keyof ISocialLink, v: string) =>
        setSL((prev) => prev.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
    const removeLink = (i: number) =>
        setSL((prev) => prev.filter((_, idx) => idx !== i));
    const addLink = () =>
        setSL((prev) => [...prev, { name: '', url: '' }]);

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
                    <h1 className="admin-page-title">General Info</h1>
                    <p className="admin-page-subtitle">
                        Manage your basic portfolio information
                    </p>
                </div>
                <button
                    onClick={saveAll}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                >
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* Personal Info */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '1.25rem' }}>Personal Details</p>
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label className="admin-label">First Name</label>
                        <input
                            className="admin-input"
                            value={info.firstName}
                            onChange={(e) => updateInfo('firstName', e.target.value)}
                            placeholder="jhon"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Full Name</label>
                        <input
                            className="admin-input"
                            value={info.fullName}
                            onChange={(e) => updateInfo('fullName', e.target.value)}
                            placeholder="jhon doe"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Email</label>
                        <input
                            className="admin-input"
                            value={info.email}
                            onChange={(e) => updateInfo('email', e.target.value)}
                            placeholder="[EMAIL_ADDRESS]"
                            type="email"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Upwork Profile URL</label>
                        <input
                            className="admin-input"
                            value={info.upworkProfile}
                            onChange={(e) => updateInfo('upworkProfile', e.target.value)}
                            placeholder="https://www.upwork.com/freelancers/..."
                        />
                    </div>
                    <div className="admin-form-group full">
                        <label className="admin-label">Developer Title (use \n for line break)</label>
                        <input
                            className="admin-input"
                            value={info.developerTitle}
                            onChange={(e) => updateInfo('developerTitle', e.target.value)}
                            placeholder="FRONTEND\nDEVELOPER"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Email Subject</label>
                        <input
                            className="admin-input"
                            value={info.emailSubject}
                            onChange={(e) => updateInfo('emailSubject', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Old Portfolio URL</label>
                        <input
                            className="admin-input"
                            value={info.oldPortfolio}
                            onChange={(e) => updateInfo('oldPortfolio', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group full">
                        <label className="admin-label">Email Body Template</label>
                        <textarea
                            className="admin-textarea"
                            value={info.emailBody}
                            onChange={(e) => updateInfo('emailBody', e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* Banner Stats */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '1.25rem' }}>Banner Stats</p>
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label className="admin-label">Years of Experience</label>
                        <input
                            className="admin-input"
                            value={bannerStats.yearsExperience}
                            onChange={(e) => updateStats('yearsExperience', e.target.value)}
                            placeholder="3+"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Completed Projects</label>
                        <input
                            className="admin-input"
                            value={bannerStats.completedProjects}
                            onChange={(e) => updateStats('completedProjects', e.target.value)}
                            placeholder="7+"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Hours Worked</label>
                        <input
                            className="admin-input"
                            value={bannerStats.hoursWorked}
                            onChange={(e) => updateStats('hoursWorked', e.target.value)}
                            placeholder="10K+"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Availability Status</label>
                        <input
                            className="admin-input"
                            value={bannerStats.availableStatus}
                            onChange={(e) => updateStats('availableStatus', e.target.value)}
                            placeholder="Available for full-time opportunities"
                        />
                    </div>
                </div>
            </div>

            {/* About Me */}
            <div className="admin-card admin-section">
                <p className="admin-card-title" style={{ marginBottom: '1.25rem' }}>About Me Section</p>
                <div className="admin-form-grid single">
                    <div className="admin-form-group">
                        <label className="admin-label">Headline Quote</label>
                        <textarea
                            className="admin-textarea"
                            value={aboutMe.headline}
                            onChange={(e) => updateAbout('headline', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Bio Paragraph 1</label>
                        <textarea
                            className="admin-textarea"
                            value={aboutMe.bio1}
                            onChange={(e) => updateAbout('bio1', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Bio Paragraph 2</label>
                        <textarea
                            className="admin-textarea"
                            value={aboutMe.bio2}
                            onChange={(e) => updateAbout('bio2', e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="admin-card admin-section">
                <div className="admin-section-header">
                    <p className="admin-card-title">Social Links</p>
                    <button onClick={addLink} className="admin-btn admin-btn-secondary admin-btn-sm">
                        <Plus size={14} />
                        Add Link
                    </button>
                </div>
                <div className="admin-list">
                    {socialLinks.map((link, i) => (
                        <div key={i} className="admin-list-item">
                            <div className="admin-item-num">{i + 1}</div>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                                <input
                                    className="admin-input"
                                    value={link.name}
                                    onChange={(e) => updateLink(i, 'name', e.target.value)}
                                    placeholder="Platform name"
                                />
                                <input
                                    className="admin-input"
                                    value={link.url}
                                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <button
                                onClick={() => removeLink(i)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                            >
                                <Trash2 size={15} style={{ color: 'var(--admin-danger)' }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save bottom */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
                <button onClick={saveAll} disabled={saving} className="admin-btn admin-btn-primary">
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
