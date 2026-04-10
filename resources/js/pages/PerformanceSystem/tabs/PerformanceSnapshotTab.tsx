import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import RightSidePanel from '@/components/PerformanceSystem/RightSidePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Question {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'select_all_that_apply';
    options: string[];
    order: number;
}

interface Props {
    project: {
        id: number;
    };
    questions?: Question[];
    savedResponses?: Record<number, { response: string[]; text_response?: string }>;
    onContinue: (responses: Record<number, { response: string[]; text_response?: string }>) => void;
    onResponsesChange?: (responses: Record<number, { response: string[]; text_response?: string }>) => void;
    onBack?: () => void;
    onAnsweredChange?: (answered: number, total: number) => void;
    fieldErrors?: FieldErrors;
}

function isQuestionFullyAnswered(
    question: Question,
    responses: Record<number, { response: string[]; text_response?: string }>
): boolean {
    const data = responses[question.id];
    const selected = data?.response ?? [];
    if (selected.length === 0) return false;
    const hasOther = question.options.some((o) => o.toLowerCase().includes('other'));
    const selectedOther = selected.some((s) => s.toLowerCase().includes('other'));
    if (hasOther && selectedOther) {
        const text = (data?.text_response ?? '').trim();
        if (!text) return false;
    }
    return true;
}

