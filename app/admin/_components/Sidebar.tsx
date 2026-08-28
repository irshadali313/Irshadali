'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Settings,
    Layers,
    Briefcase,
    FolderOpen,
    ExternalLink,
    ChevronRight,
    LogOut,
    Award,
    MessageSquare,
    Sparkles,
} from 'lucide-react';
import { logoutAdmin } from '../actions';

const coreNav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/general', label: 'General Info', icon: Settings },
];

const contentNav = [
    { href: '/admin/stack', label: 'Tech Stack', icon: Layers },
    { href: '/admin/experience', label: 'Experience', icon: Briefcase },
    { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
    { href: '/admin/certificates', label: 'Certificates', icon: Award },
    { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <aside className="admin-sidebar">
            {/* Logo Header */}
            <div className="admin-sidebar-logo">
                <div className="admin-logo-icon">
                    <Sparkles size={20} />
                </div>
                <div>
                    <p className="admin-logo-title">Portfolio OS</p>
                    <p className="admin-logo-subtitle">Admin Control Center</p>
                </div>
            </div>

            {/* Nav Menu */}
            <nav className="admin-nav">
                <p className="admin-nav-group-label">Overview</p>
                {coreNav.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        prefetch={true}
                        className={`admin-nav-item ${isActive(href) ? 'active' : ''}`}
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                        {isActive(href) && (
                            <ChevronRight size={14} className="ml-auto opacity-70" />
                        )}
                    </Link>
                ))}

                <p className="admin-nav-group-label">Content</p>
                {contentNav.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        prefetch={true}
                        className={`admin-nav-item ${isActive(href) ? 'active' : ''}`}
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                        {isActive(href) && (
                            <ChevronRight size={14} className="ml-auto opacity-70" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="admin-sidebar-footer">
                <Link
                    href="/"
                    target="_blank"
                    className="admin-view-site-btn"
                >
                    <ExternalLink size={15} />
                    <span>Live Portfolio</span>
                </Link>
                <button
                    onClick={async () => {
                        await logoutAdmin();
                        window.location.href = '/admin/login';
                    }}
                    className="admin-logout-btn"
                >
                    <LogOut size={15} />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}
