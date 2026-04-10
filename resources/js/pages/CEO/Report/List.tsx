import { Head, Link } from '@inertiajs/react';
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
    company?: { id: number; name: string } | null;
    survey_completed: boolean;
    created_at: string;
}

interface Props {
    projects: Project[];
    stats: {
        total_projects: number;
        survey_completed: number;
    };
}

export default function CeoReportList({ projects, stats }: Props) {
    const { t } = useTranslation();
    void stats;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('ceo_report.title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-8 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-6 py-5 dark:from-slate-900 dark:to-slate-800/80">
                            <h1 className="mb-1 text-3xl font-bold">
                                {t('ceo_report.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('ceo_report.subtitle')}
                            </p>
                        </div>

                        {/* Table */}
                        {projects.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border bg-background">
                                <div className="border-b px-6 py-4">
                                    <h2 className="text-lg font-semibold">
                                        {t('ceo_report.projects')}
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_report.company')}
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_report.survey')}
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    {t('ceo_report.action')}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {projects.map((project) => (
                                                <tr
                                                    key={project.id}
                                                    className="border-t transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {project.company
                                                            ?.name ||
                                                            `Project #${project.id}`}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {project.survey_completed ? (
                                                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                                {t(
                                                                    'ceo_report.survey_completed',
                                                                )}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                {t(
                                                                    'ceo_report.survey_pending',
                                                                )}
                                                            </Badge>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {project.survey_completed ? (
                                                            <Link
                                                                href={`/ceo/report/${project.id}`}
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    {t(
                                                                        'ceo_report.view_report',
                                                                    )}
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled
                                                            >
                                                                {t(
                                                                    'ceo_report.complete_survey_first',
                                                                )}
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border bg-background p-12 text-center">
                                <p className="mb-2 text-lg font-medium">
                                    {t('ceo_report.no_projects')}
                                </p>
                                <p className="text-muted-foreground">
                                    {t('ceo_report.no_projects_desc')}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
