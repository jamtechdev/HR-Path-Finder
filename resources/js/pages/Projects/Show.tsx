import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Lock } from 'lucide-react';

interface Project {
    id: number;
    status: string;
    step_statuses?: Record<string, string>;
    company: {
        id: number;
        name: string;
    };
    diagnosis?: {
        id: number;
        status: string;
    };
    organizationDesign?: {
        id: number;
        status: string;
    };
    performanceSystem?: {
        id: number;
        status: string;
    };
    compensationSystem?: {
        id: number;
        status: string;
    };
}

interface Props {
    project: Project;
}

export default function ShowProject({ project }: Props) {
    const steps = [
        { key: 'diagnosis', label: 'Diagnosis', status: project.diagnosis?.status || project.step_statuses?.diagnosis },
        { key: 'organization', label: 'Organization Design', status: project.organizationDesign?.status || project.step_statuses?.organization },
        { key: 'performance', label: 'Performance System', status: project.performanceSystem?.status || project.step_statuses?.performance },
        { key: 'compensation', label: 'Compensation System', status: project.compensationSystem?.status || project.step_statuses?.compensation },
    ];

    const getStatusIcon = (status?: string) => {
        if (!status) return <Clock className="h-4 w-4 text-muted-foreground" />;
        if (status === 'locked' || status === 'approved') return <Lock className="h-4 w-4 text-green-600" />;
        if (status === 'submitted') return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
        return <Clock className="h-4 w-4 text-yellow-600" />;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`${project.company.name} - HR Project`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold">{project.company.name}</h1>
                            <p className="text-muted-foreground">HR Project #{project.id}</p>
                        </div>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Project Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="capitalize font-medium">{project.status}</p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workflow Steps</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {steps.map((step) => (
                                            <div key={step.key} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(step.status)}
                                                    <span className="font-medium">{step.label}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground capitalize">
                                                    {step.status || 'not_started'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {project.diagnosis && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex gap-4">
                                        <Link href={`/hr-manager/diagnosis/${project.id}/overview`}>
                                            <Button>Continue Diagnosis</Button>
                                        </Link>
                                        <Link href={`/hr-system/${project.id}`}>
                                            <Button variant="outline">View Overview</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
