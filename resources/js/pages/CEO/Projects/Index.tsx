import { Head, Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';

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
    const { t } = useTranslation();
    const tx = (key: string, fallback: string) =>
        t(key, { defaultValue: fallback });

    const getOverallStatus = (project: Project) => {
        const stepStatuses = project.step_statuses || {};
        const allSteps = [
            'diagnosis',
            'job_analysis',
            'performance',
            'compensation',
            'hr_policy_os',
        ];

        const allApproved = allSteps.every((step) => {
            const status = stepStatuses[step];
            return (
                status && ['approved', 'locked', 'completed'].includes(status)
            );
        });

        if (allApproved) return 'completed';

        const hasSubmitted = allSteps.some(
            (step) => stepStatuses[step] === 'submitted',
        );
        if (hasSubmitted) return 'pending_review';

        return 'in_progress';
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background dark:bg-slate-900">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('ceo_project.title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-8 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <h1 className="mb-1 text-3xl font-bold text-foreground">
                                {t('ceo_project.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('ceo_project.subtitle')}
                            </p>
                        </div>

                        {/* Table */}
                        {projects.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border bg-background">
                                <div className="border-b px-6 py-4">
                                    <h2 className="text-lg font-semibold">
                                        {t('ceo_project.title')}
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_project.company')}
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_project.status')}
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_project.survey')}
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_project.action')}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {projects.map((project) => {
                                                const surveyDone =
                                                    !!project.ceo_philosophy
                                                        ?.completed_at;

                                                const surveyStatus = surveyDone
                                                    ? 'completed'
                                                    : project.survey_status ||
                                                      'not_available';

                                                const overallStatus =
                                                    getOverallStatus(project);

                                                return (
                                                    <tr
                                                        key={project.id}
                                                        className="border-t transition-colors hover:bg-muted/30"
                                                    >
                                                        {/* Company */}
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium">
                                                                {project.company
                                                                    ?.name ||
                                                                    tx('common.project_number', `Project #${project.id}`).replace('{{id}}', String(project.id))}
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline">
                                                                {t(
                                                                    `ceo_project.status_${overallStatus}`,
                                                                    { defaultValue: overallStatus },
                                                                )}
                                                            </Badge>
                                                        </td>

                                                        {/* Survey */}
                                                        <td className="px-4 py-3">
                                                            {surveyStatus ===
                                                            'completed' ? (
                                                                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                                    {t(
                                                                        'ceo_project.survey_completed',
                                                                    )}
                                                                </Badge>
                                                            ) : surveyStatus ===
                                                              'pending' ? (
                                                                <Badge variant="outline">
                                                                    {t(
                                                                        'ceo_project.survey_pending',
                                                                    )}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">
                                                                    {t(
                                                                        'ceo_project.survey_na',
                                                                    )}
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                <Link
                                                                    href={`/ceo/projects/${project.id}/verification`}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                    >
                                                                        {t(
                                                                            'ceo_project.verify',
                                                                        )}
                                                                    </Button>
                                                                </Link>

                                                                {surveyDone ? (
                                                                    <Link
                                                                        href={`/ceo/review/diagnosis/${project.id}`}
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                        >
                                                                            {t(
                                                                                'ceo_project.view_diagnosis',
                                                                            )}
                                                                        </Button>
                                                                    </Link>
                                                                ) : (
                                                                    <Link
                                                                        href={`/ceo/philosophy/survey/${project.id}`}
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                        >
                                                                            {t(
                                                                                'ceo_project.start_survey',
                                                                            )}
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
                            <div className="rounded-lg border bg-background p-12 text-center">
                                <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />

                                <p className="mb-2 text-lg font-medium">
                                    {t('ceo_project.no_projects')}
                                </p>

                                <p className="text-muted-foreground">
                                    {t('ceo_project.no_projects_desc')}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
