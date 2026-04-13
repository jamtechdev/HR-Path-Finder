import React from 'react';
import { FlashToasts } from '@/components/FlashToasts';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import TranslationLoader from '@/components/TranslationLoader';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

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
            <Toaster />
            <FlashToasts />
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex min-w-0 flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="min-w-0 flex-1 overflow-auto bg-background">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
