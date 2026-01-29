import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <RoleBasedSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden md:pt-0 pt-14">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
