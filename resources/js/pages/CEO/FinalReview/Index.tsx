import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X } from 'lucide-react';

interface AdminComment {
    id: number;
    comment: string;
    created_at: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
        step_statuses?: Record<string, string>;
    };
    adminComments?: AdminComment[];
}

export default function CeoFinalReview({ project, adminComments = [] }: Props) {
    const { post, processing } = useForm({});

    const handleApprove = () => {
        post(`/ceo/final-review/${project.id}/approve`, {
            onSuccess: () => {
                // Success
            },
        });
    };

    const handleRequestRevisions = () => {
        post(`/ceo/final-review/${project.id}/request-revisions`, {
            onSuccess: () => {
                // Success
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Final Review - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Final Review</h1>
                            <p className="text-muted-foreground">Review all steps and admin comments before final approval.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Step Status Cards */}
                            {['diagnosis', 'organization', 'performance', 'compensation'].map((step) => (
                                <Card key={step}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="capitalize">{step}</CardTitle>
                                            <Badge>
                                                {project.step_statuses?.[step] || 'not_started'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">Step details...</p>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Admin Comments */}
                            {adminComments.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Admin Comments</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {adminComments.map((comment) => (
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

                            {/* Actions */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Ready to Approve?</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Review all steps and approve to lock the HR system.
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={handleRequestRevisions}
                                                disabled={processing}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Request Revisions
                                            </Button>
                                            <Button
                                                onClick={handleApprove}
                                                disabled={processing}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Approve & Lock
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
