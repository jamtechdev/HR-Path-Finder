import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, Target } from 'lucide-react';
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
    const getStatusBadge = (status: Project['kpi_review_status']) => {
        if (status === 'approved') return <Badge className="bg-emerald-600">Approved</Badge>;
        if (status === 'revision_requested') return <Badge variant="destructive">Revision requested</Badge>;
        if (status === 'pending') return <Badge variant="secondary">Pending</Badge>;
        if (status === 'in_progress') return <Badge variant="outline">In progress</Badge>;
        return <Badge variant="outline">N/A</Badge>;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="KPI Review - Admin" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 rounded-2xl border bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:from-slate-950 dark:to-background">
                            <h1 className="text-2xl font-bold mb-1">KPI Review</h1>
                            <p className="text-muted-foreground text-sm">
                                All projects that contain KPIs. Open a row to approve or request revisions.
                            </p>
                        </div>

                        <div className="rounded-lg border overflow-hidden bg-background">
                            <div className="px-4 py-3 border-b">
                                <h2 className="text-base font-semibold">Projects with KPIs</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr className="text-left">
                                            <th className="px-4 py-2.5 font-semibold">Company</th>
                                            <th className="px-4 py-2.5 font-semibold">KPI progress</th>
                                            <th className="px-4 py-2.5 font-semibold">Status</th>
                                            <th className="px-4 py-2.5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.length === 0 ? (
                                            <tr className="border-t">
                                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                    No KPI review projects yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            projects.map((project) => (
                                                <tr key={project.id} className="border-t hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-2.5 font-medium">
                                                        {project.company?.name || `Project #${project.id}`}
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
                                                                Open KPI review
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
