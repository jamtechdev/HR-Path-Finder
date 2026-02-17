import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Edit } from 'lucide-react';

interface PerformanceSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'select_all_that_apply';
    options: string[];
    order: number;
    is_active: boolean;
    version?: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
}

interface Props {
    question: PerformanceSnapshotQuestion;
}

export default function PerformanceSnapshotShow({ question }: Props) {
    const getAnswerTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'select_one': 'Select One',
            'select_up_to_2': 'Select up to 2',
            'select_all_that_apply': 'Select all that apply',
        };
        return labels[type] || type;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Performance Snapshot Question Details" />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/performance-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Questions
                            </Button>
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold">Question Details</h1>
                                <Link href={`/admin/performance-snapshot/${question.id}/edit`}>
                                    <Button>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Question
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Question Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Question Text</label>
                                    <p className="mt-1 text-base">{question.question_text}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Answer Type</label>
                                    <div className="mt-1">
                                        <Badge variant="outline">{getAnswerTypeLabel(question.answer_type)}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Answer Options</label>
                                    <div className="mt-2 space-y-1">
                                        {question.options && question.options.length > 0 ? (
                                            question.options.map((option, idx) => (
                                                <div key={idx} className="p-2 border rounded bg-muted/50">
                                                    {idx + 1}. {option}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No options defined</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order</label>
                                        <p className="mt-1">{question.order}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">
                                            {question.is_active ? (
                                                <Badge variant="default" className="bg-green-500">Active</Badge>
                                            ) : (
                                                <Badge variant="destructive">Inactive</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {question.version && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Version</label>
                                        <p className="mt-1">{question.version}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                        <p className="mt-1 text-sm">
                                            {new Date(question.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                                        <p className="mt-1 text-sm">
                                            {new Date(question.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
