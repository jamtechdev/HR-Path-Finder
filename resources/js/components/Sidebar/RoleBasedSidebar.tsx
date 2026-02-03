import { usePage } from '@inertiajs/react';
import HRManagerSidebar from './HRManagerSidebar';
import CEOSidebar from './CEOSidebar';
import ConsultantSidebar from './ConsultantSidebar';
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
}

export default function RoleBasedSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    
    // Use the new sidebar context from SidebarProvider
    // Try to get sidebar context, fallback to expanded if not available
    let isCollapsed = false;
    try {
        const sidebarContext = useSidebar();
        isCollapsed = sidebarContext?.state === 'collapsed' || false;
    } catch (error) {
        // SidebarProvider not available, default to expanded
        isCollapsed = false;
    }
    
    // Check user roles
    const hasRole = (roleName: string) => {
        return user?.roles?.some(role => role.name === roleName) || false;
    };
    
    // Return appropriate sidebar based on role
    if (hasRole('ceo')) {
        return <CEOSidebar isCollapsed={isCollapsed} />;
    } else if (hasRole('hr_manager')) {
        return <HRManagerSidebar isCollapsed={isCollapsed} />;
    } else if (hasRole('consultant')) {
        return <ConsultantSidebar isCollapsed={isCollapsed} />;
    }
    
    // Default to HR Manager sidebar if no role found
    return <HRManagerSidebar isCollapsed={isCollapsed} />;
}