import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { toastCopy } from '@/lib/toastCopy';

interface PolicySnapshotQuestion {
    id: number;
    question_text: string;
    order: number;
    is_active: boolean;
    has_conditional_text: boolean;
}

interface Props {
    questions: PolicySnapshotQuestion[];
}

export default function PolicySnapshotIndex({ questions }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;

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

    const handleDelete = (questionId: number) => {
        if (confirm(t('admin_policy_snapshot_index.delete_confirm'))) {
            router.delete(`/admin/policy-snapshot/${questionId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarProvider defaultOpen>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />

                <main className="flex-1 overflow-auto bg-background">
                    <Head title={t('admin_policy_snapshot_index.page_title')} />

                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t(
                                        'admin_policy_snapshot_index.page_title',
                                    )}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t(
                                        'admin_policy_snapshot_index.description',
                                    )}
                                </p>
                            </div>

                            <Link href="/admin/policy-snapshot/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t(
                                        'admin_policy_snapshot_index.add_question',
                                    )}
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('admin_policy_snapshot_index.questions')}
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-2">
                                    {questions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    {question.has_conditional_text && (
                                                        <Badge variant="outline">
                                                            {t(
                                                                'admin_policy_snapshot_index.has_conditional_text',
                                                            )}
                                                        </Badge>
                                                    )}
                                                    {!question.is_active && (
                                                        <Badge variant="destructive">
                                                            {t(
                                                                'admin_policy_snapshot_index.inactive',
                                                            )}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm">
                                                    {question.question_text}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {t(
                                                        'admin_policy_snapshot_index.order',
                                                    )}
                                                    : {question.order}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/policy-snapshot/${question.id}/edit`}
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

                                    {questions.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            {t(
                                                'admin_policy_snapshot_index.no_questions_found',
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
