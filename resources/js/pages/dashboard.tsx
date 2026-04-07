import { Head } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function Dashboard() {
    const { t } = useTranslation();
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={t('generic_fallback_dashboard.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="text-center py-12">
                            <h1 className="text-3xl font-bold mb-4">{t('generic_fallback_dashboard.heading')}</h1>
                            <p className="text-muted-foreground">{t('generic_fallback_dashboard.subheading')}</p>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
