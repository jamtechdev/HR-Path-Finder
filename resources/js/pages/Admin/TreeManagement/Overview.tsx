import React from 'react';
import { Head } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp } from 'lucide-react';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_group?: string;
    reporting_structure?: {
        executive_director?: string;
        reporting_hierarchy?: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    jobDefinitions: JobDefinition[];
}

export default function TreeManagementOverview({
    project,
    stepStatuses,
    projectId,
    jobDefinitions,
}: Props) {
    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Tree Management - Admin" />
            <div className="flex h-screen w-full">
                <RoleBasedSidebar />
                <SidebarInset className="flex-1 overflow-auto bg-background">
                    <AppHeader />
                    <div className="px-6 bg-background">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold">Tree Management</h1>
                            <p className="text-sm text-muted-foreground">
                                Admin-only: Manage organization trees for {project.company.name}
                            </p>
                        </div>

                        {/* Info Card */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Admin Access:</strong> This is an admin-only feature for managing 
                                    organization trees. HR Managers and CEOs do not have access to this functionality.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Job Definitions Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Job Definitions
                                </CardTitle>
                                <CardDescription>
                                    Finalized job roles and their organizational structure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {jobDefinitions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No job definitions found. Please complete Job Analysis step first.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {jobDefinitions.map((job) => (
                                            <div key={job.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{job.job_name}</h3>
                                                        {job.job_group && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                {job.job_group}
                                                            </Badge>
                                                        )}
                                                        {job.job_description && (
                                                            <p className="text-sm text-muted-foreground mt-2">
                                                                {job.job_description}
                                                            </p>
                                                        )}
                                                        {job.reporting_structure && (
                                                            <div className="mt-3 space-y-1">
                                                                {job.reporting_structure.executive_director && (
                                                                    <p className="text-sm">
                                                                        <strong>Executive Director:</strong>{' '}
                                                                        {job.reporting_structure.executive_director}
                                                                    </p>
                                                                )}
                                                                {job.reporting_structure.reporting_hierarchy && (
                                                                    <p className="text-sm">
                                                                        <strong>Hierarchy:</strong>{' '}
                                                                        {job.reporting_structure.reporting_hierarchy}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(stepStatuses).map(([step, status]) => (
                                        <div key={step} className="flex items-center justify-between">
                                            <span className="text-sm capitalize">{step.replace('_', ' ')}</span>
                                            <Badge variant={status === 'locked' ? 'default' : 'secondary'}>
                                                {status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
