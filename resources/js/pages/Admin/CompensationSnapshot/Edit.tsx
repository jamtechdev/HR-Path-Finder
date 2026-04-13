import DynamicList from '@/components/Forms/DynamicList';
import AdminLayout from '@/layouts/AdminLayout';
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
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
    is_active: boolean;
    version?: string;
    metadata?: any;
}

interface Props {
    question: CompensationSnapshotQuestion;
    answerTypes: Record<string, string>;
}

export default function CompensationSnapshotEdit({ question, answerTypes }: Props) {
    const { t } = useTranslation();

    const [answerType, setAnswerType] = useState<string>(question.answer_type ?? 'select_one');
    const [options, setOptions] = useState<string[]>(question.options || []);
    const [explanation, setExplanation] = useState<string>(question.metadata?.explanation || '');

    const { data, setData, put, processing, errors } = useForm({
        question_text: question.question_text ?? '',
        answer_type: question.answer_type ?? 'select_one',
        options: question.options || [],
        order: question.order ?? 0,
        is_active: question.is_active ?? true,
        version: question.version || '',
        metadata: question.metadata || null,
    });

    useEffect(() => {
        setData('answer_type', answerType as any);
        if (['select_one', 'select_up_to_2', 'multiple'].includes(answerType)) {
            setData('options', options);
        } else {
            setData('options', []);
        }
        setData('metadata', explanation ? { explanation } : null);
    }, [answerType, options, explanation]);

    const requiresOptions = ['select_one', 'select_up_to_2', 'multiple'].includes(answerType);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/compensation-snapshot/${question.id}`);
    };

    return (
        <AdminLayout>
            <Head title={t('admin_misc_page_titles.compensation_snapshot_edit')} />
            <div className="mx-auto max-w-4xl p-6 md:p-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/admin/compensation-snapshot')}
                        className="mb-4"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        {t('buttons.back_to_questions')}
                    </Button>
                    <h1 className="text-3xl font-bold">
                        {t('compensation_snapshot.edit_question')}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>
                                    {t('compensation_snapshot.question_text')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    value={data.question_text}
                                    onChange={(e) => setData('question_text', e.target.value)}
                                    rows={3}
                                    required
                                />
                                {errors.question_text && (
                                    <p className="mt-1 text-sm text-destructive">{errors.question_text}</p>
                                )}
                            </div>

                            <div>
                                <Label>
                                    {t('compensation_snapshot.answer_type')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={answerType}
                                    onValueChange={(value) => setAnswerType(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(answerTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.answer_type && (
                                    <p className="mt-1 text-sm text-destructive">{errors.answer_type}</p>
                                )}
                            </div>

                            {requiresOptions && (
                                <div>
                                    <Label>
                                        {t('compensation_snapshot.answer_options')}{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <p className="mb-2 text-xs text-muted-foreground">
                                        Add all possible answer options for this question
                                    </p>
                                    <DynamicList
                                        label=""
                                        items={options}
                                        onChange={(next) => setOptions(next)}
                                        placeholder={t('compensation_snapshot.enter_option')}
                                        addLabel={t('compensation_snapshot.add_option')}
                                    />
                                    {errors.options && (
                                        <p className="mt-1 text-sm text-destructive">{errors.options}</p>
                                    )}
                                </div>
                            )}

                            {!requiresOptions && (
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t(answerType === 'numeric'
                                            ? 'compensation_snapshot.numeric_info'
                                            : 'compensation_snapshot.text_info'
                                        )}
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label>{t('compensation_snapshot.version_optional')}</Label>
                                <Input
                                    value={data.version}
                                    onChange={(e) => setData('version', e.target.value)}
                                    placeholder="e.g., 1.0, 2.0"
                                />
                            </div>

                            <div>
                                <Label>{t('compensation_snapshot.explanation_optional')}</Label>
                                <Textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    rows={4}
                                    placeholder={t('compensation_snapshot.explanation_placeholder')}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    {t('compensation_snapshot.active')}
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/admin/compensation-snapshot')}
                        >
                            {t('buttons.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || (requiresOptions && options.length === 0)}
                        >
                            {processing ? t('buttons.updating') : t('buttons.update_question')}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
