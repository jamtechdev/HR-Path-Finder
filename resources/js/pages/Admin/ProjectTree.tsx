import { Head, Link, router } from '@inertiajs/react';
import { Building2, Eye, FileText, GitBranch, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Project {
  id: number;
  company?: { id: number; name: string };
  step_statuses?: Record<string, string>;
  ceoPhilosophy?: { completed_at: string | null };
  diagnosis?: { status: string };
  created_at: string;
}

interface Props {
  projects: {
    data: Project[];
    links: { url: string | null; label: string; active: boolean }[];
  };
}

type ProjectAction = { type: 'reset' | 'delete'; project: Project } | null;

function formatCreatedDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ProjectTree({ projects }: Props) {
  const [pendingAction, setPendingAction] = useState<ProjectAction>(null);
  const { t } = useTranslation(); // ✅ Dynamic translations

  const getProjectProgress = (project: Project) => {
    const statuses = Object.values(project.step_statuses ?? {});
    const completed = statuses.filter((s) =>
      ['approved', 'locked', 'completed'].includes(s)
    ).length;
    const total = 5;
    return { completed, total };
  };

  const runProjectAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'reset') {
      router.post(
        `/admin/projects/${pendingAction.project.id}/reset`,
        {},
        { preserveScroll: true, onSuccess: () => setPendingAction(null) }
      );
      return;
    }
    router.delete(`/admin/projects/${pendingAction.project.id}`, {
      preserveScroll: true,
      onSuccess: () => setPendingAction(null),
    });
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
            <Head title={t('project_view.page_title')} />
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
              <div className="mb-4">
                <h1 className="text-xl font-semibold text-foreground">{t('project_view.heading')}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{t('project_view.subheading_compact')}</p>
                <p className="text-xs text-blue-600 mt-1">{t('project_view.subheading_guide')}</p>
              </div>

              <div className="space-y-3">
                {projects.data.map((project) => {
                  const progress = getProjectProgress(project);
                  const companyName = project.company?.name ?? `Project #${project.id}`;

                  return (
                    <Card key={project.id} className="shadow-sm border-border/70 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-tight truncate">{companyName}</p>
                              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                                {t('project_view.created')}: {formatCreatedDate(project.created_at)} · {t('project_view.progress')} {progress.completed}/{progress.total}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                            <Badge variant="outline" className="h-7 px-2 text-xs font-medium">
                              {progress.completed}/{progress.total}
                            </Badge>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingAction({ type: 'reset', project })}
                              className="h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              {t('project_view.reset_project')}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingAction({ type: 'delete', project })}
                              className="h-8 gap-1.5 border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t('project_view.delete_project')}
                            </Button>

                            <Link
                              href={`/admin/review/${project.id}`}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium hover:bg-muted"
                            >
                              <Eye className="h-3 w-3" />
                              {t('project_view.view_details')}
                            </Link>
                            <Link
                              href={`/admin/tree/${project.id}`}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-primary/5 px-2.5 text-xs font-medium hover:bg-primary/10"
                            >
                              <GitBranch className="h-3 w-3" />
                              {t('admin_tree.heading')}
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {projects.data.length === 0 && (
                <Card>
                  <CardContent className="py-10 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-70" />
                    <p className="text-sm text-muted-foreground">{t('project_view.no_projects')}</p>
                  </CardContent>
                </Card>
              )}
              {projects.links && projects.links.length > 1 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 border-t pt-4">
                  {projects.links.map((link, i) => (
                    <Link
                      key={i}
                      href={link.url || '#'}
                      className={link.active ? 'rounded border bg-primary px-3 py-1 text-primary-foreground' : 'rounded border px-3 py-1 hover:bg-muted'}
                    >
                      {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </SidebarInset>

        <AlertDialog open={pendingAction !== null} onOpenChange={(o) => !o && setPendingAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingAction?.type === 'delete' ? t('project_view.alert_delete_title') : t('project_view.alert_reset_title')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingAction
                  ? pendingAction.type === 'delete'
                    ? t('project_view.alert_delete_description', { project_name: pendingAction.project.company?.name ?? `Project #${pendingAction.project.id}` })
                    : t('project_view.alert_reset_description', { project_name: pendingAction.project.company?.name ?? `Project #${pendingAction.project.id}` })
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('project_view.alert_cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className={pendingAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                onClick={runProjectAction}
              >
                {pendingAction?.type === 'delete' ? t('project_view.alert_delete_action') : t('project_view.alert_reset_action')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
    </TooltipProvider>
  );
}