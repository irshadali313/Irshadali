import './admin.css';
import AdminShell from './_components/AdminShell';

export const metadata = {
    title: 'Admin Control Center — Portfolio Manager',
    description: 'Manage your portfolio content',
    robots: 'noindex, nofollow',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminShell>{children}</AdminShell>;
}
