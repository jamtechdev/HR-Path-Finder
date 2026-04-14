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
    answer_type:
        | 'select_one'
        | 'select_up_to_2'
        | 'multiple'
        | 'numeric'
        | 'numeric_multi_year'
        | 'numeric_job_rows'
        | 'numeric_service_ranges'
        | 'text';
    options?: string[] | null;
    order: number;
    is_active: boolean;
    version?: string;
    metadata?: any;
}

interface Props {
    question: CompensationSnapshotQuestion;
    answerTypes: Record<string, string>;
    parentQuestionCandidates: Array<{ id: number; order: number; label: string }>;
}

const parseCsv = (value: string): string[] =>
    value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

const formatCsv = (value: unknown): string =>
    Array.isArray(value) ? value.map((v) => String(v)).join(', ') : '';

const parseServiceRanges = (value: string): Array<{ label: string; key: string }> =>
    value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
            const [label, key] = line.split('|').map((s) => s.trim());
            if (!label || !key) return null;
            return { label, key };
        })
        .filter((entry): entry is { label: string; key: string } => entry !== null);

const formatServiceRanges = (value: unknown): string =>
    Array.isArray(value)
        ? value
              .map((entry) => {
                  if (!entry || typeof entry !== 'object') return null;
                  const label = (entry as any).label;
                  const key = (entry as any).key;
                  if (!label || !key) return null;
                  return `${label}|${key}`;
              })
              .filter((line): line is string => line !== null)
              .join('\n')
        : '';

