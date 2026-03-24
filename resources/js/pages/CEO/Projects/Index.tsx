import { Head, Link } from '@inertiajs/react';
import { FolderKanban, CheckCircle2, Clock, FileText, Building2 } from 'lucide-react';
import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function CeoProjectsIndex({ projects, stats }: Props) {
    const surveyCompletedCount = projects.filter((project) => project.survey_status === 'completed').length;

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
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
                    <Head title="Projects - CEO Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-foreground">Projects</h1>
                            <p className="text-muted-foreground">
                                Select a project to review and verify steps
                            </p>
                        </div>

                        {/* Dashboard cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <Card className="border-t-6 border-t-blue-500 hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                                                Total Projects
                                            </p>
                                            <p className="text-3xl font-bold dark:text-slate-100">{stats.total_projects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                            <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-orange-500 hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                                                Pending Review
                                            </p>
                                            <p className="text-3xl font-bold dark:text-slate-100">
                                                {stats.pending_diagnosis_review}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-yellow-500 hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                                                Pending Survey
                                            </p>
                                            <p className="text-3xl font-bold dark:text-slate-100">
                                                {stats.pending_ceo_survey}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-green-500 hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                                                Completed
                                            </p>
                                            <p className="text-3xl font-bold dark:text-slate-100">
                                                {stats.completed_projects}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-emerald-500 hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                                                Survey Completed
                                            </p>
                                            <p className="text-3xl font-bold dark:text-slate-100">
                                                {surveyCompletedCount}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Simple CEO table */}
                        {projects.length > 0 ? (
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr className="text-left">
                                                    <th className="px-4 py-3 font-semibold">Company</th>
                                                    <th className="px-4 py-3 font-semibold">Status</th>
                                                    <th className="px-4 py-3 font-semibold">HR Progress</th>
                                                    <th className="px-4 py-3 font-semibold">Survey</th>
                                                    <th className="px-4 py-3 font-semibold">KPI Review</th>
                                                    <th className="px-4 py-3 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projects.map((project) => {
                                                    const surveyStatus = project.survey_status || 'not_available';
                                                    return (
                                                        <tr key={project.id} className="border-t">
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">{project.company?.name || `Project #${project.id}`}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    Created {new Date(project.created_at).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="outline">{getOverallStatus(project)}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {project.hr_progress?.completed ?? 0}/{project.hr_progress?.total ?? 5}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {surveyStatus === 'completed' ? 'Completed' : surveyStatus === 'pending' ? 'Pending' : 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {project.kpi_total ?? 0} KPIs
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Link href={`/ceo/projects/${project.id}/verification`}>
                                                                        <Button size="sm" variant="outline">Company</Button>
                                                                    </Link>
                                                                    <Link href={`/ceo/review/diagnosis/${project.id}`}>
                                                                        <Button size="sm" variant="outline">Diagnosis Review</Button>
                                                                    </Link>
                                                                    {surveyStatus !== 'not_available' && (
                                                                        surveyStatus === 'completed' ? (
                                                                            <Badge variant="secondary" className="self-center">Survey Completed</Badge>
                                                                        ) : (
                                                                            <Link href={`/ceo/philosophy/survey/${project.id}`}>
                                                                                <Button size="sm" variant="outline">Survey</Button>
                                                                            </Link>
                                                                        )
                                                                    )}
                                                                    {surveyStatus === 'completed' && (
                                                                        <>
                                                                            <Link href={`/ceo/tree/${project.id}`}>
                                                                                <Button size="sm" variant="outline">View Tree</Button>
                                                                            </Link>
                                                                            <Link href={`/ceo/report/${project.id}`}>
                                                                                <Button size="sm" variant="outline">View Report</Button>
                                                                            </Link>
                                                                        </>
                                                                    )}
                                                                    {(project.kpi_total ?? 0) > 0 && (
                                                                        <Link href={`/ceo/kpi-review/${project.id}`}>
                                                                            <Button size="sm">KPI Review</Button>
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
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-lg font-medium mb-2">No Projects Available</p>
                                    <p className="text-muted-foreground">
                                        Projects will appear here once they are assigned to you.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