export default function PerformanceSnapshotTab({
    project,
    questions = [],
    savedResponses = {},
    onContinue,
    onResponsesChange,
    onBack,
    onAnsweredChange,
    fieldErrors = {},
}: Props) {
    const { t } = useTranslation();
    const [responses, setResponses] = useState<Record<number, { response: string[]; text_response?: string }>>(savedResponses);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState<any>(null);

    useEffect(() => {
        if (Object.keys(savedResponses).length > 0) {
            setResponses(savedResponses);
        }
    }, [savedResponses]);

    const totalQuestions = questions.length;
    const answeredCount = questions.filter((q) => isQuestionFullyAnswered(q, responses)).length;
    const allQuestionsAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

    useEffect(() => {
        onAnsweredChange?.(answeredCount, totalQuestions);
    }, [answeredCount, totalQuestions, onAnsweredChange]);

    useEffect(() => {
        onResponsesChange?.(responses);
    }, [responses, onResponsesChange]);

    const handleResponseChange = (questionId: number, option: string, checked: boolean) => {
        const question = questions.find((q) => q.id === questionId);
        if (!question) return;

        const currentResponse = responses[questionId]?.response || [];

        if (question.answer_type === 'select_one') {
            setResponses({
                ...responses,
                [questionId]: { response: checked ? [option] : [] },
            });
        } else if (question.answer_type === 'select_up_to_2') {
            if (checked) {
                if (currentResponse.length < 2) {
                    setResponses({
                        ...responses,
                        [questionId]: { response: [...currentResponse, option] },
                    });
                }
            } else {
                setResponses({
                    ...responses,
                    [questionId]: {
                        ...responses[questionId],
                        response: currentResponse.filter((r) => r !== option),
                    },
                });
            }
        } else if (question.answer_type === 'select_all_that_apply') {
            if (checked) {
                setResponses({
                    ...responses,
                    [questionId]: { response: [...currentResponse, option] },
                });
            } else {
                setResponses({
                    ...responses,
                    [questionId]: {
                        ...responses[questionId],
                        response: currentResponse.filter((r) => r !== option),
                    },
                });
            }
        }
    };

    const handleTextResponseChange = (questionId: number, text: string) => {
        setResponses({
            ...responses,
            [questionId]: {
                ...responses[questionId],
                response: responses[questionId]?.response || [],
                text_response: text,
            },
        });
    };

    const handleViewClick = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        setRightPanelContent({
            concept: t('performance_system_snapshot.guidance_for', { option }),
            key_characteristics: t('performance_system_snapshot.key_characteristics'),
            example: t('performance_system_snapshot.example_usage'),
        });
        setRightPanelOpen(true);
    };

    const handleContinue = () => {
        onContinue(responses);
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <CardHeader className="border-b border-[#e5e7eb] bg-white pb-4 dark:border-slate-700 dark:bg-slate-900">
                        <CardTitle className="text-xl font-bold text-[#121431] dark:text-slate-100">
                            {t('performance_system_snapshot.title')}
                        </CardTitle>
                        <CardDescription className="mt-1 text-[15px] text-[#6b7280] dark:text-slate-300">
                            {t('performance_system_snapshot.description', { total: totalQuestions })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-3 sm:p-6">
                        {questions && questions.length > 0 ? (
                            questions.map((question, index) => {
                                const selectedCount = responses[question.id]?.response?.length ?? 0;
                                const maxSelect = question.answer_type === 'select_up_to_2' ? 2 : undefined;
                                const isAnswered = isQuestionFullyAnswered(question, responses);

                                return (
                                    <div
                                        key={question.id}
                                        className={cn(
                                            'rounded-xl border bg-white p-3 transition-colors hover:border-[#d1d5db] sm:p-5 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500',
                                            fieldErrors[`ps-${question.id}`]
                                                ? 'border-destructive border-2'
                                                : 'border-[#e5e7eb]'
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#121431] text-sm font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-base">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Label className="mb-3 block text-base font-semibold text-[#121431] dark:text-slate-100">
                                                    {question.question_text}
                                                </Label>

                                                {question.answer_type === 'select_up_to_2' && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-sm text-[#6b7280] dark:text-slate-300">
                                                            {t('performance_system_snapshot.select_up_to_2')}
                                                        </span>
                                                        <span className="text-sm font-semibold text-[#059669]">
                                                            {t('performance_system_snapshot.selected_count', {
                                                                selected: selectedCount,
                                                                max: maxSelect,
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                {question.answer_type === 'select_all_that_apply' && (
                                                    <p className="mb-3 text-sm text-[#6b7280] dark:text-slate-300">{t('performance_system_snapshot.select_all_that_apply')}</p>
                                                )}

                                                {question.answer_type === 'select_one' && (
                                                    <RadioGroup
                                                        value={responses[question.id]?.response?.[0] ?? ''}
                                                        onValueChange={(value) =>
                                                            handleResponseChange(question.id, value, true)
                                                        }
                                                        className="space-y-2"
                                                    >
                                                        {question.options.map((option) => (
                                                            <div
                                                                key={option}
                                                                className="flex flex-col gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2.5 hover:bg-[#f9fafb] sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:hover:bg-slate-800/60"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <RadioGroupItem
                                                                        value={option}
                                                                        id={`q${question.id}-${option}`}
                                                                        className="shrink-0"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`q${question.id}-${option}`}
                                                                        className="flex-1 cursor-pointer font-normal text-[#374151] dark:text-slate-200"
                                                                    >
                                                                        {option}
                                                                    </Label>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 shrink-0 self-end border-[#d1d5db] px-3 text-[#6b7280] hover:bg-[#f3f4f6] sm:self-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                                                    onClick={(e) => handleViewClick(e, option)}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1.5" />
                                                                    {t('performance_system_snapshot.view')}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                )}

                                                {(question.answer_type === 'select_up_to_2' ||
                                                    question.answer_type === 'select_all_that_apply') && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option) => {
                                                            const isChecked =
                                                                responses[question.id]?.response?.includes(option) ?? false;
                                                            const isDisabled =
                                                                question.answer_type === 'select_up_to_2' &&
                                                                !isChecked &&
                                                                selectedCount >= 2;
                                                            return (
                                                                <div
                                                                    key={option}
                                                                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2.5 px-3 rounded-lg border transition-colors ${
                                                                        isChecked
                                                                            ? 'border-[#059669] bg-[#f0fdf4] dark:bg-emerald-900/20'
                                                                            : 'border-[#e5e7eb] hover:bg-[#f9fafb] dark:border-slate-700 dark:hover:bg-slate-800/60'
                                                                    } ${isDisabled ? 'opacity-60' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={(checked) =>
                                                                                handleResponseChange(
                                                                                    question.id,
                                                                                    option,
                                                                                    checked === true
                                                                                )
                                                                            }
                                                                            disabled={isDisabled}
                                                                            id={`q${question.id}-${option}`}
                                                                            className="shrink-0"
                                                                        />
                                                                        <Label
                                                                            htmlFor={`q${question.id}-${option}`}
                                                                        className="flex-1 cursor-pointer font-normal text-[#374151] dark:text-slate-200"
                                                                        >
                                                                            {option}
                                                                        </Label>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 shrink-0 self-end border-[#d1d5db] px-3 text-[#6b7280] hover:bg-[#f3f4f6] sm:self-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                                                        onClick={(e) => handleViewClick(e, option)}
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                                        {t('performance_system_snapshot.view')}
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {question.options.some((opt) => opt.toLowerCase().includes('other')) &&
                                                    responses[question.id]?.response?.some((r) =>
                                                        r.toLowerCase().includes('other')
                                                    ) && (
                                                        <div className="ml-0 sm:ml-8 mt-4 space-y-2">
                                                            <Label className="text-sm font-semibold text-[#374151] dark:text-slate-200">
                                                                {t('performance_system_snapshot.please_specify')}
                                                            </Label>
                                                            <Input
                                                                value={responses[question.id]?.text_response ?? ''}
                                                                onChange={(e) =>
                                                                    handleTextResponseChange(question.id, e.target.value)
                                                                }
                                                                placeholder={t('performance_system_snapshot.enter_details')}
                                                                className="mt-1 w-full border-[#e5e7eb] sm:max-w-md dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                                            />
                                                        </div>
                                                    )}
                                                <FieldErrorMessage
                                                    fieldKey={`ps-${question.id}`}
                                                    errors={fieldErrors}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[#6b7280] dark:text-slate-300">{t('performance_system_snapshot.no_questions')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <footer className="sticky bottom-0 z-10 flex w-full flex-col items-stretch justify-between gap-3 border-t border-[#e0ddd5] bg-white px-6 py-[18px] sm:flex-row sm:items-center md:px-[60px] dark:border-slate-700 dark:bg-slate-900">
                    {onBack && (
                        <Button
                            onClick={onBack}
                            variant="outline"
                            className="flex w-full items-center justify-center gap-2 rounded-lg border-[#e0ddd5] px-8 py-6 font-bold sm:w-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t('common.back')}
                        </Button>
                    )}
                    <div className="flex-1 flex items-center justify-center text-center">
                        <span className="text-sm text-[#6b7280] dark:text-slate-300">
                            {t('performance_system_snapshot.answered_progress', {
                                answered: answeredCount,
                                total: totalQuestions,
                            })}
                            {!allQuestionsAnswered && totalQuestions > 0 && (
                                <span className="text-amber-600 ml-1">{t('performance_system_snapshot.answer_all_hint')}</span>
                            )}
                        </span>
                    </div>
                    <Button
                        onClick={handleContinue}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a3d] px-9 py-6 font-bold text-white hover:bg-[#2d2d5c] sm:w-auto dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                        {t('performance_system_snapshot.continue_to_kpi_review')}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </footer>
            </div>

            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title={t('performance_system_snapshot.option_guidance')}
            />
        </>
    );
}
