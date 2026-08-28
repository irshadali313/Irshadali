'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { showToast } from '../_components/Toast';
import { getCsrfToken } from '@/lib/csrf';

type Inquiry = {
    _id: string;
    name: string;
    email: string;
    company?: string;
    projectType: string;
    budget: string;
    timeline: string;
    details: string;
    status: 'new' | 'contacted' | 'closed';
    createdAt: string;
};

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/inquiries', { cache: 'no-store' });
            if (!response.ok) throw new Error();
            setInquiries(await response.json());
        } catch { showToast('Failed to load inquiries', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id: string, status: Inquiry['status']) => {
        const response = await fetch('/api/inquiries', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() }, body: JSON.stringify({ id, status }) });
        if (!response.ok) { showToast('Unable to update inquiry', 'error'); return; }
        setInquiries((items) => items.map((item) => item._id === id ? { ...item, status } : item));
    };

    return <div className="admin-page">
        <div className="admin-page-header">
            <div><h1 className="admin-page-title">Client inquiries</h1><p className="admin-page-subtitle">Project briefs from prospective clients</p></div>
            <button onClick={load} className="admin-btn admin-btn-secondary" disabled={loading}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        </div>
        {loading ? <div className="admin-empty"><p className="admin-empty-title">Loading inquiries...</p></div> : inquiries.length === 0 ? <div className="admin-card admin-empty"><MessageSquare size={32} /><p className="admin-empty-title">No inquiries yet</p><p className="admin-empty-subtitle">New project briefs will appear here.</p></div> : <div className="admin-list">{inquiries.slice().reverse().map((inquiry) => <article className="admin-card" key={inquiry._id}>
            <div className="admin-section-header"><div><p className="admin-card-title">{inquiry.name}{inquiry.company ? ` · ${inquiry.company}` : ''}</p><p className="admin-list-item-subtitle">{new Date(inquiry.createdAt).toLocaleDateString()} · {inquiry.projectType}</p></div><select value={inquiry.status} onChange={(event) => updateStatus(inquiry._id, event.target.value as Inquiry['status'])} className="admin-select" style={{ width: 'auto' }}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div>
            <div className="admin-chip-list"><span className="admin-badge">Budget: {inquiry.budget}</span><span className="admin-badge">Timeline: {inquiry.timeline}</span></div>
            <p style={{ marginTop: '1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{inquiry.details}</p>
            <a href={`mailto:${inquiry.email}?subject=Re: your ${inquiry.projectType} inquiry`} className="admin-btn admin-btn-primary admin-btn-sm" style={{ marginTop: '1rem' }}><Mail size={14} /> Contact {inquiry.email} <ExternalLink size={13} /></a>
        </article>)}</div>}
    </div>;
}