'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

export default function AdminHeader() {
    const pathname = usePathname();
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const savedTheme = (localStorage.getItem('admin-theme') as 'dark' | 'light') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-admin-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('admin-theme', nextTheme);
        document.documentElement.setAttribute('data-admin-theme', nextTheme);
    };

    const formattedPath = pathname === '/admin' ? 'Dashboard' : pathname.replace('/admin/', '').replace('-', ' ');
    const pageTitle = formattedPath.charAt(0).toUpperCase() + formattedPath.slice(1);

    return (
        <header className="admin-header-bar">
            <div className="admin-breadcrumb">
                <span>Admin</span>
                <span>/</span>
                <span className="admin-breadcrumb-active">{pageTitle}</span>
            </div>
            <div className="admin-header-actions">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="admin-theme-toggle-btn"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>

                <div className="admin-status-pill">
                    <span className="admin-status-dot"></span>
                    <span>System Active</span>
                </div>
            </div>
        </header>
    );
}
