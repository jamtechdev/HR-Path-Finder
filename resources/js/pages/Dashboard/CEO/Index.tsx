import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FolderKanban, 
    CheckCircle2, 
    Clock, 
    FileText,
    AlertCircle,
    ArrowRight,
    Eye,
    TrendingUp
} from 'lucide-react';
import StepVerificationCard from '@/components/Dashboard/CEO/StepVerificationCard';

interface Project {
    id: number;
    company?: {
        id: number;
        name: string;
    } | null;
    step_statuses?: Record<string, string>;
    diagnosis?: any;
    ceoPhilosophy?: any;
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
    pendingReviews: Project[];
    stats: {
        total_projects: number;
        pending_diagnosis_review: number;
        pending_ceo_survey: number;
        completed_projects: number;
    };
    needsAttention: Project[];
}

export default function CeoDashboard({ projects, pendingReviews, stats, needsAttention }: Props) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'not_started': { label: 'Not Started', variant: 'outline' },
            'in_progress': { label: 'In Progress', variant: 'secondary' },
            'submitted': { label: 'Submitted', variant: 'default' },
            'completed': { label: 'Completed', variant: 'default' },
            'locked': { label: 'Locked', variant: 'default' },
        };
        return statusMap[status] || { label: status, variant: 'outline' };
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="CEO Dashboard" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">CEO Dashboard</h1>
                            <p className="text-muted-foreground">
                                Review and manage your company's HR projects
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="border-t-6 border-t-blue-500">
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

                            <Card className="border-t-6 border-t-orange-500">
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

                            <Card className="border-t-6 border-t-yellow-500">
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

                            <Card className="border-t-6 border-t-green-500">
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

                        {/* Action Cards */}
                        {pendingReviews.length > 0 && (
                            <Card className="mb-8 border-orange-200 dark:border-orange-800">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                            <AlertCircle className="w-5 h-5" />
                                            Action Required: Diagnosis Review
                                        </CardTitle>
                                        <Badge variant="secondary">{pendingReviews.length}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        You have {pendingReviews.length} project{pendingReviews.length > 1 ? 's' : ''} waiting for your review
                                    </p>
                                    <div className="space-y-2 mb-4">
                                        {pendingReviews.slice(0, 3).map((project) => (
                                            <Link
                                                key={project.id}
                                                href={`/ceo/review/diagnosis/${project.id}`}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <span className="font-medium">
                                                    {project.company?.name || `Project #${project.id}`}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                            </Link>
                                        ))}
                                    </div>
                                    {pendingReviews.length > 3 && (
                                        <Link href="/ceo/dashboard">
                                            <Button variant="outline" className="w-full">
                                                View All Pending Reviews ({pendingReviews.length})
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Projects Needing Attention */}
                        {needsAttention.length > 0 && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Projects Needing Attention</CardTitle>
                                        <Link href="/hr-projects">
                                            <Button variant="ghost" size="sm">
                                                View All
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {needsAttention.map((project) => {
                                            const diagnosisStatus = project.step_statuses?.diagnosis || 'not_started';
                                            const statusBadge = getStatusBadge(diagnosisStatus);
                                            const needsSurvey = diagnosisStatus === 'submitted' && !project.ceoPhilosophy;
                                            const hrProgress = project.hr_progress;
                                            const ceoProgress = project.ceo_progress;
                                            
                                            return (
                                                <Link
                                                    key={project.id}
                                                    href={needsSurvey 
                                                        ? `/ceo/philosophy/survey/${project.id}`
                                                        : `/ceo/review/diagnosis/${project.id}`
                                                    }
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-medium">
                                                                {project.company?.name || `Project #${project.id}`}
                                                            </p>
                                                            <Badge variant={statusBadge.variant}>
                                                                {statusBadge.label}
                                                            </Badge>
                                                            {needsSurvey && (
                                                                <Badge variant="outline" className="text-orange-600">
                                                                    Survey Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            {hrProgress && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    HR: {hrProgress.completed}/{hrProgress.total} steps
                                                                    {hrProgress.in_progress > 0 && ` (${hrProgress.in_progress} in progress)`}
                                                                </p>
                                                            )}
                                                            {ceoProgress && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    CEO: {ceoProgress.diagnosis_review === 'completed' ? '✓ Review' : '○ Review'} | 
                                                                    {ceoProgress.survey === 'completed' ? ' ✓ Survey' : ' ○ Survey'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {needsSurvey 
                                                                ? 'Complete CEO Philosophy Survey'
                                                                : 'Review Diagnosis'
                                                            }
                                                        </p>
                                                    </div>
                                                    <Eye className="w-5 h-5 text-muted-foreground" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step Verification for Active Project */}
                        {projects.length > 0 && projects[0] && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Step Verification - {projects[0].company?.name || `Project #${projects[0].id}`}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <StepVerificationCard
                                        projectId={projects[0].id}
                                        stepStatuses={projects[0].step_statuses || {}}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* All Projects */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>All Projects</CardTitle>
                                    <Link href="/hr-projects">
                                        <Button variant="ghost" size="sm">
                                            View All
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {projects.length > 0 ? (
                                    <div className="space-y-3">
                                        {projects.map((project) => {
                                            const diagnosisStatus = project.step_statuses?.diagnosis || 'not_started';
                                            const statusBadge = getStatusBadge(diagnosisStatus);
                                            const needsSurvey = diagnosisStatus === 'submitted' && !project.ceoPhilosophy;
                                            const hrProgress = project.hr_progress;
                                            const ceoProgress = project.ceo_progress;
                                            
                                            return (
                                                <Link
                                                    key={project.id}
                                                    href={needsSurvey 
                                                        ? `/ceo/philosophy/survey/${project.id}`
                                                        : `/ceo/review/diagnosis/${project.id}`
                                                    }
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-medium">
                                                                {project.company?.name || `Project #${project.id}`}
                                                            </p>
                                                            <Badge variant={statusBadge.variant}>
                                                                {statusBadge.label}
                                                            </Badge>
                                                            {needsSurvey && (
                                                                <Badge variant="outline" className="text-orange-600">
                                                                    Survey Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            {hrProgress && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    HR: {hrProgress.completed}/{hrProgress.total} steps
                                                                    {hrProgress.in_progress > 0 && ` (${hrProgress.in_progress} in progress)`}
                                                                    {hrProgress.submitted && hrProgress.submitted > 0 && ` (${hrProgress.submitted} pending verification)`}
                                                                </p>
                                                            )}
                                                            {ceoProgress && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    CEO: Verified {ceoProgress.verified_steps || 0}/{hrProgress?.total || 7} steps
                                                                    {ceoProgress.pending_verification && ceoProgress.pending_verification > 0 && ` (${ceoProgress.pending_verification} pending)`}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {needsSurvey 
                                                                ? 'Complete CEO Philosophy Survey'
                                                                : `Created ${new Date(project.created_at).toLocaleDateString()}`
                                                            }
                                                        </p>
                                                    </div>
                                                    <Eye className="w-5 h-5 text-muted-foreground" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No projects assigned to you yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
