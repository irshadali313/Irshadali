'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { ToastContainer } from './Toast';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const savedTheme = (localStorage.getItem('admin-theme') as 'dark' | 'light') || 'dark';
        document.documentElement.setAttribute('data-admin-theme', savedTheme);
    }, []);

    const isPublicAuthPage =
        pathname === '/admin/login' ||
        pathname.startsWith('/admin/login/') ||
        pathname === '/admin/reset-password' ||
        pathname.startsWith('/admin/reset-password/');

    if (isPublicAuthPage) {
        return (
            <div className="admin-root login-page-root">
                {children}
            </div>
        );
    }

    return (
        <div className="admin-root">
            <Sidebar />
            <div className="admin-content">
                <AdminHeader />
                {children}
            </div>
            <ToastContainer />
        </div>
    );
}
