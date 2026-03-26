import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { toastCopy } from '@/lib/toastCopy';
import { toast } from '@/hooks/use-toast';

interface PerformanceSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'select_all_that_apply';
    options: string[];
    order: number;
    is_active: boolean;
    version?: string;
}

interface Props {
    questions: PerformanceSnapshotQuestion[];
    answerTypes: Record<string, string>;
}

export default function PerformanceSnapshotIndex({
    questions,
    answerTypes,
}: Props) {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
        }

        if (flash?.error) {
            toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
        }
    }, [flash]);

    const [searchTerm, setSearchTerm] = useState('');
    const [localQuestions, setLocalQuestions] = useState(questions);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Update local questions when props change
    React.useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const filteredQuestions = localQuestions.filter((q) =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleDelete = (questionId: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(`/admin/performance-snapshot/${questionId}`, {
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

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newQuestions = [...localQuestions];
        const [removed] = newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(dropIndex, 0, removed);

        // Update order values
        const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: idx + 1,
        }));

        setLocalQuestions(updatedQuestions);
        setDraggedIndex(null);

        // Save new order to backend
        router.post(
            '/admin/performance-snapshot/reorder',
            {
                questions: updatedQuestions.map((q, idx) => ({
                    id: q.id,
                    order: idx + 1,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Reload to get updated data
                    router.reload({ only: ['questions'] });
                },
            },
        );
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
                    <Head title="Performance Snapshot Questions Management" />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    Performance Snapshot Questions
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage all questions for the Strategic
                                    Performance Snapshot (Stage 4-1)
                                </p>
                            </div>
                            <Link href="/admin/performance-snapshot/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Question
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Questions ({filteredQuestions.length})
                                    </CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search questions..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {filteredQuestions.map(
                                        (question, index) => {
                                            const originalIndex =
                                                localQuestions.findIndex(
                                                    (q) => q.id === question.id,
                                                );
                                            return (
                                                <div
                                                    key={question.id}
                                                    draggable
                                                    onDragStart={(e) =>
                                                        handleDragStart(
                                                            e,
                                                            originalIndex,
                                                        )
                                                    }
                                                    onDragOver={(e) =>
                                                        handleDragOver(
                                                            e,
                                                            originalIndex,
                                                        )
                                                    }
                                                    onDragLeave={
                                                        handleDragLeave
                                                    }
                                                    onDrop={(e) =>
                                                        handleDrop(
                                                            e,
                                                            originalIndex,
                                                        )
                                                    }
                                                    className={`flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                                                        dragOverIndex ===
                                                        originalIndex
                                                            ? 'border-primary bg-primary/10'
                                                            : ''
                                                    } ${draggedIndex === originalIndex ? 'opacity-50' : ''}`}
                                                >
                                                    <div className="flex flex-1 items-start gap-3">
                                                        <GripVertical className="mt-1 h-5 w-5 cursor-move text-muted-foreground" />
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <Badge variant="outline">
                                                                    {getAnswerTypeLabel(
                                                                        question.answer_type,
                                                                    )}
                                                                </Badge>
                                                                {question.version && (
                                                                    <Badge variant="secondary">
                                                                        v
                                                                        {
                                                                            question.version
                                                                        }
                                                                    </Badge>
                                                                )}
                                                                {!question.is_active && (
                                                                    <Badge variant="destructive">
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                                <span className="text-xs text-muted-foreground">
                                                                    Order:{' '}
                                                                    {
                                                                        question.order
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="mb-2 text-sm font-medium">
                                                                {
                                                                    question.question_text
                                                                }
                                                            </p>
                                                            {question.options &&
                                                                question.options
                                                                    .length >
                                                                    0 && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        <span className="font-medium">
                                                                            Options
                                                                            (
                                                                            {
                                                                                question
                                                                                    .options
                                                                                    .length
                                                                            }
                                                                            ):
                                                                        </span>
                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                            {question.options
                                                                                .slice(
                                                                                    0,
                                                                                    5,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        option,
                                                                                        idx,
                                                                                    ) => (
                                                                                        <Badge
                                                                                            key={
                                                                                                idx
                                                                                            }
                                                                                            variant="outline"
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {
                                                                                                option
                                                                                            }
                                                                                        </Badge>
                                                                                    ),
                                                                                )}
                                                                            {question
                                                                                .options
                                                                                .length >
                                                                                5 && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs"
                                                                                >
                                                                                    +
                                                                                    {question
                                                                                        .options
                                                                                        .length -
                                                                                        5}{' '}
                                                                                    more
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/performance-snapshot/${question.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    question.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                    {filteredQuestions.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            {searchTerm
                                                ? 'No questions found matching your search.'
                                                : 'No questions found. Create your first question!'}
                                        </p>
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
