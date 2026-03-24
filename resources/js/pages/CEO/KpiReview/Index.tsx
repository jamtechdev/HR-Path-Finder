import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, Target } from 'lucide-react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

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

export default function CeoKpiReviewIndex({ projects, stats }: Props) {
    const getStatusBadge = (status: Project['kpi_review_status']) => {
        if (status === 'approved') return <Badge className="bg-emerald-600">Approved</Badge>;
        if (status === 'revision_requested') return <Badge variant="destructive">Revision Requested</Badge>;
        if (status === 'pending') return <Badge variant="secondary">Pending</Badge>;
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
                    <Head title="KPI Review - CEO" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">KPI Review</h1>
                            <p className="text-muted-foreground">All projects that contain KPIs for CEO review.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="border-t-4 border-t-blue-500">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                                    <p className="text-3xl font-bold">{stats.total_projects}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-t-4 border-t-cyan-500">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-1">KPI Projects</p>
                                    <p className="text-3xl font-bold">{stats.kpi_projects}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-t-4 border-t-amber-500">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-1">Pending KPI Review</p>
                                    <p className="text-3xl font-bold">{stats.pending_kpi_review}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-t-4 border-t-emerald-500">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-1">Completed KPI Review</p>
                                    <p className="text-3xl font-bold">{stats.completed_kpi_review}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>KPI Review List</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold">Company</th>
                                                <th className="px-4 py-3 font-semibold">KPI Progress</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="px-4 py-3 font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.length === 0 ? (
                                                <tr className="border-t">
                                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                        No KPI review projects available yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                projects.map((project) => (
                                                    <tr key={project.id} className="border-t">
                                                        <td className="px-4 py-3 font-medium">
                                                            {project.company?.name || `Project #${project.id}`}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2">
                                                                <Target className="h-4 w-4 text-muted-foreground" />
                                                                {project.kpi_approved}/{project.kpi_total}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">{getStatusBadge(project.kpi_review_status)}</td>
                                                        <td className="px-4 py-3">
                                                            <Link href={`/ceo/kpi-review/${project.id}`}>
                                                                <Button size="sm">
                                                                    {project.kpi_review_status === 'approved' ? (
                                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                    ) : (
                                                                        <Clock3 className="h-4 w-4 mr-1" />
                                                                    )}
                                                                    Open KPI Review
                                                                </Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
