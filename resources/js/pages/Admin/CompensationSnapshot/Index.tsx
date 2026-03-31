import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, GripVertical } from 'lucide-react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [localQuestions, setLocalQuestions] = useState(questions.data);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Update local questions when props change
    React.useEffect(() => {
        setLocalQuestions(questions.data);
    }, [questions]);

    const filteredQuestions = localQuestions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (questionId: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
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

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (searchTerm.trim().length > 0) {
            setDraggedIndex(null);
            return;
        }

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newQuestions = [...localQuestions];
        const [removed] = newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(dropIndex, 0, removed);

        // Update order values
        const pageOffset = (questions.current_page - 1) * questions.per_page;
        const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: pageOffset + idx + 1,
        }));

        setLocalQuestions(updatedQuestions);
        setDraggedIndex(null);

        // Save new order to backend
        router.post('/admin/compensation-snapshot/reorder', {
            questions: updatedQuestions.map((q, idx) => ({
                id: q.id,
                order: pageOffset + idx + 1,
            })),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Reload to get updated data
                router.reload({ only: ['questions'] });
            },
        });
    };

    const getAnswerTypeLabel = (type: string) => {
        return answerTypes[type] || type;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Compensation Snapshot Questions Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">Compensation Snapshot Questions</h1>
                                <p className="text-muted-foreground">
                                    Manage all questions for the Strategic Compensation Snapshot (Stage 4-1)
                                </p>
                            </div>
                            <Link href="/admin/compensation-snapshot/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Questions ({questions.total})</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search questions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                            draggable={searchTerm.trim().length === 0}
                                            onDragStart={(e) => handleDragStart(e, originalIndex)}
                                            onDragOver={(e) => handleDragOver(e, originalIndex)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, originalIndex)}
                                            className={`flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                                                dragOverIndex === originalIndex ? 'bg-primary/10 border-primary' : ''
                                            } ${draggedIndex === originalIndex ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex items-start gap-3 flex-1">
                                                <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">
                                                            {getAnswerTypeLabel(question.answer_type)}
                                                        </Badge>
                                                        {question.version && (
                                                            <Badge variant="secondary">v{question.version}</Badge>
                                                        )}
                                                        {!question.is_active && (
                                                            <Badge variant="destructive">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-medium mb-1">{question.question_text}</p>
                                                    {question.options && question.options.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                Options: {question.options.join(', ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(question.answer_type === 'numeric' || question.answer_type === 'text') && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {question.answer_type === 'numeric' ? 'Numeric input (KRW amounts, percentages)' : 'Text input'}
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(question.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )})}
                                    {filteredQuestions.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {searchTerm ? 'No questions found matching your search.' : 'No questions configured yet.'}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Page {questions.current_page} of {questions.last_page} (10 per page)
                                    </p>
                                    {searchTerm.trim().length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Clear search to enable drag reorder.
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!questions.prev_page_url}
                                            onClick={() => {
                                                if (!questions.prev_page_url) return;
                                                router.get(questions.prev_page_url, {}, { preserveScroll: true });
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!questions.next_page_url}
                                            onClick={() => {
                                                if (!questions.next_page_url) return;
                                                router.get(questions.next_page_url, {}, { preserveScroll: true });
                                            }}
                                        >
                                            Next
                                        </Button>
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
