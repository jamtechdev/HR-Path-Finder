import { Head } from '@inertiajs/react';
import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function ConsultantDashboard() {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Consultant Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="text-center py-12">
                            <h1 className="text-3xl font-bold mb-4">Welcome to Consultant Dashboard</h1>
                            <p className="text-muted-foreground">Dashboard content will be available here.</p>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
