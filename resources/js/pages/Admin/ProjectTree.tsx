import { Head, Link, router } from '@inertiajs/react';
import { Building2, Eye, FileText, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Project {
    id: number;
    company?: {
        id: number;
        name: string;
    };
    step_statuses?: Record<string, string>;
    ceoPhilosophy?: {
        completed_at: string | null;
    };
    diagnosis?: {
        status: string;
    };
    created_at: string;
}

interface Props {
    projects: Project[];
}
type ProjectAction =
    | { type: 'reset'; project: Project }
    | { type: 'delete'; project: Project }
    | null;

export default function ProjectTree({ projects }: Props) {
    const [pendingAction, setPendingAction] = useState<ProjectAction>(null);
    const getProjectProgress = (project: Project) => {
        const statuses = Object.values(project.step_statuses ?? {});
        const completed = statuses.filter((s) => ['approved', 'locked', 'completed'].includes(s)).length;
        const total = 5;
        return { completed, total };
    };

    const handleReset = (project: Project) => {
        setPendingAction({ type: 'reset', project });
    };

    const handleDelete = (project: Project) => {
        setPendingAction({ type: 'delete', project });
    };
    const runProjectAction = () => {
        if (!pendingAction) return;
        if (pendingAction.type === 'reset') {
            router.post(`/admin/projects/${pendingAction.project.id}/reset`, {}, { preserveScroll: true, onSuccess: () => setPendingAction(null) });
            return;
        }
        router.delete(`/admin/projects/${pendingAction.project.id}`, { preserveScroll: true, onSuccess: () => setPendingAction(null) });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Admin - Project View" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-foreground">Project View</h1>
                            <p className="text-muted-foreground">
                                Compact management list for direct admin control and intervention.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {projects.map((project) => {
                                const progress = getProjectProgress(project);
                                const companyName = project.company?.name || `Project #${project.id}`;

                                return (
                                    <Card key={project.id}>
                                        <CardHeader className="py-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <CardTitle className="text-base truncate">{companyName}</CardTitle>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Created: {new Date(project.created_at).toLocaleDateString()} · Progress: {progress.completed}/{progress.total}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{progress.completed}/{progress.total}</Badge>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReset(project)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                                                        title="Reset project data"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(project)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-destructive hover:bg-destructive/10"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <Link href={`/admin/review/${project.id}`}>
                                                        <Badge variant="outline" className="hover:bg-muted gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            View Details
                                                        </Badge>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 pb-3">
                                            <p className="text-xs text-muted-foreground">
                                                Use <strong>View Details</strong> to open Admin Review and inspect/edit entered step data.
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {projects.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No projects found</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </SidebarInset>
            <AlertDialog open={pendingAction !== null} onOpenChange={(o) => !o && setPendingAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.type === 'delete' ? 'Delete project' : 'Reset project data'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction
                                ? pendingAction.type === 'delete'
                                    ? `Delete ${pendingAction.project.company?.name ?? `Project #${pendingAction.project.id}`} and all related data? This cannot be undone.`
                                    : `Reset all entered data for ${pendingAction.project.company?.name ?? `Project #${pendingAction.project.id}`}. Structure remains, data clears.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={pendingAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                            onClick={runProjectAction}
                        >
                            {pendingAction?.type === 'delete' ? 'Delete' : 'Reset'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    );
}
