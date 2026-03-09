import { usePage } from '@inertiajs/react';
import HRManagerSidebar from './HRManagerSidebar';
import CEOSidebar from './CEOSidebar';
import AdminSidebar from './AdminSidebar';
import { useSidebar } from '@/components/ui/sidebar';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: Array<{ name: string }>;
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

export default function RoleBasedSidebar() {
    const page = usePage<PageProps>();
    const { auth } = page.props;
    const user = auth?.user;
    const path = ((page as { url?: string }).url || (typeof window !== 'undefined' ? window.location.pathname : '')).split('?')[0];

    // Use the new sidebar context from SidebarProvider
    let isCollapsed = false;
    try {
        const sidebarContext = useSidebar();
        isCollapsed = sidebarContext?.state === 'collapsed' || false;
    } catch {
        isCollapsed = false;
    }

    const hasRole = (roleName: string) =>
        user?.roles?.some(role => role.name === roleName) || false;

    // Prefer sidebar by current route when user has multiple roles (e.g. hr_manager + ceo)
    const isHrRoute = path === '/companies' || path.startsWith('/companies/') || path.startsWith('/hr-manager/');
    const isCeoRoute = path.startsWith('/ceo/');
    const isAdminRoute = path.startsWith('/admin/');

    if (isAdminRoute && hasRole('admin')) return <AdminSidebar isCollapsed={isCollapsed} />;
    if (isCeoRoute && hasRole('ceo')) return <CEOSidebar isCollapsed={isCollapsed} />;
    if (isHrRoute && hasRole('hr_manager')) return <HRManagerSidebar isCollapsed={isCollapsed} />;

    // Fallback by role order
    if (hasRole('admin')) return <AdminSidebar isCollapsed={isCollapsed} />;
    if (hasRole('ceo')) return <CEOSidebar isCollapsed={isCollapsed} />;
    if (hasRole('hr_manager')) return <HRManagerSidebar isCollapsed={isCollapsed} />;

    return <HRManagerSidebar isCollapsed={isCollapsed} />;
}