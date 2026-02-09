import React from 'react';
import { Head } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import WorkflowStepsSidebar from '@/components/Sidebar/WorkflowStepsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

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

export default function PerformanceSystemOverview({ project, performanceSystem, stepStatuses, activeTab, projectId }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
                <WorkflowStepsSidebar stepStatuses={stepStatuses} projectId={projectId} />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Performance System - ${project?.company?.name || 'Performance System'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Performance System</h1>
                            <p className="text-muted-foreground">
                                Design evaluation units, performance management methods, and assessment structures.
                            </p>
                        </div>

                        <Tabs value={activeTab} className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="evaluation-units">Evaluation Units</TabsTrigger>
                                <TabsTrigger value="performance-methods">Performance Methods</TabsTrigger>
                                <TabsTrigger value="assessment-structure">Assessment Structure</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance System Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            This section allows you to design your performance management system including evaluation units, methods, and assessment structures.
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
