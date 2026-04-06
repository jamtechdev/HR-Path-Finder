import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';

interface DiagnosisQuestion {
    id: number;
    category: string;
    question_text: string;
    question_type: string;
    order: number;
    is_active: boolean;
}

interface Props {
    questions: DiagnosisQuestion[];
    categories: Record<string, string>;
    currentCategory?: string;
}

export default function CEOQuestionsIndex({
    questions,
    categories,
    currentCategory,
}: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const { flash } = usePage().props as any;
    const toastShown = useRef(false);

    useEffect(() => {
        if (toastShown.current) return;

        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
            toastShown.current = true;
        }

        if (flash?.error) {
            toast({
                title: toastCopy.error,
                description: flash.error,
                variant: 'destructive',
            });
            toastShown.current = true;
        }
    }, [flash]);

    const filteredQuestions = questions.filter((q) =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleDelete = (questionId: number) => {
        if (confirm(t('admin_ceo_questions.delete_confirm'))) {
            router.delete(`/admin/questions/ceo/${questionId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_ceo_questions.page_title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t('admin_ceo_questions.page_title')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('admin_ceo_questions.page_subtitle')}
                                </p>
                            </div>

                            <Link href="/admin/questions/ceo/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin_ceo_questions.add_question')}
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {t('admin_ceo_questions.questions')}
                                    </CardTitle>

                                    <div className="flex items-center gap-4">
                                        <Select
                                            value={currentCategory || 'all'}
                                            onValueChange={(value) => {
                                                router.visit(
                                                    value === 'all'
                                                        ? '/admin/questions/ceo'
                                                        : `/admin/questions/ceo?category=${value}`,
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-64">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="all">
                                                    {t(
                                                        'admin_ceo_questions.all_categories',
                                                    )}
                                                </SelectItem>

                                                {Object.entries(categories).map(
                                                    ([key, label]) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <div className="relative w-64">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />

                                            <Input
                                                placeholder={t(
                                                    'admin_ceo_questions.search_placeholder',
                                                )}
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-8"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-2">
                                    {filteredQuestions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {categories[
                                                            question.category
                                                        ] || question.category}
                                                    </Badge>

                                                    <Badge variant="secondary">
                                                        {question.question_type}
                                                    </Badge>

                                                    {!question.is_active && (
                                                        <Badge variant="destructive">
                                                            {t(
                                                                'admin_ceo_questions.inactive',
                                                            )}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-sm">
                                                    {question.question_text}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {t(
                                                        'admin_ceo_questions.order',
                                                    )}
                                                    : {question.order}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/questions/ceo/${question.id}/edit`}
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
                                    ))}

                                    {filteredQuestions.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            {t(
                                                'admin_ceo_questions.no_questions_found',
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
