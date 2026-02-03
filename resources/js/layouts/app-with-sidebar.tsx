import { ReactNode } from 'react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

interface AppWithSidebarLayoutProps {
    children: ReactNode;
}

export default function AppWithSidebarLayout({ children }: AppWithSidebarLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
