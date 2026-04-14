import AdminLayout from '@/layouts/AdminLayout';
import AdminPagination from '@/components/Admin/AdminPagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PerformanceSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'select_all_that_apply';
    options: string[];
    order: number;
    is_active: boolean;
    version?: string;
    created_at?: string | null;
}

interface Props {
    questions: {
        data: PerformanceSnapshotQuestion[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    answerTypes: Record<string, string>;
}

export default function PerformanceSnapshotIndex({
    questions,
    answerTypes,
}: Props) {
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

    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [localQuestions, setLocalQuestions] = useState(questions.data);

    // Update local questions when props change
    React.useEffect(() => {
        setLocalQuestions(questions.data);
    }, [questions]);

    const normalizeText = (value: unknown): string => {
        if (value == null) return '';
        const lang = (i18n.resolvedLanguage ?? i18n.language ?? 'en')
            .toLowerCase()
            .startsWith('ko')
            ? 'ko'
            : 'en';

        const pickFromObject = (obj: Record<string, unknown>): string => {
            const commonTextKeys = [
                'label',
                'name',
                'title',
                'text',
                'value',
                'question_text',
            ] as const;
            for (const key of commonTextKeys) {
                if (typeof obj[key] === 'string' && String(obj[key]).trim()) {
                    return String(obj[key]);
                }
            }
            const preferred =
                typeof obj[lang] === 'string'
                    ? (obj[lang] as string)
                    : typeof obj.en === 'string'
                      ? (obj.en as string)
                      : typeof obj.ko === 'string'
                        ? (obj.ko as string)
                        : '';
            if (preferred) return preferred;
            return JSON.stringify(obj);
        };

        if (Array.isArray(value)) {
            return value.map((v) => normalizeText(v)).filter(Boolean).join(', ');
        }

        if (typeof value === 'object') {
            return pickFromObject(value as Record<string, unknown>);
        }

        const str = String(value);
        const trimmed = str.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === 'object') {
                    return pickFromObject(parsed as Record<string, unknown>);
                }
            } catch {
                // keep original string
            }
        }
        return str;
    };

    const normalizeOptions = (value: unknown): string[] => {
        if (Array.isArray(value))
            return value.map((v) => normalizeText(v)).filter(Boolean);
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed))
                        return parsed.map((v) => normalizeText(v)).filter(Boolean);
                } catch {
                    // fall through
                }
            }
        }
        return [];
    };

    const filteredQuestions = localQuestions.filter((q) =>
        normalizeText(q.question_text)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    );

    const handleDelete = (questionId: number) => {
        if (confirm(t('performance_snapshot_index.confirm_delete'))) {
            router.delete(`/admin/performance-snapshot/${questionId}`);
        }
    };

    const getAnswerTypeLabel = (type: string) => answerTypes[type] || type;

    return (
        <AdminLayout>
            <Head title={t('performance_snapshot_index.page_title')} />
            <div className="mx-auto max-w-7xl p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-6">
                    <div>
                        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">
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
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                            <CardTitle className="flex-1">
                                {t(
                                    'performance_snapshot_index.questions_count',
                                    { count: filteredQuestions.length },
                                )}
                            </CardTitle>
                            <div className="relative w-full max-w-md lg:w-64">
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
                                            const normalizedOptions =
                                                normalizeOptions(
                                                    question.options,
                                                );
                                            return (
                                                <div
                                                    key={question.id}
                                                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="flex flex-1 items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-2 flex flex-wrap items-center gap-2">
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
                                                            </div>
                                                            <p className="mb-2 text-sm font-medium break-words">
                                                                {normalizeText(
                                                                    question.question_text,
                                                                )}
                                                            </p>
                                                            <p className="mb-2 text-xs text-muted-foreground">
                                                                Created: {formatRelativeTime(question.created_at)}
                                                            </p>
                                                            {normalizedOptions.length >
                                                                0 && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        <span className="font-medium">
                                                                            {t(
                                                                                'performance_snapshot_index.options_label',
                                                                            )}{' '}
                                                                            (
                                                                            {normalizedOptions.length}
                                                                            ):
                                                                        </span>
                                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                                            {normalizedOptions
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
                                                                            {normalizedOptions.length >
                                                                                5 && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {t(
                                                                                        'performance_snapshot_index.more_options',
                                                                                        {
                                                                                            count:
                                                                                                normalizedOptions.length -
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
                                                    <div className="mt-2 sm:mt-0 sm:ml-4 flex shrink-0 items-center gap-2">
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
                                <AdminPagination links={questions.links} />
                            </CardContent>
                        </Card>
                    </div>
        </AdminLayout>
    );
}
