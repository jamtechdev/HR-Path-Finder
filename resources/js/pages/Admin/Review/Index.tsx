import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
    };
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
    project: Project;
    projects?: Project[];
    comments?: AdminComment[];
    stepData?: Record<string, unknown>;
}

export default function AdminReview({
    project,
    projects = [],
    comments = [],
    stepData = {},
}: Props) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        project?.id || null,
    );

    const { data, setData, post, processing, clearErrors } = useForm({
        comment: '',
        step: '', // ✅ IMPORTANT
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

    const selectedProject =
        project || projects.find((p) => p.id === selectedProjectId);

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
                            <h1 className="mb-2 text-3xl font-bold">
                                Admin Review
                            </h1>
                            <p className="text-muted-foreground">
                                Inspect actual user-entered step data, then add directed admin comments.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* LEFT: Project List */}
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Projects</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-2">
                                        {projects.map((p) => (
                                            <Link
                                                key={p.id}
                                                href={`/admin/review/${p.id}`}
                                                className={`block rounded-lg border p-3 hover:bg-muted ${
                                                    p.id === selectedProjectId
                                                        ? 'bg-muted'
                                                        : ''
                                                }`}
                                            >
                                                <div className="font-medium">
                                                    {p.company.name}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Created{' '}
                                                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT: Details */}
                            <div className="space-y-6 lg:col-span-2">
                                {selectedProject ? (
                                    <>
                                        {/* Project Info */}
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle>
                                                        {
                                                            selectedProject
                                                                .company.name
                                                        }
                                                    </CardTitle>
                                                    <Badge>Active</Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Step Status Overview:
                                                    </p>

                                                    {/* Step Status */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.keys(
                                                            selectedProject.step_statuses ||
                                                                {},
                                                        ).map((step) => (
                                                            <Badge
                                                                key={step}
                                                                variant="secondary"
                                                            >
                                                                {step}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Submitted Data Inspector</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {Object.keys(stepData).length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        No submitted step payloads found yet.
                                                    </p>
                                                ) : (
                                                    Object.entries(stepData).map(([key, value]) => (
                                                        <div key={key} className="rounded-lg border">
                                                            <div className="border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                                                                {key}
                                                            </div>
                                                            <pre className="max-h-64 overflow-auto p-3 text-xs">
                                                                {JSON.stringify(value, null, 2)}
                                                            </pre>
                                                        </div>
                                                    ))
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Add Comment */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Add Comment
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                {/* Step Select */}
                                                <div>
                                                    <Label htmlFor="step">
                                                        Select Step
                                                    </Label>
                                                    <select
                                                        id="step"
                                                        value={data.step}
                                                        onChange={(e) => {
                                                            setData('step', e.target.value);
                                                            clearInertiaFieldError(clearErrors, 'step');
                                                        }}
                                                        className="w-full rounded-md border p-2"
                                                    >
                                                        <option value="">
                                                            Select Step
                                                        </option>
                                                        <option value="diagnosis">
                                                            Diagnosis
                                                        </option>
                                                        <option value="organization">
                                                            Organization
                                                        </option>
                                                        <option value="performance">
                                                            Performance
                                                        </option>
                                                        <option value="compensation">
                                                            Compensation
                                                        </option>
                                                        <option value="hr_policy_os">
                                                            HR Policy OS
                                                        </option>
                                                    </select>
                                                </div>

                                                {/* Comment */}
                                                <div>
                                                    <Label htmlFor="comment">
                                                        Comment
                                                    </Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={data.comment}
                                                        onChange={(e) => {
                                                            setData('comment', e.target.value);
                                                            clearInertiaFieldError(clearErrors, 'comment');
                                                        }}
                                                        placeholder="Add your comment..."
                                                        rows={4}
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleAddComment}
                                                    disabled={
                                                        processing ||
                                                        !data.comment ||
                                                        !data.step
                                                    }
                                                >
                                                    Add Comment
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Comment History */}
                                        {comments.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>
                                                        Comment History
                                                    </CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-4">
                                                    {comments.map((comment) => (
                                                        <div
                                                            key={comment.id}
                                                            className="rounded-lg border p-4"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="outline">
                                                                    {
                                                                        comment.step
                                                                    }
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(
                                                                        comment.created_at,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>

                                                            <p className="mt-2 text-sm">
                                                                {
                                                                    comment.comment
                                                                }
                                                            </p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                ) : (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <p className="text-muted-foreground">
                                                Select a project to review
                                            </p>
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
