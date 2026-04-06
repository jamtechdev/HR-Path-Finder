import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, GripVertical } from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
    is_active: boolean;
    version?: string;
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
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [localQuestions, setLocalQuestions] = useState(questions.data);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => setDragOverIndex(null);

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (searchTerm.trim()) return;
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newQuestions = [...localQuestions];
        const [removed] = newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(dropIndex, 0, removed);

        const pageOffset = (questions.current_page - 1) * questions.per_page;
        const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: pageOffset + idx + 1,
        }));

        setLocalQuestions(updatedQuestions);
        setDraggedIndex(null);

        router.post('/admin/compensation-snapshot/reorder', {
            questions: updatedQuestions.map((q, idx) => ({
                id: q.id,
                order: pageOffset + idx + 1,
            })),
        }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['questions'] }),
        });
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
                                        const originalIndex = localQuestions.findIndex(q => q.id === question.id);
                                        return (
                                            <div
                                                key={question.id}
                                                draggable={!searchTerm.trim()}
                                                onDragStart={e => handleDragStart(e, originalIndex)}
                                                onDragOver={e => handleDragOver(e, originalIndex)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={e => handleDrop(e, originalIndex)}
                                                className={`flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                                                    dragOverIndex === originalIndex ? 'bg-primary/10 border-primary' : ''
                                                } ${draggedIndex === originalIndex ? 'opacity-50' : ''}`}
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline">{getAnswerTypeLabel(question.answer_type)}</Badge>
                                                            {question.version && <Badge variant="secondary">v{question.version}</Badge>}
                                                            {!question.is_active && <Badge variant="destructive">{t('compensation_snapshot_index.inactive')}</Badge>}
                                                        </div>
                                                        <p className="font-medium mb-1">{question.question_text}</p>
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
                                    {searchTerm.trim() && (
                                        <p className="text-xs text-muted-foreground">{t('compensation_snapshot_index.clear_search_reorder')}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}