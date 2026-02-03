import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Sidebar } from '@/components/ui/sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <AppContent variant="sidebar" className="overflow-x-hidden md:pt-0 pt-14">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
