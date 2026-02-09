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
    stepStatuses: Record<string, string>;
    activeTab: string;
    projectId: number;
}

export default function TreeOverview({ project, stepStatuses, activeTab, projectId }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
                <WorkflowStepsSidebar stepStatuses={stepStatuses} projectId={projectId} />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`TREE - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">TREE</h1>
                            <p className="text-muted-foreground">
                                Talent Review, Evaluation, and Enhancement system.
                            </p>
                        </div>

                        <Tabs value={activeTab} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="talent-review">Talent Review</TabsTrigger>
                                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                                <TabsTrigger value="enhancement">Enhancement</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>TREE System Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            This section allows you to manage talent review, evaluation, and enhancement processes.
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
