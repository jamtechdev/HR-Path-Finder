import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FlashToasts } from '@/components/FlashToasts';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Sidebar } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <Toaster />
            <FlashToasts />
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
