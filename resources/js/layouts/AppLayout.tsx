import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import TranslationLoader from '@/components/TranslationLoader';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    showWorkflowSteps?: boolean;
    stepStatuses?: Record<string, string>;
    projectId?: number;
    ceoPhilosophyStatus?: string;
}

export default function AppLayout({
    children,
    showWorkflowSteps = false,
    stepStatuses = {},
    projectId,
    ceoPhilosophyStatus
}: AppLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <TranslationLoader />
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
