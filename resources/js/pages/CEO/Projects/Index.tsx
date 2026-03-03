import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    FolderKanban, 
    CheckCircle2, 
    Clock, 
    FileText,
    ArrowRight,
    TrendingUp,
    Building2
} from 'lucide-react';

interface Project {
    id: number;
    company?: {
        id: number;
        name: string;
    } | null;
    step_statuses?: Record<string, string>;
    created_at: string;
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
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'not_started': { label: 'Not Started', variant: 'outline' },
            'in_progress': { label: 'In Progress', variant: 'secondary' },
            'submitted': { label: 'Submitted', variant: 'default' },
            'approved': { label: 'Approved', variant: 'default' },
            'completed': { label: 'Completed', variant: 'default' },
            'locked': { label: 'Locked', variant: 'default' },
        };
        return statusMap[status] || { label: status, variant: 'outline' };
    };

    const getOverallStatus = (project: Project) => {
        const stepStatuses = project.step_statuses || {};
        const allSteps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
        const allApproved = allSteps.every(step => {
            const status = stepStatuses[step];
            return status && ['approved', 'locked', 'completed'].includes(status);
        });
        if (allApproved) return { label: 'Completed', variant: 'default' as const };
        
        const hasSubmitted = allSteps.some(step => {
            const status = stepStatuses[step];
            return status === 'submitted';
        });
        if (hasSubmitted) return { label: 'Pending Review', variant: 'secondary' as const };
        
        return { label: 'In Progress', variant: 'outline' as const };
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background">
                    <Head title="Projects - CEO Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-foreground">Projects</h1>
                            <p className="text-muted-foreground">
                                Select a project to review and verify steps
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="border-t-6 border-t-blue-500 hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                                            <p className="text-3xl font-bold">{stats.total_projects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                            <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-orange-500 hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                                            <p className="text-3xl font-bold">{stats.pending_diagnosis_review}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-yellow-500 hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Pending Survey</p>
                                            <p className="text-3xl font-bold">{stats.pending_ceo_survey}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-t-6 border-t-green-500 hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Completed</p>
                                            <p className="text-3xl font-bold">{stats.completed_projects}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Projects Grid */}
                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => {
                                    const overallStatus = getOverallStatus(project);
                                    const hrProgress = project.hr_progress;
                                    const ceoProgress = project.ceo_progress;
                                    const progressPercentage = hrProgress 
                                        ? Math.round((hrProgress.completed / hrProgress.total) * 100)
                                        : 0;

                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/ceo/projects/${project.id}/verification`}
                                            className="group"
                                        >
                                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                                                                {project.company?.name || `Project #${project.id}`}
                                                            </CardTitle>
                                                            <p className="text-xs text-muted-foreground">
                                                                Created {new Date(project.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant={overallStatus.variant}>
                                                            {overallStatus.label}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Progress Bar */}
                                                    {hrProgress && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">HR Progress</span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {hrProgress.completed}/{hrProgress.total} steps
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-muted rounded-full h-2.5">
                                                                <div
                                                                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                                                    style={{ width: `${progressPercentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* CEO Progress */}
                                                    {ceoProgress && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">CEO Verification:</span>
                                                            <span className="font-medium">
                                                                {ceoProgress.verified_steps || 0}/{hrProgress?.total || 5} verified
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Pending Verification */}
                                                    {ceoProgress?.pending_verification && ceoProgress.pending_verification > 0 && (
                                                        <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                            <span className="text-sm text-orange-600 dark:text-orange-400">
                                                                {ceoProgress.pending_verification} step{ceoProgress.pending_verification > 1 ? 's' : ''} pending verification
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            View Details
                                                        </span>
                                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
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
