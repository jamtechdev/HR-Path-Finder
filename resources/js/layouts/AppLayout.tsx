import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import TranslationLoader from '@/components/TranslationLoader';

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
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
