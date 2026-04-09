import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    CalendarDays, 
    Eye, 
    GitBranch, 
    MessageSquareText, 
    CheckCircle2, 
    Clock, 
    Layers,
    ChevronRight,
    Search
} from 'lucide-react';
import StepDataFields, { StepDataJsonToggle } from '@/components/Admin/StepDataFields';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress'; // Assuming you have shadcn progress
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Project {
    id: number;
    company: {
        name: string;
    } | null;
    step_statuses?: Record<string, string>;
    created_at?: string;
}

interface AdminComment {
    id: number;
    comment: string;
    step: string;
    created_at: string;
}

interface Props {
    project: Project | null;
    projects?: Project[];
    comments?: AdminComment[];
    stepData?: Record<string, unknown>;
}

const STEP_LABELS: Record<string, string> = {
    diagnosis: 'Diagnosis',
    ceo_philosophy: 'CEO philosophy',
    organization_design: 'Organization design',
    performance_system: 'Performance system',
    compensation_system: 'Compensation system',
    hr_policy_os: 'HR policy OS',
};

// Helper for status colors
const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    if (['approved', 'completed', 'locked'].includes(s)) 
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    if (['submitted'].includes(s)) 
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
};

export default function AdminReview({
    project,
    projects = [],
    comments = [],
    stepData = {},
}: Props) {
    const { t } = useTranslation();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(project?.id ?? null);
    const orderedSteps = Object.keys(STEP_LABELS);
    const [activeDataStep, setActiveDataStep] = useState<string>(orderedSteps[0] ?? 'diagnosis');

    useEffect(() => {
        setSelectedProjectId(project?.id ?? null);
    }, [project?.id]);

    useEffect(() => {
        const firstStepWithData = orderedSteps.find((step) => {
            const value = stepData[step];
            return value !== null && value !== undefined;
        });
        setActiveDataStep(firstStepWithData ?? orderedSteps[0] ?? 'diagnosis');
    }, [project?.id, stepData]);

    const { data, setData, post, processing, clearErrors } = useForm({
        comment: '',
        step: '',
    });

    const handleAddComment = () => {
        if (selectedProjectId) {
            post(`/admin/review/${selectedProjectId}/comment`, {
                onSuccess: () => {
                    setData('comment', '');
                    clearErrors('comment');
                    setData('step', '');
                    clearErrors('step');
                },
            });
        }
    };

    const selectedProject = project ?? projects.find((p) => p.id === selectedProjectId) ?? null;
    const stepStatuses = selectedProject?.step_statuses ?? {};
    const totalSteps = Object.keys(STEP_LABELS).length; // Using labels for consistent count
    const completedSteps = Object.values(stepStatuses).filter((s) =>
        ['approved', 'locked', 'completed', 'submitted'].includes(String(s)),
    ).length;
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    const dataTabSteps = orderedSteps.filter(
        (step) => step in stepData || step in stepStatuses,
    );

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-slate-50/50 dark:bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto">
                    <Head title={t('admin_review.page_title')} />

                    <div className="mx-auto max-w-[1600px] p-6 lg:p-10">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                                    {t('admin_review.heading')}
                                </h1>
                                <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                                    {t('admin_review.subheading')}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-slate-950 shadow-sm border-blue-100 text-blue-600">
                                    {t('admin_review.note')}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* Left Column: Project List */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Layers className="h-4 w-4" /> {t('admin_review.projects')}
                                    </h2>
                                    <Badge variant="secondary" className="rounded-full">{projects.length}</Badge>
                                </div>
                                
                                <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                                    <CardContent className="p-2 space-y-1">
                                        {projects.map((p) => (
                                            <Link
                                                key={p.id}
                                                href={`/admin/review/${p.id}`}
                                                onClick={() => setSelectedProjectId(p.id)}
                                                className={cn(
                                                    "group flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-all duration-200",
                                                    p.id === (project?.id ?? selectedProjectId)
                                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                )}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="font-semibold truncate">{p.company?.name ?? `Project #${p.id}`}</div>
                                                    <div className={cn(
                                                        "text-[10px] uppercase tracking-wide mt-0.5 opacity-80",
                                                        p.id === (project?.id ?? selectedProjectId) ? "text-primary-foreground/80" : "text-muted-foreground"
                                                    )}>
                                                        ID: {p.id} • {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                                                    </div>
                                                </div>
                                                <ChevronRight className={cn(
                                                    "h-4 w-4 transition-transform group-hover:translate-x-1",
                                                    p.id === (project?.id ?? selectedProjectId) ? "text-primary-foreground" : "text-slate-300"
                                                )} />
                                            </Link>
                                        ))}
                                        {projects.length === 0 && (
                                            <div className="py-10 text-center space-y-2">
                                                <Search className="h-8 w-8 mx-auto text-slate-300" />
                                                <p className="text-sm text-muted-foreground">{t('admin_review.no_projects')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Project Details */}
                            <div className="lg:col-span-9 space-y-8">
                                {selectedProject ? (
                                    <>
                                        {/* Summary Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                                                <CardContent className="p-5 flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                        <Layers className="h-6 w-6" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Client</p>
                                                        <p className="text-lg font-bold truncate text-slate-900 dark:text-slate-50">
                                                            {selectedProject.company?.name ?? `Project #${selectedProject.id}`}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                                                <CardContent className="p-5 space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</p>
                                                            <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                                                {completedSteps} <span className="text-sm font-normal text-muted-foreground">/ {totalSteps} Steps</span>
                                                            </p>
                                                        </div>
                                                        <CheckCircle2 className={cn("h-6 w-6", progressPercentage === 100 ? "text-emerald-500" : "text-slate-200")} />
                                                    </div>
                                                    <Progress value={progressPercentage} className="h-2 bg-slate-100 dark:bg-slate-800" />
                                                </CardContent>
                                            </Card>

                                            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                                                <CardContent className="p-5 flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600">
                                                        <MessageSquareText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Feedback</p>
                                                        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{comments.length} Comments</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Status Overview Card */}
                                        <Card className="border-none shadow-sm overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-slate-900 border-b pb-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                        <Clock className="h-5 w-5 text-primary" />
                                                        Workflow Status
                                                    </CardTitle>
                                                    <Button asChild variant="secondary" size="sm" className="h-8 shadow-sm">
                                                        <Link href={`/admin/tree/${selectedProject.id}`}>
                                                            <GitBranch className="h-3.5 w-3.5 mr-2" />
                                                            View Tree Map
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 bg-white dark:bg-slate-900/50">
                                                <div className="flex flex-wrap gap-3">
                                                    {Object.keys(selectedProject.step_statuses ?? {}).length === 0 ? (
                                                        <div className="w-full text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed">
                                                            <p className="text-sm text-muted-foreground">{t('admin_review.no_statuses')}</p>
                                                        </div>
                                                    ) : (
                                                        Object.entries(selectedProject.step_statuses ?? {}).map(([step, status]) => (
                                                            <Badge 
                                                                key={step} 
                                                                variant="outline" 
                                                                className={cn("px-3 py-1.5 text-xs font-medium border capitalize", getStatusStyles(String(status)))}
                                                            >
                                                                <span className="opacity-70 mr-1.5">{STEP_LABELS[step] ?? step}:</span>
                                                                {String(status)}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Main Step Data View */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('admin_review.submitted_step_data')}</h3>
                                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                            </div>

                                            {Object.keys(stepData).length === 0 ? (
                                                <Card className="border-dashed shadow-none">
                                                    <CardContent className="p-12 text-center text-muted-foreground">
                                                        {t('admin_review.no_step_payloads')}
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-900">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base">Step-wise data view</CardTitle>
                                                        <CardDescription>
                                                            Switch tabs to review each workflow step clearly.
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <Tabs value={activeDataStep} onValueChange={setActiveDataStep}>
                                                            <TabsList className="w-full justify-start overflow-x-auto">
                                                                {(dataTabSteps.length > 0 ? dataTabSteps : orderedSteps).map((step) => (
                                                                    <TabsTrigger
                                                                        key={step}
                                                                        value={step}
                                                                        className="whitespace-nowrap"
                                                                    >
                                                                        {STEP_LABELS[step] ?? step}
                                                                    </TabsTrigger>
                                                                ))}
                                                            </TabsList>

                                                            {(dataTabSteps.length > 0 ? dataTabSteps : orderedSteps).map((step) => {
                                                                const value = stepData[step];
                                                                return (
                                                                    <TabsContent key={step} value={step} className="mt-4">
                                                                        <div className="rounded-lg border bg-slate-50/40 dark:bg-slate-800/20">
                                                                            <div className="border-b px-4 py-3 flex items-center justify-between">
                                                                                <span className="text-sm font-semibold">
                                                                                    {STEP_LABELS[step] ?? step}
                                                                                </span>
                                                                                {value ? (
                                                                                    <Badge variant="secondary">Active payload</Badge>
                                                                                ) : (
                                                                                    <Badge variant="outline">No payload</Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="p-4">
                                                                                {value === null || value === undefined ? (
                                                                                    <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                                                        <Clock className="h-4 w-4" /> {t('admin_review.not_started_no_data')}
                                                                                    </p>
                                                                                ) : (
                                                                                    <div className="space-y-4">
                                                                                        <StepDataFields data={value} />
                                                                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                                            <StepDataJsonToggle value={value} />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </TabsContent>
                                                                );
                                                            })}
                                                        </Tabs>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>

                                        {/* Feedback System */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Add Comment */}
                                            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 h-full">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <MessageSquareText className="h-5 w-5 text-blue-500" />
                                                        {t('admin_review.add_comment')}
                                                    </CardTitle>
                                                    <CardDescription>Provide feedback for specific workflow steps</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="step" className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Target Step</Label>
                                                        <select
                                                            id="step"
                                                            value={data.step}
                                                            onChange={(e) => {
                                                                setData('step', e.target.value);
                                                                clearErrors('step');
                                                            }}
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        >
                                                            <option value="">{t('admin_review.select_step')}</option>
                                                            {Object.entries(STEP_LABELS).map(([val, label]) => (
                                                                <option key={val} value={val}>{label}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="comment" className="text-xs font-bold uppercase text-muted-foreground tracking-wide">{t('admin_review.comment')}</Label>
                                                        <Textarea
                                                            id="comment"
                                                            value={data.comment}
                                                            onChange={(e) => {
                                                                setData('comment', e.target.value);
                                                                clearErrors('comment');
                                                            }}
                                                            placeholder={t('admin_review.comment_placeholder')}
                                                            rows={5}
                                                            className="resize-none"
                                                        />
                                                    </div>

                                                    <Button
                                                        onClick={handleAddComment}
                                                        className="w-full shadow-lg shadow-primary/20"
                                                        disabled={processing || !data.comment || !data.step}
                                                    >
                                                        {processing ? "Sending..." : t('admin_review.add_comment_button')}
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* Comment History */}
                                            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 h-full">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <CalendarDays className="h-5 w-5 text-purple-500" />
                                                        {t('admin_review.comment_history')}
                                                    </CardTitle>
                                                    <CardDescription>Past feedback and audit log</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    <div className="max-h-[450px] overflow-auto px-6 pb-6 space-y-6">
                                                        {comments.length > 0 ? (
                                                            comments.map((c, idx) => (
                                                                <div key={c.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 last:border-l-transparent">
                                                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary" />
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/20 bg-primary/5">
                                                                            {STEP_LABELS[c.step] ?? c.step}
                                                                        </Badge>
                                                                        <span className="text-[10px] font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                                            {new Date(c.created_at).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800">
                                                                        {c.comment}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-20 text-center text-muted-foreground italic text-sm">
                                                                No comments recorded yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </>
                                ) : (
                                    <Card className="border-dashed bg-transparent">
                                        <CardContent className="p-20 text-center">
                                            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Eye className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">No Project Selected</h3>
                                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                                {t('admin_review.select_project_hint')}
                                            </p>
                                            <Button asChild variant="default" className="mt-8 px-8">
                                                <Link href="/admin/project-view">{t('admin_review.open_project_view')}</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}