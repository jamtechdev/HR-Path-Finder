import { Head, Link } from '@inertiajs/react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    Clock,
    Eye,
    FileText,
    FolderKanban,
    Target,
} from 'lucide-react';
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
    kpi_total?: number; // Added for safety
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
    const getLocalizedStatus = (status?: string) => {
        const value = status || 'not_started';
        const pretty = value.replace(/_/g, ' ');
        return t(`ceo_dashboard.status.${value}`, { defaultValue: pretty });
    };
    const surveyCompletedCount = projects.filter((project) => !!project.ceoPhilosophy).length;
    const verificationTargetProjectId = pendingReviews[0]?.id ?? projects[0]?.id;
    const cardBaseClass = 'border-t-6 hover:shadow-lg transition-all duration-200 min-h-[118px]';
    const cardContentClass = 'p-6 h-full flex items-center';
    const statValueClass =
        'text-3xl font-bold whitespace-nowrap tabular-nums leading-none text-foreground';
    const iconWrapClass =
        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0';
    const disabledCardClass = 'cursor-not-allowed opacity-60';

    const wrapCard = (
        enabled: boolean,
        href: string,
        disabledTitle: string,
        card: JSX.Element,
    ) =>
        enabled ? (
            <Link href={href}>{card}</Link>
        ) : (
            <div title={disabledTitle} aria-disabled className={disabledCardClass}>
                {card}
            </div>
        );

    const getStatusBadge = (status: string) => {
        const statusMap: Record<
            string,
            {
                label: string;
                variant: 'default' | 'secondary' | 'destructive' | 'outline';
            }
        > = {
            not_started: {
                label: getLocalizedStatus('not_started'),
                variant: 'outline',
            },
            in_progress: {
                label: getLocalizedStatus('in_progress'),
                variant: 'secondary',
            },
            submitted: {
                label: getLocalizedStatus('submitted'),
                variant: 'default',
            },
            completed: {
                label: getLocalizedStatus('completed'),
                variant: 'default',
            },
            locked: {
                label: getLocalizedStatus('locked'),
                variant: 'default',
            },
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

                        {/* Statistics Cards - 6 cards */}
                        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Total Projects */}
                            <Link href="/ceo/projects">
                                <Card
                                    className={`${cardBaseClass} border-t-blue-500`}
                                >
                                    <CardContent className={cardContentClass}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.total_projects')}</p>
                                                <p className={statValueClass}>{stats.total_projects}</p>
                                            </div>
                                            <div
                                                className={`${iconWrapClass} bg-blue-100 dark:bg-blue-950`}
                                            >
                                                <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {/* Pending Review */}
                            {wrapCard(
                                stats.pending_diagnosis_review > 0,
                                '/ceo/projects',
                                t('ceo_dashboard.disabled.pending_review_zero', { defaultValue: 'No pending reviews right now.' }),
                                <Card
                                    className={`${cardBaseClass} border-t-orange-500`}
                                >
                                    <CardContent className={cardContentClass}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.pending_review')}</p>
                                                <p className={statValueClass}>{stats.pending_diagnosis_review}</p>
                                            </div>
                                            <div
                                                className={`${iconWrapClass} bg-orange-100 dark:bg-orange-950`}
                                            >
                                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>,
                            )}

                            {/* Pending Survey */}
                            {wrapCard(
                                stats.pending_ceo_survey > 0,
                                surveyAvailableProjects.length > 0
                                    ? `/ceo/philosophy/survey/${surveyAvailableProjects[0].id}`
                                    : '/ceo/projects',
                                t('ceo_dashboard.disabled.pending_survey_zero', { defaultValue: 'No pending surveys right now.' }),
                                <Card
                                    className={`${cardBaseClass} border-t-yellow-500`}
                                >
                                    <CardContent className={cardContentClass}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.pending_survey')}</p>
                                                <p className={statValueClass}>{stats.pending_ceo_survey}</p>
                                            </div>
                                            <div
                                                className={`${iconWrapClass} bg-yellow-100 dark:bg-yellow-950`}
                                            >
                                                <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>,
                            )}

                            {/* Completed Projects */}
                            <Link
                                href={
                                    verificationTargetProjectId
                                        ? `/ceo/projects/${verificationTargetProjectId}/verification`
                                        : '/ceo/projects'
                                }
                            >
                                <Card
                                    className={`${cardBaseClass} border-t-green-500`}
                                >
                                    <CardContent className={cardContentClass}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.completed')}</p>
                                                <p className={statValueClass}>{stats.completed_projects}</p>
                                            </div>
                                            <div
                                                className={`${iconWrapClass} bg-green-100 dark:bg-green-950`}
                                            >
                                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {/* Survey Completed */}
                            <Link href="/ceo/projects">
                                <Card
                                    className={`${cardBaseClass} border-t-emerald-500`}
                                >
                                    <CardContent className={cardContentClass}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.survey_completed')}</p>
                                                <p className={statValueClass}>{surveyCompletedCount}</p>
                                            </div>
                                            <div
                                                className={`${iconWrapClass} bg-emerald-100 dark:bg-emerald-950`}
                                            >
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {/* Pending KPI Review */}
                            {wrapCard(
                                (stats.pending_kpi_review ?? 0) > 0,
                                '/ceo/kpi-review',
                                t('ceo_dashboard.disabled.pending_kpi_zero', { defaultValue: 'No pending KPI reviews right now.' }),
                                <Card
                                    className={`${cardBaseClass} border-t-cyan-500`}
                                >
                                    <CardContent className={cardContentClass}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t('ceo_dashboard.stats.pending_kpi_review')}</p>
                                                <p className={statValueClass}>{stats.pending_kpi_review ?? 0}</p>
                                            </div>
                                            <div
                                                className={`${iconWrapClass} bg-cyan-100 dark:bg-cyan-950`}
                                            >
                                                <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>,
                            )}
                        </div>

                        {/* All Companies Simple Table */}
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
                                                const surveyDone =
                                                    !!project.ceoPhilosophy;
                                                const kpiTotal =
                                                    (project as any)
                                                        .kpi_total ??
                                                    project.kpi_total ??
                                                    0;

                                                return (
                                                    <tr
                                                        key={project.id}
                                                        className="border-t hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {project.company
                                                                ?.name ||
                                                                `Project #${project.id}`}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {project
                                                                .step_statuses
                                                                ?.diagnosis
                                                                ? getLocalizedStatus(project.step_statuses.diagnosis)
                                                                : getLocalizedStatus('not_started')}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {surveyDone
                                                                ? getLocalizedStatus('completed')
                                                                : getLocalizedStatus('not_started')}
                                                        </td>
                                                        <td className="px-4 py-3">{surveyDone ? t('ceo_dashboard.completed') : t('ceo_dashboard.pending')}</td>
                                                        <td className="px-4 py-3">
                                                            {t(
                                                                'ceo_dashboard.table.total_kpi',
                                                                {
                                                                    count: kpiTotal,
                                                                    defaultValue: `${kpiTotal} KPI`,
                                                                },
                                                            )}
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

                        {/* Action Required: Diagnosis Review */}
                        {pendingReviews.length > 0 && (
                            <Card className="mb-8 border-orange-200 dark:border-orange-800">
                                <CardHeader>
                                    <div className="flex items-center justify-between flex-wrap">
                                        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                            <AlertCircle className="w-5 h-5" />
                                            {t('ceo_dashboard.action_required')}
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            {pendingReviews.length}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                            {t('ceo_dashboard.pending_reviews_count', { count: pendingReviews.length })}
                                    </p>
                                    <div className="mb-4 space-y-2">
                                        {pendingReviews
                                            .slice(0, 3)
                                            .map((project) => (
                                                <Link
                                                    key={project.id}
                                                    href={`/ceo/review/diagnosis/${project.id}`}
                                                    className="flex items-center justify-between flex-wrap rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <span className="font-medium">
                                                        {project.company
                                                            ?.name ||
                                                            `Project #${project.id}`}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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

                        {/* KPI Review Section */}
                        <Card className="mb-8 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap">
                                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Target className="w-5 h-5" />
                                        {t('ceo_dashboard.kpi_review_title')}
                                    </CardTitle>
                                    <Badge variant="secondary">
                                        {kpiReviewProjects.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {kpiReviewProjects.length > 0 ? (
                                    <>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            {pendingKpiReviews.length > 0
                                                ? t(
                                                      'ceo_dashboard.text.kpi_reviews',
                                                      {
                                                          count: pendingKpiReviews.length,
                                                      },
                                                  )
                                                : t(
                                                      'ceo_dashboard.text.kpi_completed',
                                                  )}
                                        </p>
                                        <div className="mb-4 space-y-2">
                                            {kpiReviewProjects
                                                .slice(0, 3)
                                                .map((project) => (
                                                    <Link
                                                        key={project.id}
                                                        href={`/ceo/kpi-review/${project.id}`}
                                                        className="flex items-center justify-between flex-wrap rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                    >
                                                        <span className="font-medium">
                                                            {project.company
                                                                ?.name ||
                                                                `Project #${project.id}`}
                                                        </span>
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                                    <div className="flex items-center justify-between flex-wrap">
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
                                            const diagnosisStatus =
                                                project.step_statuses
                                                    ?.diagnosis ||
                                                'not_started';
                                            const statusBadge =
                                                getStatusBadge(diagnosisStatus);
                                            const needsSurvey =
                                                diagnosisStatus ===
                                                    'submitted' &&
                                                !project.ceoPhilosophy;
                                            const hrProgress =
                                                project.hr_progress;
                                            const ceoProgress =
                                                project.ceo_progress;

                                            return (
                                                <Link
                                                    key={project.id}
                                                    href={
                                                        needsSurvey
                                                            ? `/ceo/philosophy/survey/${project.id}`
                                                            : `/ceo/review/diagnosis/${project.id}`
                                                    }
                                                    className="flex items-center justify-between flex-wrap rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex items-center gap-3 flex-wrap">
                                                            <p className="font-medium">
                                                                {project.company
                                                                    ?.name ||
                                                                    `Project #${project.id}`}
                                                            </p>
                                                            <Badge
                                                                variant={
                                                                    statusBadge.variant
                                                                }
                                                            >
                                                                {
                                                                    statusBadge.label
                                                                }
                                                            </Badge>
                                                            {needsSurvey && (
                                                                <Badge variant="outline" className="text-orange-600">
                                                                    {t('ceo_dashboard.survey_required')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                                                            {hrProgress && (
                                                                <p>
                                                                    {t(
                                                                        'ceo_dashboard.text.hr_progress',
                                                                        {
                                                                            completed:
                                                                                hrProgress.completed,
                                                                            total: hrProgress.total,
                                                                            in_progress:
                                                                                hrProgress.in_progress,
                                                                        },
                                                                    )}
                                                                </p>
                                                            )}
                                                            {ceoProgress && (
                                                                <p>
                                                                    {t(
                                                                        'ceo_dashboard.text.ceo_progress',
                                                                        {
                                                                            review:
                                                                                ceoProgress.diagnosis_review ===
                                                                                'completed'
                                                                                    ? t(
                                                                                          'ceo_dashboard.text.review_done',
                                                                                      )
                                                                                    : t(
                                                                                          'ceo_dashboard.text.review_pending',
                                                                                      ),
                                                                            survey:
                                                                                ceoProgress.survey ===
                                                                                'completed'
                                                                                    ? t(
                                                                                          'ceo_dashboard.text.survey_done',
                                                                                      )
                                                                                    : t(
                                                                                          'ceo_dashboard.text.survey_pending',
                                                                                      ),
                                                                        },
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {needsSurvey
                                                                ? t('ceo_dashboard.complete_survey_cta', {
                                                                      defaultValue: 'Complete CEO Philosophy Survey',
                                                                  })
                                                                : t('ceo_dashboard.review_diagnosis')
                                                            }
                                                        </p>
                                                    </div>
                                                    <Eye className="h-5 w-5 text-muted-foreground" />
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* View All Projects */}
                                    <Link href="/ceo/projects">
                                        <Card className="cursor-pointer border-2 transition-shadow hover:border-primary/50 hover:shadow-lg">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                        <FolderKanban className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold mb-1">{t('ceo_dashboard.quick_actions.view_all_projects')}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t('ceo_dashboard.quick_actions.view_all_projects_desc')}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    {/* Start Survey */}
                                    {surveyAvailableProjects.length > 0 && (
                                        <Link
                                            href={`/ceo/philosophy/survey/${surveyAvailableProjects[0].id}`}
                                        >
                                            <Card className="cursor-pointer border-2 border-emerald-200 transition-shadow hover:border-emerald-400 hover:shadow-lg dark:border-emerald-800 dark:hover:border-emerald-600">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
                                                            <ClipboardList className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold mb-1">{t('ceo_dashboard.quick_actions.start_survey')}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {t(
                                                                    'ceo_dashboard.text.survey_description',
                                                                )}
                                                                {surveyAvailableProjects.length >
                                                                1
                                                                    ? ` (${surveyAvailableProjects.length} projects)`
                                                                    : surveyAvailableProjects[0]
                                                                            .company
                                                                            ?.name
                                                                      ? ` — ${surveyAvailableProjects[0].company.name}`
                                                                      : ''}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-emerald-100 px-3 py-1 text-lg text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                        >
                                                            {
                                                                surveyAvailableProjects.length
                                                            }
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )}

                                    {/* Pending Reviews Quick Action */}
                                    {pendingReviews.length > 0 && (
                                        <Link href="/ceo/projects">
                                            <Card className="cursor-pointer border-2 border-orange-200 transition-shadow hover:border-orange-300 hover:shadow-lg dark:border-orange-800 dark:hover:border-orange-600">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20">
                                                            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold mb-1">{t('ceo_dashboard.quick_actions.pending_reviews')}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {t(
                                                                    'ceo_dashboard.text.pending_reviews',
                                                                    {
                                                                        count: pendingReviews.length,
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="secondary"
                                                            className="px-3 py-1 text-lg"
                                                        >
                                                            {
                                                                pendingReviews.length
                                                            }
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
