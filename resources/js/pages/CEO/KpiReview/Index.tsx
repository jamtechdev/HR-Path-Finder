import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, Target } from 'lucide-react';
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
    kpi_total: number;
    kpi_approved: number;
    kpi_review_status: 'pending' | 'approved' | 'revision_requested' | 'none';
    created_at: string;
}

interface Props {
    projects: Project[];
    stats: {
        total_projects: number;
        kpi_projects: number;
        pending_kpi_review: number;
        completed_kpi_review: number;
    };
}

export default function CeoKpiReviewIndex({ projects }: Props) {
    const { t } = useTranslation();

    const getStatusBadge = (status: Project['kpi_review_status']) => {
        if (status === 'approved') {
            return (
                <Badge className="bg-emerald-600">
                    {t('ceo_kpi.status_approved')}
                </Badge>
            );
        }
        if (status === 'revision_requested') {
            return (
                <Badge variant="destructive">
                    {t('ceo_kpi.status_revision_requested')}
                </Badge>
            );
        }
        if (status === 'pending') {
            return (
                <Badge variant="secondary">{t('ceo_kpi.status_pending')}</Badge>
            );
        }
        return <Badge variant="outline">{t('ceo_kpi.status_na')}</Badge>;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('ceo_kpi.title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-8 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <h1 className="mb-1 text-3xl font-bold">
                                {t('ceo_kpi.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('ceo_kpi.subtitle')}
                            </p>
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-lg border bg-background">
                            <div className="border-b px-6 py-4">
                                <h2 className="text-lg font-semibold">
                                    {t('ceo_kpi.list_title')}
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="text-left">
                                            <th className="px-4 py-3 font-semibold">
                                                {t('ceo_kpi.company')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('ceo_kpi.kpi_progress')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('ceo_kpi.status')}
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                {t('ceo_kpi.action')}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {projects.length === 0 ? (
                                            <tr className="border-t">
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-8 text-center text-muted-foreground"
                                                >
                                                    {t('ceo_kpi.no_projects')}
                                                </td>
                                            </tr>
                                        ) : (
                                            projects.map((project) => (
                                                <tr
                                                    key={project.id}
                                                    className="border-t transition-colors hover:bg-muted/30"
                                                >
                                                    {/* Company */}
                                                    <td className="px-4 py-3 font-medium">
                                                        {project.company
                                                            ?.name ||
                                                            `Project #${project.id}`}
                                                    </td>

                                                    {/* KPI Progress */}
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center gap-2">
                                                            <Target className="h-4 w-4 text-muted-foreground" />
                                                            {
                                                                project.kpi_approved
                                                            }
                                                            /{project.kpi_total}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(
                                                            project.kpi_review_status,
                                                        )}
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={`/ceo/kpi-review/${project.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                {project.kpi_review_status ===
                                                                'approved' ? (
                                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                                ) : (
                                                                    <Clock3 className="mr-1 h-4 w-4" />
                                                                )}
                                                                {t(
                                                                    'ceo_kpi.open_review',
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
