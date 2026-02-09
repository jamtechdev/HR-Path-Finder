import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Project {
    id: number;
    company: {
        name: string;
    };
    step_statuses?: Record<string, string>;
}

interface AdminComment {
    id: number;
    comment: string;
    created_at: string;
}

interface Props {
    project: Project;
    projects?: Project[];
    comments?: AdminComment[];
}

export default function AdminReview({ project, projects = [], comments = [] }: Props) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(project?.id || null);
    const { data, setData, post, processing } = useForm({
        comment: '',
    });

    const handleAddComment = () => {
        if (selectedProjectId) {
            post(`/admin/review/${selectedProjectId}/comment`, {
                onSuccess: () => {
                    setData('comment', '');
                },
            });
        }
    };

    const selectedProject = project || projects.find(p => p.id === selectedProjectId);

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Admin Review" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Admin Review</h1>
                            <p className="text-muted-foreground">Review projects and add comments.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Project List */}
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
                                                className={`block p-3 border rounded-lg hover:bg-muted ${
                                                    p.id === selectedProjectId ? 'bg-muted' : ''
                                                }`}
                                            >
                                                <div className="font-medium">{p.company.name}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {Object.keys(p.step_statuses || {}).length} steps
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Project Details & Comments */}
                            <div className="lg:col-span-2 space-y-6">
                                {selectedProject ? (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle>{selectedProject.company.name}</CardTitle>
                                                    <Badge>Active</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Project details...</p>
                                                    {/* Display step statuses */}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Add Comment</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label htmlFor="comment">Comment</Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={data.comment}
                                                        onChange={(e) => setData('comment', e.target.value)}
                                                        placeholder="Add your comment..."
                                                        rows={4}
                                                    />
                                                </div>
                                                <Button onClick={handleAddComment} disabled={processing || !data.comment}>
                                                    Add Comment
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {comments.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Comment History</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {comments.map((comment) => (
                                                        <div key={comment.id} className="p-4 border rounded-lg">
                                                            <p className="text-sm">{comment.comment}</p>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                {new Date(comment.created_at).toLocaleDateString()}
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
                                            <p className="text-muted-foreground">Select a project to review</p>
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
