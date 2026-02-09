import React from 'react';
import { Head } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import WorkflowStepsSidebar from '@/components/Sidebar/WorkflowStepsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    compensationSystem?: any;
    stepStatuses: Record<string, string>;
    activeTab: string;
    projectId: number;
}

export default function CompensationSystemOverview({ project, compensationSystem, stepStatuses, activeTab, projectId }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
                <WorkflowStepsSidebar stepStatuses={stepStatuses} projectId={projectId} />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Compensation System - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Compensation & Benefits (C&B)</h1>
                            <p className="text-muted-foreground">
                                Define compensation structure, differentiation methods, and incentive components.
                            </p>
                        </div>

                        <Tabs value={activeTab} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="compensation-structure">Compensation Structure</TabsTrigger>
                                <TabsTrigger value="differentiation">Differentiation Methods</TabsTrigger>
                                <TabsTrigger value="incentives">Incentive Components</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>C&B System Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            This section allows you to design your compensation and benefits system.
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
