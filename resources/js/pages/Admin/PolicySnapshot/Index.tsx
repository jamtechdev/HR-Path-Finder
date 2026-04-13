import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AdminLayout from '@/layouts/AdminLayout';
import AdminPagination from '@/components/Admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PolicySnapshotQuestion {
    id: number;
    question_text: string;
    order: number;
    is_active: boolean;
    has_conditional_text: boolean;
    created_at?: string | null;
}

interface Props {
    questions: {
        data: PolicySnapshotQuestion[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function PolicySnapshotIndex({ questions }: Props) {
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

    const handleDelete = (questionId: number) => {
        if (confirm(t('admin_policy_snapshot_index.delete_confirm'))) {
            router.delete(`/admin/policy-snapshot/${questionId}`);
        }
    };

    return (
        <AdminLayout>
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
                                    {questions.data.map((question) => (
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
                                                    Created: {formatRelativeTime(question.created_at)}
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

                                    {questions.data.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            {t(
                                                'admin_policy_snapshot_index.no_questions_found',
                                            )}
                                        </p>
                                    )}
                                </div>
                                <AdminPagination links={questions.links} />
                            </CardContent>
                        </Card>
                    </div>
        </AdminLayout>
    );
}
