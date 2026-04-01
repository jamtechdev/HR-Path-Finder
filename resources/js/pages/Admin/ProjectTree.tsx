import { Head, Link, router } from '@inertiajs/react';
import { Building2, Eye, FileText, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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

function formatCreatedDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function ProjectTree({ projects }: Props) {
    const [pendingAction, setPendingAction] = useState<ProjectAction>(null);

    const getProjectProgress = (project: Project) => {
        const statuses = Object.values(project.step_statuses ?? {});
        const completed = statuses.filter((s) => ['approved', 'locked', 'completed'].includes(s)).length;
        const total = 5;
        return { completed, total };
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
        <TooltipProvider delayDuration={300}>
            <SidebarProvider defaultOpen={true}>
                <Sidebar collapsible="icon" variant="sidebar">
                    <RoleBasedSidebar />
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden bg-background">
                    <AppHeader />
                    <main className="flex-1 overflow-auto bg-background">
                        <Head title="Admin - Project View" />
                        <div className="p-4 md:p-6 max-w-5xl mx-auto">
                            <div className="mb-4">
                                <h1 className="text-xl font-semibold text-foreground">Project View</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Compact list — reset, delete, or open Admin Review for each company project.
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Admin guide: use Delete to permanently remove a company project, or View Details to inspect and edit step-by-step entered data.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                {projects.map((project) => {
                                    const progress = getProjectProgress(project);
                                    const companyName = project.company?.name || `Project #${project.id}`;

                                    return (
                                        <Card key={project.id} className="shadow-sm">
                                            <CardContent className="p-2.5 md:py-2 md:px-3">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                                        <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium leading-tight truncate">{companyName}</p>
                                                            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                                                Created: {formatCreatedDate(project.created_at)} · Progress{' '}
                                                                {progress.completed}/{progress.total}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                                                        <Badge variant="outline" className="h-6 px-1.5 text-[10px] font-normal">
                                                            {progress.completed}/{progress.total}
                                                        </Badge>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPendingAction({ type: 'reset', project })}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                                                                    aria-label="Reset project data"
                                                                >
                                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom">Reset project data</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPendingAction({ type: 'delete', project })}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                                                                    aria-label="Delete project"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom">Delete project</TooltipContent>
                                                        </Tooltip>
                                                        <Link
                                                            href={`/admin/review/${project.id}`}
                                                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-medium hover:bg-muted"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {projects.length === 0 && (
                                <Card>
                                    <CardContent className="py-10 text-center">
                                        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-70" />
                                        <p className="text-sm text-muted-foreground">No projects found</p>
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
        </TooltipProvider>
    );
}
