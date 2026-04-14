import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import DynamicList from '@/components/Forms/DynamicList';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

interface Props {
    answerTypes: Record<string, string>;
    parentQuestionCandidates: Array<{ id: number; order: number; label: string }>;
}

const parseCsv = (value: string): string[] =>
    value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

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

export default function CompensationSnapshotCreate({ answerTypes, parentQuestionCandidates }: Props) {
    const { t } = useTranslation(); // translation hook
    const [answerType, setAnswerType] = useState<string>('select_one');
    const [options, setOptions] = useState<string[]>([]);
    const [explanation, setExplanation] = useState<string>('');
    const [parentQuestionOrder, setParentQuestionOrder] = useState<string>('none');
    const [showWhenParentAnswered, setShowWhenParentAnswered] = useState<boolean>(true);
    const [showWhenParentOptionIncludes, setShowWhenParentOptionIncludes] = useState<string>('');
    const [unit, setUnit] = useState<string>('');
    const [autoPopulateTo, setAutoPopulateTo] = useState<string>('');
    const [isMultiYear, setIsMultiYear] = useState<boolean>(false);
    const [yearsCsv, setYearsCsv] = useState<string>('2023, 2024, 2025');
    const [isJobFunctions, setIsJobFunctions] = useState<boolean>(false);
    const [defaultFunctionsCsv, setDefaultFunctionsCsv] = useState<string>('Overall, Management, R&D, Sales & Marketing, Production');
    const [isYearsOfService, setIsYearsOfService] = useState<boolean>(false);
    const [serviceRangesText, setServiceRangesText] = useState<string>(
        'Overall|overall\n1-3 years|1_3\n4-7 years|4_7\n8-12 years|8_12\n13-17 years|13_17\n18-20 years|18_20'
    );
    const [linksToQuestion, setLinksToQuestion] = useState<string>('');
    const [filtersFromQuestion, setFiltersFromQuestion] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        question_text: '',
        answer_type: 'select_one',
        options: [] as string[],
        order: null as number | null,
        is_active: true,
        version: '',
        metadata: null as any,
    });

    useEffect(() => {
        setData('answer_type', answerType);
        if (['select_one', 'select_up_to_2', 'multiple'].includes(answerType)) {
            setData('options', options);
        } else {
            setData('options', null);
        }
        const metadata: Record<string, any> = {};
        if (explanation.trim() !== '') metadata.explanation = explanation.trim();
        if (parentQuestionOrder !== 'none') {
            metadata.parent_question_order = Number(parentQuestionOrder);
            metadata.show_when_parent_answered = showWhenParentAnswered;
            if (showWhenParentOptionIncludes.trim() !== '') {
                metadata.show_when_parent_option_includes = showWhenParentOptionIncludes.trim();
            }
        }
        if (unit.trim() !== '') metadata.unit = unit.trim();
        if (autoPopulateTo.trim() !== '') metadata.auto_populate_to = autoPopulateTo.trim();
        if (isMultiYear) {
            metadata.is_multi_year = true;
            const years = parseCsv(yearsCsv);
            if (years.length > 0) metadata.years = years;
        }
        if (isJobFunctions) {
            metadata.is_job_functions = true;
            const defaults = parseCsv(defaultFunctionsCsv);
            if (defaults.length > 0) metadata.default_functions = defaults;
        }
        if (isYearsOfService) {
            metadata.is_years_of_service = true;
            const ranges = parseServiceRanges(serviceRangesText);
            if (ranges.length > 0) metadata.service_ranges = ranges;
        }
        if (linksToQuestion.trim() !== '') metadata.links_to_question = Number(linksToQuestion);
        if (filtersFromQuestion.trim() !== '') metadata.filters_from_question = Number(filtersFromQuestion);
        setData('metadata', Object.keys(metadata).length > 0 ? metadata : null);
    }, [answerType, options, explanation, parentQuestionOrder, showWhenParentAnswered, showWhenParentOptionIncludes, unit, autoPopulateTo, isMultiYear, yearsCsv, isJobFunctions, defaultFunctionsCsv, isYearsOfService, serviceRangesText, linksToQuestion, filtersFromQuestion]);

    const requiresOptions = ['select_one', 'select_up_to_2', 'multiple'].includes(answerType);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/compensation-snapshot', {
            onSuccess: () => {
                router.visit('/admin/compensation-snapshot');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title={t('compensation_snapshot_create.page_title')} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/compensation-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {t('common.back_to_questions')}
                            </Button>
                            <h1 className="text-3xl font-bold">{t('compensation_snapshot_create.header_title')}</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('compensation_snapshot_create.card_title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>
                                            {t('compensation_snapshot_create.question_text')} <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder={t('compensation_snapshot_create.question_text_placeholder')}
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>{t('compensation_snapshot_create.answer_type')} <span className="text-destructive">*</span></Label>
                                        <Select value={answerType} onValueChange={setAnswerType}>
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
                                            <p className="text-sm text-destructive mt-1">{errors.answer_type}</p>
                                        )}
                                    </div>

                                    {requiresOptions && (
                                        <div>
                                            <Label>{t('compensation_snapshot_create.answer_options')} <span className="text-destructive">*</span></Label>
                                            <p className="text-xs text-muted-foreground mb-2">{t('compensation_snapshot_create.answer_options_description')}</p>
                                            <DynamicList
                                                label=""
                                                items={options}
                                                onChange={setOptions}
                                                placeholder={t('compensation_snapshot_create.answer_option_placeholder')}
                                                addLabel={t('compensation_snapshot_create.add_option')}
                                            />
                                            {errors.options && (
                                                <p className="text-sm text-destructive mt-1">{errors.options}</p>
                                            )}
                                            {options.length === 0 && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {t('compensation_snapshot_create.options_required')}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {!requiresOptions && (
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                {answerType === 'numeric'
                                                    ? t('compensation_snapshot_create.numeric_explanation')
                                                    : t('compensation_snapshot_create.text_explanation')}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label>{t('compensation_snapshot_create.version')}</Label>
                                        <Input
                                            value={data.version}
                                            onChange={(e) => setData('version', e.target.value)}
                                            placeholder={t('compensation_snapshot_create.version_placeholder')}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('compensation_snapshot_create.version_description')}
                                        </p>
                                    </div>

                                    <div>
                                        <Label>{t('compensation_snapshot_create.explanation')}</Label>
                                        <Textarea
                                            value={explanation}
                                            onChange={(e) => setExplanation(e.target.value)}
                                            rows={4}
                                            placeholder={t('compensation_snapshot_create.explanation_placeholder')}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('compensation_snapshot_create.explanation_description')}
                                        </p>
                                    </div>

                                    <div className="space-y-3 rounded-lg border p-4">
                                        <Label>Advanced Setup (optional)</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Use this section to create structured answer forms like yearly values, job-category salary rows, and years-of-service salary ranges.
                                        </p>
                                        <div>
                                            <Label>Unit</Label>
                                            <Input
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                placeholder="KRW or %"
                                            />
                                        </div>
                                        <div>
                                            <Label>Auto-fill target key (optional)</Label>
                                            <Input
                                                value={autoPopulateTo}
                                                onChange={(e) => setAutoPopulateTo(e.target.value)}
                                                placeholder="e.g. benefits_previous_year_total_salary"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="is_multi_year" checked={isMultiYear} onCheckedChange={(c) => setIsMultiYear(Boolean(c))} />
                                            <Label htmlFor="is_multi_year" className="cursor-pointer">Show year-by-year inputs</Label>
                                        </div>
                                        {isMultiYear && (
                                            <div>
                                                <Label>Year labels (comma separated)</Label>
                                                <Input value={yearsCsv} onChange={(e) => setYearsCsv(e.target.value)} />
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="is_job_functions" checked={isJobFunctions} onCheckedChange={(c) => setIsJobFunctions(Boolean(c))} />
                                            <Label htmlFor="is_job_functions" className="cursor-pointer">Show job category rows (Text + Numeric)</Label>
                                        </div>
                                        {isJobFunctions && (
                                            <div>
                                                <Label>Default job categories (comma separated)</Label>
                                                <Input value={defaultFunctionsCsv} onChange={(e) => setDefaultFunctionsCsv(e.target.value)} />
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="is_years_of_service" checked={isYearsOfService} onCheckedChange={(c) => setIsYearsOfService(Boolean(c))} />
                                            <Label htmlFor="is_years_of_service" className="cursor-pointer">Show years-of-service rows</Label>
                                        </div>
                                        {isYearsOfService && (
                                            <div>
                                                <Label>Years-of-service rows (one per line: Label|Key)</Label>
                                                <Textarea
                                                    rows={6}
                                                    value={serviceRangesText}
                                                    onChange={(e) => setServiceRangesText(e.target.value)}
                                                    placeholder={'Overall|overall\n1-3 years|1_3'}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <Label>Links to question order (optional)</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={linksToQuestion}
                                                onChange={(e) => setLinksToQuestion(e.target.value)}
                                                placeholder="e.g. 18"
                                            />
                                        </div>
                                        <div>
                                            <Label>Filters from question order (optional)</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={filtersFromQuestion}
                                                onChange={(e) => setFiltersFromQuestion(e.target.value)}
                                                placeholder="e.g. 17"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-lg border p-4">
                                        <Label>Sub-question Setup (optional)</Label>
                                        <Select value={parentQuestionOrder} onValueChange={setParentQuestionOrder}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="No parent question" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No parent question</SelectItem>
                                                {parentQuestionCandidates.map((q) => (
                                                    <SelectItem key={q.id} value={String(q.order)}>
                                                        {q.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Use this when you want child questions like 7-1, shown only after the parent question.
                                        </p>

                                        {parentQuestionOrder !== 'none' && (
                                            <div className="space-y-3">
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
                                                        placeholder="e.g. chicken"
                                                    />
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        For select/multiple parent questions, show this child only if the
                                                        parent answer includes this option text.
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
                                            {t('compensation_snapshot_create.active_label')}
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
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing || (requiresOptions && options.length === 0)}>
                                    {t('common.create_question')}
                                </Button>
                            </div>
                        </form>
                    </div>
        </AdminLayout>
    );
}