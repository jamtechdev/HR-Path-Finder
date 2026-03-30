import { Head, Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

interface Project {
    id: number;
    company?: {
        id: number;
        name: string;
    } | null;
    step_statuses?: Record<string, string>;
    created_at: string;
    survey_status?: 'not_available' | 'pending' | 'completed';
    ceo_philosophy?: { id: number; completed_at?: string } | null;
    hr_progress?: {
        completed: number;
        in_progress: number;
        submitted?: number;
        total: number;
    };
    ceo_progress?: {
        diagnosis_review: 'not_started' | 'available' | 'completed';
        survey: 'not_started' | 'pending' | 'completed';
        verified_steps?: number;
        pending_verification?: number;
    };
}

interface Props {
    projects: Project[];
    stats: {
        total_projects: number;
        pending_diagnosis_review: number;
        pending_ceo_survey: number;
        completed_projects: number;
    };
}

export default function CeoProjectsIndex({ projects }: Props) {
    // Cards + counts live on the CEO dashboard. This page is table-only.

    const getOverallStatus = (project: Project) => {
        const stepStatuses = project.step_statuses || {};
        const allSteps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
        const allApproved = allSteps.every((step) => {
            const status = stepStatuses[step];
            return status && ['approved', 'locked', 'completed'].includes(status);
        });
        if (allApproved) return 'Completed';
        const hasSubmitted = allSteps.some((step) => stepStatuses[step] === 'submitted');
        if (hasSubmitted) return 'Pending Review';
        return 'In Progress';
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background dark:bg-slate-900">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Projects - CEO Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <h1 className="text-3xl font-bold mb-1 text-foreground">Projects</h1>
                            <p className="text-muted-foreground text-sm">
                                Verify steps and complete the CEO survey
                            </p>
                        </div>

                        {/* Simple CEO table */}
                        {projects.length > 0 ? (
                            <div className="rounded-lg border overflow-hidden bg-background">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold">Projects</h2>
                                </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr className="text-left">
                                                    <th className="px-4 py-3 font-semibold">Company</th>
                                                    <th className="px-4 py-3 font-semibold">Status</th>
                                                    <th className="px-4 py-3 font-semibold">Survey</th>
                                                    <th className="px-4 py-3 font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projects.map((project) => {
                                                    const surveyDone = !!project.ceo_philosophy?.completed_at;
                                                    const surveyStatus = surveyDone
                                                        ? 'completed'
                                                        : (project.survey_status || 'not_available');
                                                    return (
                                                        <tr key={project.id} className="border-t hover:bg-muted/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">{project.company?.name || `Project #${project.id}`}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="outline">{getOverallStatus(project)}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {surveyStatus === 'completed' ? (
                                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                        Completed
                                                                    </Badge>
                                                                ) : surveyStatus === 'pending' ? (
                                                                    <Badge variant="outline">Pending</Badge>
                                                                ) : (
                                                                    <Badge variant="outline">N/A</Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {/* Button 1: Verify steps */}
                                                                    <Link href={`/ceo/projects/${project.id}/verification`}>
                                                                        <Button size="sm" variant="outline">
                                                                            Verify
                                                                        </Button>
                                                                    </Link>

                                                                    {/* Button 2: Start survey if not done, otherwise view diagnosis */}
                                                                    {surveyDone ? (
                                                                        <Link href={`/ceo/review/diagnosis/${project.id}`}>
                                                                            <Button size="sm" variant="outline">
                                                                                View Diagnosis
                                                                            </Button>
                                                                        </Link>
                                                                    ) : (
                                                                        <Link href={`/ceo/philosophy/survey/${project.id}`}>
                                                                            <Button size="sm" variant="outline">
                                                                                Start Survey
                                                                            </Button>
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border bg-background">
                                    <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <div className="p-12 text-center">
                                        <p className="text-lg font-medium mb-2">No Projects Available</p>
                                        <p className="text-muted-foreground">
                                            Projects will appear here once they are assigned to you.
                                        </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
