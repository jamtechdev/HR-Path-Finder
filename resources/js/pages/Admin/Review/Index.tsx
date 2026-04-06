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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                    <Head title={t('admin_review.page_title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="mb-2 text-3xl font-bold">{t('admin_review.heading')}</h1>
                            <p className="text-muted-foreground">
                                {t('admin_review.subheading')}
                            </p>
                            <p className="text-sm text-blue-600 mt-2">
                                {t('admin_review.note')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">{t('admin_review.projects')}</CardTitle>
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
                                            <p className="text-sm text-muted-foreground">{t('admin_review.no_projects')}</p>
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
                                                    <Badge variant="secondary">{t('admin_review.selected')}</Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-2 pt-0">
                                                <p className="text-xs font-medium text-muted-foreground">{t('admin_review.step_status')}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Object.keys(selectedProject.step_statuses ?? {}).length === 0 ? (
                                                        <span className="text-xs text-muted-foreground">{t('admin_review.no_statuses')}</span>
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
                                                <CardTitle className="text-base">{t('admin_review.submitted_step_data')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-0">
                                                {Object.keys(stepData).length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">{t('admin_review.no_step_payloads')}</p>
                                                ) : (
                                                    Object.entries(stepData).map(([key, value]) => {
                                                        if (value === null || value === undefined) {
                                                            return (
                                                                <div key={key} className="rounded-lg border">
                                                                    <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                                                                        {STEP_LABELS[key] ?? key}
                                                                    </div>
                                                                    <p className="p-3 text-xs text-muted-foreground">{t('admin_review.not_started_no_data')}</p>
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
                                                <CardTitle className="text-base">{t('admin_review.add_comment')}</CardTitle>
                                            </CardHeader>

                                            <CardContent className="space-y-4 pt-0">
                                                <div>
                                                    <Label htmlFor="step">{t('admin_review.step')}</Label>
                                                    <select
                                                        id="step"
                                                        value={data.step}
                                                        onChange={(e) => {
                                                            setData('step', e.target.value);
                                                            clearInertiaFieldError(clearErrors, 'step');
                                                        }}
                                                        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                                                    >
                                                        <option value="">{t('admin_review.select_step')}</option>
                                                        <option value="diagnosis">Diagnosis</option>
                                                        <option value="organization">Organization</option>
                                                        <option value="performance">Performance</option>
                                                        <option value="compensation">Compensation</option>
                                                        <option value="hr_policy_os">HR Policy OS</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="comment">{t('admin_review.comment')}</Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={data.comment}
                                                        onChange={(e) => {
                                                            setData('comment', e.target.value);
                                                            clearInertiaFieldError(clearErrors, 'comment');
                                                        }}
                                                        placeholder={t('admin_review.comment_placeholder')}
                                                        rows={4}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleAddComment}
                                                    disabled={processing || !data.comment || !data.step}
                                                >
                                                    {t('admin_review.add_comment_button')}
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {comments.length > 0 && (
                                            <Card>
                                                <CardHeader className="py-3">
                                                    <CardTitle className="text-base">{t('admin_review.comment_history')}</CardTitle>
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
                                                {t('admin_review.select_project_hint')}
                                            </p>
                                            <Button asChild variant="outline" className="mt-4">
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
