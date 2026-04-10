import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';

interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
    is_active: boolean;
    version?: string;
    created_at?: string | null;
}

interface PaginatedQuestions {
    data: CompensationSnapshotQuestion[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    questions: PaginatedQuestions;
    answerTypes: Record<string, string>;
}

export default function CompensationSnapshotIndex({ questions, answerTypes }: Props) {
    const formatRelativeTime = (value?: string | null) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';

        const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
        const absSeconds = Math.abs(diffSeconds);
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        if (absSeconds < 60) return rtf.format(diffSeconds, 'second');
        const diffMinutes = Math.round(diffSeconds / 60);
        if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
        const diffHours = Math.round(diffMinutes / 60);
        if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
        const diffDays = Math.round(diffHours / 24);
        if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
        const diffMonths = Math.round(diffDays / 30);
        if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
        const diffYears = Math.round(diffMonths / 12);
        return rtf.format(diffYears, 'year');
    };

    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [localQuestions, setLocalQuestions] = useState(questions.data);

    useEffect(() => {
        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
        }
        if (flash?.error) {
            toast({
                title: toastCopy.error,
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash]);

    React.useEffect(() => {
        setLocalQuestions(questions.data);
    }, [questions]);

    const filteredQuestions = localQuestions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (questionId: number) => {
        if (confirm(t('compensation_snapshot_index.confirm_delete'))) {
            router.delete(`/admin/compensation-snapshot/${questionId}`, {
                preserveScroll: true,
            });
        }
    };

    const getAnswerTypeLabel = (type: string) => answerTypes[type] || type;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('compensation_snapshot_index.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">
                                    {t('compensation_snapshot_index.header_title')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('compensation_snapshot_index.header_description')}
                                </p>
                            </div>
                            <Link href="/admin/compensation-snapshot/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('compensation_snapshot_index.add_question')}
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {t('compensation_snapshot_index.questions_count', { count: questions.total })}
                                    </CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={t('compensation_snapshot_index.search_placeholder')}
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {filteredQuestions.map((question, index) => {
                                        return (
                                            <div
                                                key={question.id}
                                                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline">{getAnswerTypeLabel(question.answer_type)}</Badge>
                                                            {question.version && <Badge variant="secondary">v{question.version}</Badge>}
                                                            {!question.is_active && <Badge variant="destructive">{t('compensation_snapshot_index.inactive')}</Badge>}
                                                        </div>
                                                        <p className="font-medium mb-1">{question.question_text}</p>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Created: {formatRelativeTime(question.created_at)}
                                                        </p>
                                                        {question.options?.length > 0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {t('compensation_snapshot_index.options')}: {question.options.join(', ')}
                                                            </p>
                                                        )}
                                                        {(question.answer_type === 'numeric' || question.answer_type === 'text') && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {question.answer_type === 'numeric'
                                                                    ? t('compensation_snapshot_index.numeric_input')
                                                                    : t('compensation_snapshot_index.text_input')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/compensation-snapshot/${question.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete(question.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredQuestions.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {searchTerm
                                                ? t('compensation_snapshot_index.no_search_results')
                                                : t('compensation_snapshot_index.no_questions')}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t('compensation_snapshot_index.page_info', { current: questions.current_page, last: questions.last_page, perPage: questions.per_page })}
                                    </p>
                                    {searchTerm.trim() && <p className="text-xs text-muted-foreground">{t('compensation_snapshot_index.no_search_results')}</p>}
                                </div>
                                {questions && (questions.last_page > 1 || questions.prev_page_url || questions.next_page_url) && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {questions.prev_page_url && (
                                            <Link href={questions.prev_page_url} className="rounded border px-3 py-1 hover:bg-muted">
                                                Previous
                                            </Link>
                                        )}
                                        {questions.next_page_url && (
                                            <Link href={questions.next_page_url} className="rounded border px-3 py-1 hover:bg-muted">
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}