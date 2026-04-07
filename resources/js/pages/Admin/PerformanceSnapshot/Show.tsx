import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Edit } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

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
    const { t } = useTranslation();
    const getAnswerTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            select_one: t('admin_perf_snapshot_detail.type_select_one'),
            select_up_to_2: t('admin_perf_snapshot_detail.type_select_up_to_2'),
            select_all_that_apply: t('admin_perf_snapshot_detail.type_select_all'),
        };
        return labels[type] || type;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_misc_page_titles.performance_snapshot_show')} />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/performance-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t('admin_perf_snapshot_detail.back_to_questions')}
                            </Button>
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold">
                                    {t('admin_perf_snapshot_detail.question_heading')}
                                </h1>
                                <Link href={`/admin/performance-snapshot/${question.id}/edit`}>
                                    <Button>
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('admin_perf_snapshot_detail.edit_question')}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_perf_snapshot_detail.question_info')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('admin_perf_snapshot_detail.question_text')}
                                    </label>
                                    <p className="mt-1 text-base">{question.question_text}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('admin_perf_snapshot_detail.answer_type')}
                                    </label>
                                    <div className="mt-1">
                                        <Badge variant="outline">{getAnswerTypeLabel(question.answer_type)}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('admin_perf_snapshot_detail.answer_options')}
                                    </label>
                                    <div className="mt-2 space-y-1">
                                        {question.options && question.options.length > 0 ? (
                                            question.options.map((option, idx) => (
                                                <div key={idx} className="p-2 border rounded bg-muted/50">
                                                    {idx + 1}. {option}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {t('admin_perf_snapshot_detail.no_options')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('admin_perf_snapshot_detail.order')}
                                        </label>
                                        <p className="mt-1">{question.order}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('admin_perf_snapshot_detail.status')}
                                        </label>
                                        <div className="mt-1">
                                            {question.is_active ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    {t('admin_perf_snapshot_detail.active')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    {t('admin_perf_snapshot_detail.inactive')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {question.version && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('admin_perf_snapshot_detail.version')}
                                        </label>
                                        <p className="mt-1">{question.version}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('admin_perf_snapshot_detail.created_at')}
                                        </label>
                                        <p className="mt-1 text-sm">
                                            {new Date(question.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('admin_perf_snapshot_detail.updated_at')}
                                        </label>
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
