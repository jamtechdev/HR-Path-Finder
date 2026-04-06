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
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState('');
    const [localQuestions, setLocalQuestions] = useState(questions);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

    // Update local questions when props change
    React.useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const filteredQuestions = localQuestions.filter((q) =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleDelete = (questionId: number) => {
        if (confirm(t('performance_snapshot_index.confirm_delete'))) {
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

        const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: idx + 1,
        }));

        setLocalQuestions(updatedQuestions);
        setDraggedIndex(null);

        router.post(
            '/admin/performance-snapshot/reorder',
            {
                questions: updatedQuestions.map((q) => ({
                    id: q.id,
                    order: q.order,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['questions'] }),
            },
        );
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
                    <Head title={t('performance_snapshot_index.page_title')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t(
                                        'performance_snapshot_index.header_title',
                                    )}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t(
                                        'performance_snapshot_index.header_description',
                                    )}
                                </p>
                            </div>
                            <Link href="/admin/performance-snapshot/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t(
                                        'performance_snapshot_index.add_question',
                                    )}
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {t(
                                            'performance_snapshot_index.questions_count',
                                            { count: filteredQuestions.length },
                                        )}
                                    </CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={t(
                                                'performance_snapshot_index.search_placeholder',
                                            )}
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
                                                                        {t(
                                                                            'performance_snapshot_index.inactive_badge',
                                                                        )}
                                                                    </Badge>
                                                                )}
                                                                <span className="text-xs text-muted-foreground">
                                                                    {t(
                                                                        'performance_snapshot_index.order_label',
                                                                    )}
                                                                    :{' '}
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
                                                                            {t(
                                                                                'performance_snapshot_index.options_label',
                                                                            )}{' '}
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
                                                                                    {t(
                                                                                        'performance_snapshot_index.more_options',
                                                                                        {
                                                                                            count:
                                                                                                question
                                                                                                    .options
                                                                                                    .length -
                                                                                                5,
                                                                                        },
                                                                                    )}
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
                                                ? t(
                                                      'performance_snapshot_index.no_questions_search',
                                                  )
                                                : t(
                                                      'performance_snapshot_index.no_questions',
                                                  )}
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
