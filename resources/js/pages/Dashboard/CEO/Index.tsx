import { Head, Link } from '@inertiajs/react';
import {
    FolderKanban,
    CheckCircle2,
    Clock,
    FileText,
    AlertCircle,
    ArrowRight,
    Eye,
    Target,
    ClipboardList
} from 'lucide-react';
import React from 'react';
import StepVerificationCard from '@/components/Dashboard/CEO/StepVerificationCard';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

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

interface SurveyAvailableProject {
    id: number;
    company?: { id: number; name: string } | null;
}

interface Props {
    projects: Project[];
    pendingReviews: Project[];
    pendingKpiReviews?: Project[];
    kpiReviewProjects?: Project[];
    surveyAvailableProjects?: SurveyAvailableProject[];
    stats: {
        total_projects: number;
        pending_diagnosis_review: number;
        pending_ceo_survey: number;
        survey_available_count?: number;
        pending_kpi_review?: number;
        completed_projects: number;
    };
    needsAttention: Project[];
}

export default function CeoDashboard({
    projects,
    pendingReviews,
    pendingKpiReviews = [],
    kpiReviewProjects = [],
    surveyAvailableProjects = [],
    stats,
    needsAttention,
}: Props) {
    const { t } = useTranslation();
    const surveyCompletedCount = projects.filter((project) => !!project.ceoPhilosophy).length;
    const verificationTargetProjectId = pendingReviews[0]?.id ?? projects[0]?.id;
    const cardBaseClass = 'border-t-6 hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[118px]';
    const cardContentClass = 'p-6 h-full flex items-center';
    const statValueClass = 'text-3xl font-bold whitespace-nowrap tabular-nums leading-none text-slate-900';
    const iconWrapClass = 'w-12 h-12 rounded-xl flex items-center justify-center shrink-0';

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
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('ceo_dashboard.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-foreground">{t('ceo_dashboard.heading')}</h1>
                            <p className="text-muted-foreground">
                                {t('ceo_dashboard.subheading')}
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        {/* 6 cards -> 3 per row (2 rows on desktop) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <Link href="/ceo/projects">
                                <Card className={`${cardBaseClass} border-t-blue-500`}>
                                    <CardContent className={cardContentClass}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.total_projects')}</p>
                                                <p className={statValueClass}>{stats.total_projects}</p>
                                            </div>
                                            <div className={`${iconWrapClass} bg-blue-100`}>
                                                <FolderKanban className="w-5 h-5 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/ceo/projects">
                                <Card className={`${cardBaseClass} border-t-orange-500`}>
                                    <CardContent className={cardContentClass}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.pending_review')}</p>
                                                <p className={statValueClass}>{stats.pending_diagnosis_review}</p>
                                            </div>
                                            <div className={`${iconWrapClass} bg-orange-100`}>
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={surveyAvailableProjects.length > 0 ? `/ceo/philosophy/survey/${surveyAvailableProjects[0].id}` : '/ceo/projects'}>
                                <Card className={`${cardBaseClass} border-t-yellow-500`}>
                                    <CardContent className={cardContentClass}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.pending_survey')}</p>
                                                <p className={statValueClass}>{stats.pending_ceo_survey}</p>
                                            </div>
                                            <div className={`${iconWrapClass} bg-yellow-100`}>
                                                <FileText className="w-5 h-5 text-yellow-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={verificationTargetProjectId ? `/ceo/projects/${verificationTargetProjectId}/verification` : '/ceo/projects'}>
                                <Card className={`${cardBaseClass} border-t-green-500`}>
                                    <CardContent className={cardContentClass}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.completed')}</p>
                                                <p className={statValueClass}>{stats.completed_projects}</p>
                                            </div>
                                            <div className={`${iconWrapClass} bg-green-100`}>
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/ceo/projects">
                                <Card className={`${cardBaseClass} border-t-emerald-500`}>
                                    <CardContent className={cardContentClass}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.survey_completed')}</p>
                                                <p className={statValueClass}>{surveyCompletedCount}</p>
                                            </div>
                                            <div className={`${iconWrapClass} bg-emerald-100`}>
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/ceo/kpi-review">
                                <Card className={`${cardBaseClass} border-t-cyan-500`}>
                                    <CardContent className={cardContentClass}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.pending_kpi_review')}</p>
                                                <p className={statValueClass}>{stats.pending_kpi_review ?? 0}</p>
                                            </div>
                                            <div className={`${iconWrapClass} bg-cyan-100`}>
                                                <Target className="w-5 h-5 text-cyan-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>

                        {/* Simple all-project table */}
                        <Card className="mb-8 overflow-hidden">
                            <CardHeader>
                                <CardTitle>{t('ceo_dashboard.all_companies_title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold">{t('ceo_dashboard.table.company')}</th>
                                                <th className="px-4 py-3 font-semibold">{t('ceo_dashboard.table.diagnosis')}</th>
                                                <th className="px-4 py-3 font-semibold">{t('ceo_dashboard.table.survey')}</th>
                                                <th className="px-4 py-3 font-semibold">{t('ceo_dashboard.table.kpi')}</th>
                                                <th className="px-4 py-3 font-semibold">{t('ceo_dashboard.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.map((project) => {
                                                const surveyDone = !!project.ceoPhilosophy;
                                                return (
                                                    <tr key={project.id} className="border-t">
                                                        <td className="px-4 py-3 font-medium">
                                                            {project.company?.name || `Project #${project.id}`}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {project.step_statuses?.diagnosis || 'not_started'}
                                                        </td>
                                                        <td className="px-4 py-3">{surveyDone ? t('ceo_dashboard.completed') : t('ceo_dashboard.pending')}</td>
                                                        <td className="px-4 py-3">
                                                            {(project as any).kpi_total ?? 0} total
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                <Link href={`/ceo/projects/${project.id}/verification`}>
                                                                    <Button size="sm" variant="outline">{t('ceo_dashboard.actions.verify')}</Button>
                                                                </Link>
                                                                {surveyDone ? (
                                                                    <Link href={`/ceo/review/diagnosis/${project.id}`}>
                                                                        <Button size="sm" variant="outline">{t('ceo_dashboard.actions.view_diagnosis')}</Button>
                                                                    </Link>
                                                                ) : (
                                                                    <Link href={`/ceo/philosophy/survey/${project.id}`}>
                                                                        <Button size="sm" variant="outline">{t('ceo_dashboard.actions.start_survey')}</Button>
                                                                    </Link>
                                                                )}
                                                                {((project as any).kpi_total ?? 0) > 0 && (
                                                                    <Link href={`/ceo/kpi-review/${project.id}`}>
                                                                        <Button size="sm">{t('ceo_dashboard.actions.kpi_review')}</Button>
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

                        {/* Action Cards */}
                        {pendingReviews.length > 0 && (
                            <Card className="mb-8 border-orange-200 dark:border-orange-800">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                            <AlertCircle className="w-5 h-5" />
                                            {t('ceo_dashboard.action_required')}
                                        </CardTitle>
                                        <Badge variant="secondary">{pendingReviews.length}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                            {t('ceo_dashboard.pending_reviews_count', { count: pendingReviews.length })}
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
                                                    {t('ceo_dashboard.view_all_pending', { count: pendingReviews.length })}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* KPI Review Section - always visible once KPI exists */}
                        <Card className="mb-8 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Target className="w-5 h-5" />
                                        {t('ceo_dashboard.kpi_review_title')}
                                    </CardTitle>
                                    <Badge variant="secondary">{kpiReviewProjects.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {kpiReviewProjects.length > 0 ? (
                                    <>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {pendingKpiReviews.length > 0
                                                ? `${pendingKpiReviews.length} project${pendingKpiReviews.length > 1 ? 's' : ''} waiting for your review`
                                                : 'All KPI reviews are completed. You can still open any project to view details.'}
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            {kpiReviewProjects.slice(0, 3).map((project) => (
                                                <Link
                                                    key={project.id}
                                                    href={`/ceo/kpi-review/${project.id}`}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <span className="font-medium">
                                                        {project.company?.name || `Project #${project.id}`}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                                </Link>
                                            ))}
                                        </div>
                                        {kpiReviewProjects.length > 3 && (
                                            <Link href="/ceo/dashboard">
                                                <Button variant="outline" className="w-full">
                                                    {t('ceo_dashboard.view_all_kpi', { count: kpiReviewProjects.length })}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('ceo_dashboard.kpi_review_empty')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Projects Needing Attention */}
                        {needsAttention.length > 0 && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{t('ceo_dashboard.needs_attention.title')}</CardTitle>
                                        <Link href="/hr-projects">
                                            <Button variant="ghost" size="sm">
                                                {t('ceo_dashboard.view_all')}
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
                                                                    {t('ceo_dashboard.survey_required')}
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
                                                                : t('ceo_dashboard.review_diagnosis')
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

                        {/* Quick Actions */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>{t('ceo_dashboard.quick_actions.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link href="/ceo/projects">
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <FolderKanban className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold mb-1">{t('ceo_dashboard.quick_actions.view_all_projects')}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t('ceo_dashboard.quick_actions.view_all_projects_desc')}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                    {surveyAvailableProjects.length > 0 && (
                                        <Link href={`/ceo/philosophy/survey/${surveyAvailableProjects[0].id}`}>
                                            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                                            <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold mb-1">{t('ceo_dashboard.quick_actions.start_survey')}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Complete Management Philosophy Survey
                                                                {surveyAvailableProjects.length > 1
                                                                    ? ` (${surveyAvailableProjects.length} projects)`
                                                                    : surveyAvailableProjects[0].company?.name
                                                                        ? ` — ${surveyAvailableProjects[0].company.name}`
                                                                        : ''}
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary" className="text-lg px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                            {surveyAvailableProjects.length}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )}
                                    {pendingReviews.length > 0 && (
                                        <Link href="/ceo/projects">
                                            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 hover:border-orange-300">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold mb-1">{t('ceo_dashboard.quick_actions.pending_reviews')}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {pendingReviews.length} project{pendingReviews.length > 1 ? 's' : ''} waiting for review
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary" className="text-lg px-3 py-1">
                                                            {pendingReviews.length}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
