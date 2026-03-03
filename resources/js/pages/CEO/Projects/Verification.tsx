import React from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StepVerificationCard from '@/components/Dashboard/CEO/StepVerificationCard';
import { ArrowLeft, CheckCircle2, Clock, Lock, Eye } from 'lucide-react';

interface Props {
    project: {
        id: number;
        company?: {
            id: number;
            name: string;
        } | null;
        step_statuses?: Record<string, string>;
    };
}

export default function CeoProjectVerification({ project }: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background">
                    <Head title={`Step Verification - ${project.company?.name || 'Project'}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/ceo/projects')}
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Button>
                            <h1 className="text-3xl font-bold mb-2 text-foreground">
                                Step Verification - {project.company?.name || `Project #${project.id}`}
                            </h1>
                            <p className="text-muted-foreground">
                                Review and verify each step of the HR project
                            </p>
                        </div>

                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">Step Verification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StepVerificationCard
                                    projectId={project.id}
                                    stepStatuses={project.step_statuses || {}}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
