import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

interface Project {
    id: number;
    company?: { id: number; name: string } | null;
    kpi_total: number;
    kpi_approved: number;
    kpi_review_status: 'pending' | 'approved' | 'revision_requested' | 'none' | 'in_progress';
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

export default function AdminKpiReviewIndex({ projects }: Props) {
    const { t } = useTranslation();

    const getStatusBadge = (status: Project['kpi_review_status']) => {
        if (status === 'approved') return <Badge className="bg-emerald-600">{t('admin_kpi_review.status_approved')}</Badge>;
        if (status === 'revision_requested') return <Badge variant="destructive">{t('admin_kpi_review.status_revision')}</Badge>;
        if (status === 'pending') return <Badge variant="secondary">{t('admin_kpi_review.status_pending')}</Badge>;
        if (status === 'in_progress') return <Badge variant="outline">{t('admin_kpi_review.status_in_progress')}</Badge>;
        return <Badge variant="outline">{t('admin_kpi_review.status_na')}</Badge>;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_kpi_review.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:from-slate-950 dark:to-background">
                            <h1 className="text-2xl font-bold mb-1">{t('admin_kpi_review.heading')}</h1>
                            <p className="text-muted-foreground text-sm">
                                {t('admin_kpi_review.subheading')}
                            </p>
                        </div>

                        <div className="rounded-lg border overflow-hidden bg-background">
                            <div className="px-4 py-3 border-b">
                                <h2 className="text-base font-semibold">{t('admin_kpi_review.section_projects')}</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="text-left">
                                            <th className="px-4 py-2.5 font-semibold">{t('admin_kpi_review.col_company')}</th>
                                            <th className="px-4 py-2.5 font-semibold">{t('admin_kpi_review.col_progress')}</th>
                                            <th className="px-4 py-2.5 font-semibold">{t('admin_kpi_review.col_status')}</th>
                                            <th className="px-4 py-2.5 font-semibold">{t('admin_kpi_review.col_action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.length === 0 ? (
                                            <tr className="border-t">
                                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                    {t('admin_kpi_review.empty')}
                                                </td>
                                            </tr>
                                        ) : (
                                            projects.map((project) => (
                                                <tr key={project.id} className="border-t hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-2.5 font-medium">
                                                        {project.company?.name || t('admin_kpi_review.project_fallback', { id: project.id })}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center gap-2">
                                                            <Target className="h-4 w-4 text-muted-foreground" />
                                                            {project.kpi_approved}/{project.kpi_total}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5">{getStatusBadge(project.kpi_review_status)}</td>
                                                    <td className="px-4 py-2.5">
                                                        <Link href={`/admin/kpi-review/${project.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                {project.kpi_review_status === 'approved' ? (
                                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                ) : (
                                                                    <Clock3 className="h-4 w-4 mr-1" />
                                                                )}
                                                                {t('admin_kpi_review.open_review')}
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
