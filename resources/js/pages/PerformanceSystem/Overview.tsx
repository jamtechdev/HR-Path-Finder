import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import WorkflowStepsSidebar from '@/components/Sidebar/WorkflowStepsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
    project: {
        id: number;
        company?: {
            name: string;
        } | null;
    };
    performanceSystem?: any;
    stepStatuses: Record<string, string>;
    activeTab: string;
    projectId: number;
}

export default function PerformanceSystemOverview({
    project,
    performanceSystem,
    stepStatuses,
    activeTab,
    projectId,
}: Props) {
    const { t } = useTranslation();

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
                <WorkflowStepsSidebar
                    stepStatuses={stepStatuses}
                    projectId={projectId}
                />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />

                <main className="flex-1 overflow-auto">
                    <Head
                        title={t('performance_system.page_title', {
                            company:
                                project?.company?.name ||
                                t('performance_system.fallback_title'),
                        })}
                    />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="mb-2 text-3xl font-bold">
                                {t('performance_system.heading')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('performance_system.description')}
                            </p>
                        </div>

                        <Tabs value={activeTab} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">
                                    {t('performance_system.tabs.overview')}
                                </TabsTrigger>
                                <TabsTrigger value="evaluation-units">
                                    {t(
                                        'performance_system.tabs.evaluation_units',
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="performance-methods">
                                    {t(
                                        'performance_system.tabs.performance_methods',
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="assessment-structure">
                                    {t(
                                        'performance_system.tabs.assessment_structure',
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {t(
                                                'performance_system.overview_title',
                                            )}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            {t(
                                                'performance_system.overview_description',
                                            )}
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
