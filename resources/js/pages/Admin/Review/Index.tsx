import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StepDataFields, { StepDataJsonToggle } from '@/components/Admin/StepDataFields';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

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

export default function AdminReview({
    project,
    projects = [],
    comments = [],
    stepData = {},
}: Props) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(project?.id ?? null);

    useEffect(() => {
        setSelectedProjectId(project?.id ?? null);
    }, [project?.id]);

    const { data, setData, post, processing, clearErrors } = useForm({
        comment: '',
        step: '',
    });

    const handleAddComment = () => {
        if (selectedProjectId) {
            post(`/admin/review/${selectedProjectId}/comment`, {
                onSuccess: () => {
                    setData('comment', '');
                    clearInertiaFieldError(clearErrors, 'comment');
                    setData('step', '');
                    clearInertiaFieldError(clearErrors, 'step');
                },
            });
        }
    };

    const selectedProject = project ?? projects.find((p) => p.id === selectedProjectId) ?? null;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Admin Review" />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="mb-2 text-3xl font-bold">Admin Review</h1>
                            <p className="text-muted-foreground">
                                Browse projects on the left, then inspect structured step data and add comments for the CEO/HR team.
                            </p>
                            <p className="text-sm text-blue-600 mt-2">
                                Admin note: this page is for data control. Select a project, verify actual user inputs per step, and leave actionable comments.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">Projects</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-1.5 pt-0">
                                        {projects.map((p) => (
                                            <Link
                                                key={p.id}
                                                href={`/admin/review/${p.id}`}
                                                onClick={() => setSelectedProjectId(p.id)}
                                                className={`block rounded-md border px-2.5 py-2 text-sm transition-colors hover:bg-muted ${
                                                    p.id === (project?.id ?? selectedProjectId) ? 'border-primary/40 bg-muted' : ''
                                                }`}
                                            >
                                                <div className="font-medium leading-tight">{p.company?.name ?? `Project #${p.id}`}</div>
                                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                                    Created{' '}
                                                    {p.created_at
                                                        ? new Date(p.created_at).toISOString().slice(0, 10)
                                                        : '—'}
                                                </div>
                                            </Link>
                                        ))}
                                        {projects.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No projects yet.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6 lg:col-span-2">
                                {selectedProject ? (
                                    <>
                                        <Card>
                                            <CardHeader className="py-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <CardTitle className="text-lg">
                                                        {selectedProject.company?.name ?? `Project #${selectedProject.id}`}
                                                    </CardTitle>
                                                    <Badge variant="secondary">Selected</Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-2 pt-0">
                                                <p className="text-xs font-medium text-muted-foreground">Step status</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Object.keys(selectedProject.step_statuses ?? {}).length === 0 ? (
                                                        <span className="text-xs text-muted-foreground">No statuses recorded</span>
                                                    ) : (
                                                        Object.entries(selectedProject.step_statuses ?? {}).map(([step, status]) => (
                                                            <Badge key={step} variant="outline" className="text-xs font-normal">
                                                                {step}: {status}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-base">Submitted step data</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-0">
                                                {Object.keys(stepData).length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No submitted step payloads for this project yet.</p>
                                                ) : (
                                                    Object.entries(stepData).map(([key, value]) => {
                                                        if (value === null || value === undefined) {
                                                            return (
                                                                <div key={key} className="rounded-lg border">
                                                                    <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                                                                        {STEP_LABELS[key] ?? key}
                                                                    </div>
                                                                    <p className="p-3 text-xs text-muted-foreground">Not started / no data</p>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div key={key} className="rounded-lg border">
                                                                <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                                                                    {STEP_LABELS[key] ?? key}
                                                                </div>
                                                                <div className="p-3 space-y-2">
                                                                    <StepDataFields data={value} />
                                                                    <StepDataJsonToggle value={value} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-base">Add comment</CardTitle>
                                            </CardHeader>

                                            <CardContent className="space-y-4 pt-0">
                                                <div>
                                                    <Label htmlFor="step">Step</Label>
                                                    <select
                                                        id="step"
                                                        value={data.step}
                                                        onChange={(e) => {
                                                            setData('step', e.target.value);
                                                            clearInertiaFieldError(clearErrors, 'step');
                                                        }}
                                                        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                                                    >
                                                        <option value="">Select step</option>
                                                        <option value="diagnosis">Diagnosis</option>
                                                        <option value="organization">Organization</option>
                                                        <option value="performance">Performance</option>
                                                        <option value="compensation">Compensation</option>
                                                        <option value="hr_policy_os">HR Policy OS</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="comment">Comment</Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={data.comment}
                                                        onChange={(e) => {
                                                            setData('comment', e.target.value);
                                                            clearInertiaFieldError(clearErrors, 'comment');
                                                        }}
                                                        placeholder="Add your comment..."
                                                        rows={4}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleAddComment}
                                                    disabled={processing || !data.comment || !data.step}
                                                >
                                                    Add comment
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {comments.length > 0 && (
                                            <Card>
                                                <CardHeader className="py-3">
                                                    <CardTitle className="text-base">Comment history</CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-3 pt-0">
                                                    {comments.map((c) => (
                                                        <div key={c.id} className="rounded-lg border p-3">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <Badge variant="outline">{c.step}</Badge>
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {new Date(c.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-sm">{c.comment}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                ) : (
                                    <Card>
                                        <CardContent className="p-10 text-center">
                                            <p className="text-muted-foreground text-sm">
                                                Select a project from the list to view submitted data and comments.
                                            </p>
                                            <Button asChild variant="outline" className="mt-4">
                                                <Link href="/admin/project-view">Open Project View</Link>
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
