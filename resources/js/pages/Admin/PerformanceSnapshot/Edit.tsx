import DynamicList from '@/components/Forms/DynamicList';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
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
    metadata?: any;
}

interface Props {
    question: PerformanceSnapshotQuestion;
    answerTypes: Record<string, string>;
}

export default function PerformanceSnapshotEdit({
    question,
    answerTypes,
}: Props) {
    const { t } = useTranslation();
    const [answerType, setAnswerType] = useState<string>(question.answer_type);
    const [options, setOptions] = useState<string[]>(question.options || []);

    const { data, setData, put, processing, errors } = useForm({
        question_text: question.question_text,
        answer_type: question.answer_type,
        options: question.options || [],
        order: question.order,
        is_active: question.is_active,
        version: question.version || '',
        metadata: question.metadata || null,
    });

    useEffect(() => {
        setData('answer_type', answerType);
        setData('options', options);
    }, [answerType, options]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/performance-snapshot/${question.id}`, {
            onSuccess: () => {
                router.visit('/admin/performance-snapshot');
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head
                        title={t(
                            'admin_performance_snapshot_question_edit.page_title',
                        )}
                    />
                    <div className="mx-auto max-w-4xl p-6 md:p-8">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    router.visit('/admin/performance-snapshot')
                                }
                                className="mb-4"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                {t(
                                    'admin_performance_snapshot_question_edit.back_to_questions',
                                )}
                            </Button>
                            <h1 className="text-3xl font-bold">
                                {t(
                                    'admin_performance_snapshot_question_edit.header_title',
                                )}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'admin_performance_snapshot_question_edit.question_details',
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>
                                            {t(
                                                'admin_performance_snapshot_question_edit.question_text',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) =>
                                                setData(
                                                    'question_text',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            required
                                            placeholder={t(
                                                'admin_performance_snapshot_question_edit.question_text_placeholder',
                                            )}
                                        />
                                        {errors.question_text && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.question_text}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>
                                            {t(
                                                'admin_performance_snapshot_question_edit.answer_type',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={answerType}
                                            onValueChange={setAnswerType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(
                                                    answerTypes,
                                                ).map(([key, label]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.answer_type && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.answer_type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>
                                            {t(
                                                'admin_performance_snapshot_question_edit.answer_options',
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <p className="mb-2 text-xs text-muted-foreground">
                                            {t(
                                                'admin_performance_snapshot_question_edit.answer_options_description',
                                            )}
                                        </p>
                                        <DynamicList
                                            label=""
                                            items={options}
                                            onChange={setOptions}
                                            placeholder={t(
                                                'admin_performance_snapshot_question_edit.option_placeholder',
                                            )}
                                            addLabel={t(
                                                'admin_performance_snapshot_question_edit.add_option',
                                            )}
                                        />
                                        {errors.options && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.options}
                                            </p>
                                        )}
                                        {options.length === 0 && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t(
                                                    'admin_performance_snapshot_question_edit.options_required',
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>
                                            {t(
                                                'admin_performance_snapshot_question_edit.order',
                                            )}
                                        </Label>
                                        <Input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) =>
                                                setData(
                                                    'order',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <Label>
                                            {t(
                                                'admin_performance_snapshot_question_edit.version_optional',
                                            )}
                                        </Label>
                                        <Input
                                            value={data.version}
                                            onChange={(e) =>
                                                setData(
                                                    'version',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={t(
                                                'admin_performance_snapshot_question_edit.version_placeholder',
                                            )}
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'admin_performance_snapshot_question_edit.version_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer"
                                        >
                                            {t(
                                                'admin_performance_snapshot_question_edit.is_active_label',
                                            )}
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(
                                            '/admin/performance-snapshot',
                                        )
                                    }
                                >
                                    {t(
                                        'admin_performance_snapshot_question_edit.cancel',
                                    )}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || options.length === 0
                                    }
                                >
                                    {t(
                                        'admin_performance_snapshot_question_edit.update_question',
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