export default function CompensationSnapshotEdit({ question, answerTypes, parentQuestionCandidates }: Props) {
    const { t } = useTranslation();

    const [answerType, setAnswerType] = useState<string>(question.answer_type ?? 'select_one');
    const [options, setOptions] = useState<string[]>(question.options || []);
    const [showAdditionalSettings, setShowAdditionalSettings] = useState<boolean>(
        Boolean(question.version || question.metadata?.explanation)
    );
    const [explanation, setExplanation] = useState<string>(question.metadata?.explanation || '');
    const [enableSubQuestion, setEnableSubQuestion] = useState<boolean>(
        typeof question.metadata?.parent_question_order === 'number'
    );
    const [parentQuestionOrder, setParentQuestionOrder] = useState<string>(
        question.metadata?.parent_question_order ? String(question.metadata.parent_question_order) : 'none'
    );
    const [showWhenParentAnswered, setShowWhenParentAnswered] = useState<boolean>(
        question.metadata?.show_when_parent_answered !== false
    );
    const [showWhenParentOptionIncludes, setShowWhenParentOptionIncludes] = useState<string>(
        question.metadata?.show_when_parent_option_includes || ''
    );
    const [unit, setUnit] = useState<string>(question.metadata?.unit || '');
    const [autoPopulateTo, setAutoPopulateTo] = useState<string>(question.metadata?.auto_populate_to || '');
    const [yearsCsv, setYearsCsv] = useState<string>(formatCsv(question.metadata?.years) || '2023, 2024, 2025');
    const [defaultFunctionsCsv, setDefaultFunctionsCsv] = useState<string>(
        formatCsv(question.metadata?.default_functions) || 'Overall, Management, R&D, Sales & Marketing, Production'
    );
    const [serviceRangesText, setServiceRangesText] = useState<string>(
        formatServiceRanges(question.metadata?.service_ranges) ||
            'Overall|overall\n1-3 years|1_3\n4-7 years|4_7\n8-12 years|8_12\n13-17 years|13_17\n18-20 years|18_20'
    );

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
        const metadata: Record<string, any> = {};
        if (explanation.trim() !== '') metadata.explanation = explanation.trim();
        if (enableSubQuestion && parentQuestionOrder !== 'none') {
            metadata.parent_question_order = Number(parentQuestionOrder);
            metadata.show_when_parent_answered = showWhenParentAnswered;
            if (showWhenParentOptionIncludes.trim() !== '') {
                metadata.show_when_parent_option_includes = showWhenParentOptionIncludes.trim();
            }
        }
        if (['numeric', 'numeric_multi_year', 'numeric_job_rows', 'numeric_service_ranges'].includes(answerType)) {
            if (unit.trim() !== '') metadata.unit = unit.trim();
        }
        if (answerType === 'numeric' && autoPopulateTo.trim() !== '') {
            metadata.auto_populate_to = autoPopulateTo.trim();
        }
        if (answerType === 'numeric_multi_year') {
            metadata.is_multi_year = true;
            const years = parseCsv(yearsCsv);
            if (years.length > 0) metadata.years = years;
        }
        if (answerType === 'numeric_job_rows') {
            metadata.is_job_functions = true;
            const defaults = parseCsv(defaultFunctionsCsv);
            if (defaults.length > 0) metadata.default_functions = defaults;
        }
        if (answerType === 'numeric_service_ranges') {
            metadata.is_years_of_service = true;
            const ranges = parseServiceRanges(serviceRangesText);
            if (ranges.length > 0) metadata.service_ranges = ranges;
        }
        setData('metadata', Object.keys(metadata).length > 0 ? metadata : null);
    }, [answerType, options, explanation, enableSubQuestion, parentQuestionOrder, showWhenParentAnswered, showWhenParentOptionIncludes, unit, autoPopulateTo, yearsCsv, defaultFunctionsCsv, serviceRangesText]);

    const requiresOptions = ['select_one', 'select_up_to_2', 'multiple'].includes(answerType);
    const isNumericType = ['numeric', 'numeric_multi_year', 'numeric_job_rows', 'numeric_service_ranges'].includes(answerType);

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
                                        {t(isNumericType
                                            ? 'compensation_snapshot.numeric_info'
                                            : 'compensation_snapshot.text_info'
                                        )}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label>Additional settings (optional)</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAdditionalSettings((prev) => !prev)}
                                    >
                                        {showAdditionalSettings ? 'Hide' : 'Show'}
                                    </Button>
                                </div>

                                {showAdditionalSettings && (
                                    <div className="space-y-3">
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
                                    </div>
                                )}
                            </div>

                            {['numeric', 'numeric_multi_year', 'numeric_job_rows', 'numeric_service_ranges'].includes(answerType) && (
                                <div className="space-y-3 rounded-lg border p-4">
                                    <Label>Advanced Setup</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Only fields required for selected Answer Type are shown.
                                    </p>
                                    <div>
                                        <Label>Unit</Label>
                                        <Input
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            placeholder="KRW or %"
                                        />
                                    </div>
                                    {answerType === 'numeric' && (
                                    <div>
                                        <Label>Auto-fill target key (optional)</Label>
                                        <Input
                                            value={autoPopulateTo}
                                            onChange={(e) => setAutoPopulateTo(e.target.value)}
                                            placeholder="e.g. benefits_previous_year_total_salary"
                                        />
                                    </div>
                                    )}
                                    {answerType === 'numeric_multi_year' && (
                                    <div>
                                        <Label>Year labels (comma separated)</Label>
                                        <Input value={yearsCsv} onChange={(e) => setYearsCsv(e.target.value)} placeholder="Step 1: Enter years (e.g. 2023, 2024, 2025)" />
                                    </div>
                                    )}
                                    {answerType === 'numeric_job_rows' && (
                                    <div>
                                        <Label>Default job categories (comma separated)</Label>
                                        <Input value={defaultFunctionsCsv} onChange={(e) => setDefaultFunctionsCsv(e.target.value)} placeholder="Step 1: Enter categories (e.g. Staff, R&D, Sales)" />
                                    </div>
                                    )}
                                    {answerType === 'numeric_service_ranges' && (
                                    <div>
                                        <Label>Years-of-service rows (one per line: Label|Key)</Label>
                                        <Textarea
                                            rows={6}
                                            value={serviceRangesText}
                                            onChange={(e) => setServiceRangesText(e.target.value)}
                                            placeholder={'Step 1: Add one row per line\nOverall|overall\n1-3 years|1_3'}
                                        />
                                    </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3 rounded-lg border p-4">
                                <Label>Sub-question Setup (optional)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable only when you need child question flow (example: Q7 then Q7-1).
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="enable_sub_question"
                                        checked={enableSubQuestion}
                                        onCheckedChange={(checked) => {
                                            const next = Boolean(checked);
                                            setEnableSubQuestion(next);
                                            if (!next) {
                                                setParentQuestionOrder('none');
                                                setShowWhenParentOptionIncludes('');
                                                setShowWhenParentAnswered(true);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="enable_sub_question" className="cursor-pointer">
                                        Enable sub-question rules
                                    </Label>
                                </div>

                                {enableSubQuestion && (
                                    <div className="space-y-3">
                                        <div>
                                            <Label>Parent question</Label>
                                            <Select value={parentQuestionOrder} onValueChange={setParentQuestionOrder}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Step 1: Select parent question (e.g. Q7)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Step 1: Select parent question</SelectItem>
                                                    {parentQuestionCandidates.map((q) => (
                                                        <SelectItem key={q.id} value={String(q.order)}>
                                                            {q.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show_when_parent_answered"
                                                checked={showWhenParentAnswered}
                                                onCheckedChange={(checked) =>
                                                    setShowWhenParentAnswered(Boolean(checked))
                                                }
                                            />
                                            <Label htmlFor="show_when_parent_answered" className="cursor-pointer">
                                                Show this only when parent question is answered
                                            </Label>
                                        </div>
                                        <div>
                                            <Label>Parent answer must include (optional)</Label>
                                            <Input
                                                value={showWhenParentOptionIncludes}
                                                onChange={(e) => setShowWhenParentOptionIncludes(e.target.value)}
                                                placeholder="Step 2 (optional): enter parent option text, e.g. chicken"
                                            />
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                For select/multiple parent questions, show this child only if the parent
                                                answer includes this option text.
                                            </p>
                                        </div>
                                    </div>
                                )}
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
