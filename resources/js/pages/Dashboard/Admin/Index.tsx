import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    DollarSign,
    Eye,
    FileText,
    FolderKanban,
    LayoutGrid,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Project {
    id: number;
    company?: {
        name: string;
    };
    step_statuses?: Record<string, string>;
    created_at: string;
}

interface Company {
    id: number;
    name: string;
}

interface Props {
    projects: Project[];
    stats: {
        total_projects: number;
        total_companies: number;
        active_projects: number;
        completed_projects: number;
        pending_diagnosis: number;
        pending_ceo_survey: number;
        pending_kpi_review?: number;
    };
    recentProjects: Project[];
    pendingKpiReviews?: Project[];
    projectsNeedingPerformanceRecommendation?: Project[];
    projectsNeedingCompensationRecommendation?: Project[];
    companies?: Company[];
    users?: Array<{
        id: number;
        name: string;
        email: string;
        role: 'ceo' | 'hr_manager' | string;
        companyNames: string[];
        email_verified_at?: string | null;
        access_granted_at: string | null;
    }>;
    total_hr_users?: number;
    total_ceo_users?: number;
}

export default function AdminDashboard({
    projects,
    stats,
    recentProjects,
    pendingKpiReviews = [],
    projectsNeedingPerformanceRecommendation = [],
    projectsNeedingCompensationRecommendation = [],
    companies = [],
    users = [],
    total_hr_users = 0,
    total_ceo_users = 0,
}: Props) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<
            string,
            {
                label: string;
                variant: 'default' | 'secondary' | 'destructive' | 'outline';
            }
        > = {
            not_started: { label: 'Not Started', variant: 'outline' },
            in_progress: { label: 'In Progress', variant: 'secondary' },
            submitted: { label: 'Submitted', variant: 'default' },
            completed: { label: 'Completed', variant: 'default' },
            locked: { label: 'Locked', variant: 'default' },
        };
        return statusMap[status] || { label: status, variant: 'outline' };
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex min-h-screen flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="relative flex-1 overflow-auto bg-background">
                    <div className="relative z-10">
                        <Head title="Admin Dashboard" />
                        <div className="mx-auto max-w-7xl p-6 md:p-8">
                            <div className="mb-8">
                                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                                    <LayoutGrid className="h-8 w-8 text-primary" />
                                </div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    Admin Dashboard
                                </h1>
                                <p className="text-muted-foreground">
                                    Overview of all HR projects and system
                                    statistics
                                </p>
                            </div>

                            {/* Statistics Cards */}
                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    Total HR
                                                </p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {total_hr_users}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                                <Users className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    Total CEO
                                                </p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {total_ceo_users}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                                <Users className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    Total Projects
                                                </p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {stats.total_projects}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                                <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    Total Companies
                                                </p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {stats.total_companies}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20">
                                                <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    Active Projects
                                                </p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {stats.active_projects}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20">
                                                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    Completed
                                                </p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {stats.completed_projects}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                                <CheckCircle2 className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Link href="/admin/ceo?tab=pending">
                                    <Card className="hover:bg-muted/40 transition-colors">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="mb-1 text-sm text-muted-foreground">
                                                        Pending Approval
                                                    </p>
                                                    <p className="text-3xl font-bold text-foreground">
                                                        {users.filter((u) => !u.access_granted_at).length}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        access_granted_at = null
                                                    </p>
                                                </div>
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20">
                                                    <Users className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>

                            {/* Users List */}
                            <div className="mb-8">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-3">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-primary" />
                                                All Users (CEO/HR)
                                            </CardTitle>
                                            <Link href="/admin/ceo">
                                                <Button variant="outline" size="sm">
                                                    Manage
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Role</TableHead>
                                                        <TableHead>Company</TableHead>
                                                        <TableHead>Email verified</TableHead>
                                                        <TableHead>Access</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {users.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                                No users found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        users.map((u) => (
                                                            <TableRow key={u.id}>
                                                                <TableCell className="font-medium">{u.name}</TableCell>
                                                                <TableCell>{u.role === 'ceo' ? 'CEO' : 'HR Manager'}</TableCell>
                                                                <TableCell>
                                                                    {u.companyNames && u.companyNames.length > 0
                                                                        ? u.companyNames.join(', ')
                                                                        : '-'}
                                                                </TableCell>
                                                                <TableCell>{u.access_granted_at ? (u.email_verified_at ? 'Yes' : 'No') : (u.email_verified_at ? 'Yes' : 'No')}</TableCell>
                                                                <TableCell>
                                                                    {u.access_granted_at ? (
                                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                                                                            Active
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                                                            Pending
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Action Cards */}
                            <div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-1">
                                {/* <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Pending Diagnosis Review
                                        </CardTitle>
                                        <Badge variant="secondary">{stats.pending_diagnosis}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Projects waiting for CEO diagnosis review
                                    </p>
                                    <Link href="/admin/review">
                                        <Button variant="outline" className="w-full">
                                            Review Projects
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card> */}

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Pending CEO Survey
                                            </CardTitle>
                                            <Badge variant="secondary">
                                                {stats.pending_ceo_survey}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Projects waiting for CEO philosophy
                                            survey
                                        </p>
                                        <Link href="/admin/hr-projects">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View All Projects
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Projects Needing Recommendations */}
                            {(projectsNeedingPerformanceRecommendation.length >
                                0 ||
                                projectsNeedingCompensationRecommendation.length >
                                    0) && (
                                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {projectsNeedingPerformanceRecommendation.length >
                                        0 && (
                                        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                        Performance
                                                        Recommendations Needed
                                                    </CardTitle>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                    >
                                                        {
                                                            projectsNeedingPerformanceRecommendation.length
                                                        }
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="mb-4 text-sm text-muted-foreground">
                                                    Projects where Step 3 (Job
                                                    Analysis) is confirmed but
                                                    performance recommendation
                                                    is not yet prepared.
                                                </p>
                                                <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                                                    {projectsNeedingPerformanceRecommendation.map(
                                                        (project) => (
                                                            <Link
                                                                key={project.id}
                                                                href={`/admin/recommendations/performance/${project.id}`}
                                                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-background"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">
                                                                        {project
                                                                            .company
                                                                            ?.name ||
                                                                            `Project #${project.id}`}
                                                                    </p>
                                                                </div>
                                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                            </Link>
                                                        ),
                                                    )}
                                                </div>
                                                {projectsNeedingPerformanceRecommendation.length >
                                                    3 && (
                                                    <Link href="/admin/dashboard">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            View All
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {projectsNeedingCompensationRecommendation.length >
                                        0 && (
                                        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                        Compensation
                                                        Recommendations Needed
                                                    </CardTitle>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                    >
                                                        {
                                                            projectsNeedingCompensationRecommendation.length
                                                        }
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="mb-4 text-sm text-muted-foreground">
                                                    Projects where Step 4
                                                    (Performance) is completed
                                                    but compensation
                                                    recommendation is not yet
                                                    prepared.
                                                </p>
                                                <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                                                    {projectsNeedingCompensationRecommendation.map(
                                                        (project) => (
                                                            <Link
                                                                key={project.id}
                                                                href={`/admin/recommendations/compensation/${project.id}`}
                                                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-background"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">
                                                                        {project
                                                                            .company
                                                                            ?.name ||
                                                                            `Project #${project.id}`}
                                                                    </p>
                                                                </div>
                                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                            </Link>
                                                        ),
                                                    )}
                                                </div>
                                                {projectsNeedingCompensationRecommendation.length >
                                                    3 && (
                                                    <Link href="/admin/dashboard">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            View All
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* Recent Projects */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Projects</CardTitle>
                                        <Link href="/admin/hr-projects">
                                            <Button variant="ghost" size="sm">
                                                View All
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {recentProjects.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentProjects.map((project) => {
                                                const diagnosisStatus =
                                                    project.step_statuses
                                                        ?.diagnosis ||
                                                    'not_started';
                                                const statusBadge =
                                                    getStatusBadge(
                                                        diagnosisStatus,
                                                    );

                                                return (
                                                    <Link
                                                        key={project.id}
                                                        href={`/admin/review/${project.id}`}
                                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="mb-1 flex items-center gap-3">
                                                                <p className="font-medium">
                                                                    {project
                                                                        .company
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
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Created{' '}
                                                                {new Date(
                                                                    project.created_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="py-8 text-center text-muted-foreground">
                                            No projects yet
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
