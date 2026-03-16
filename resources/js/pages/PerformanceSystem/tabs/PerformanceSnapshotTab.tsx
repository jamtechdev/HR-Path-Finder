import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import RightSidePanel from '@/components/PerformanceSystem/RightSidePanel';

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
    onBack?: () => void;
    onAnsweredChange?: (answered: number, total: number) => void;
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
    onBack,
    onAnsweredChange,
}: Props) {
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
            concept: `Guidance for: ${option}`,
            key_characteristics: 'Key characteristics will be loaded from admin configuration.',
            example: 'Example usage will be shown here.',
        });
        setRightPanelOpen(true);
    };

    const handleContinue = () => {
        if (!allQuestionsAnswered) return;
        onContinue(responses);
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-sm border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-[#e5e7eb] bg-white pb-4">
                        <CardTitle className="text-xl font-bold text-[#121431]">
                            Strategic Performance Snapshot
                        </CardTitle>
                        <CardDescription className="text-[15px] text-[#6b7280] mt-1">
                            Answer {totalQuestions} questions about your company's performance management philosophy and current state. All questions and options are mapped to HR system design outcomes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 space-y-6">
                        {questions && questions.length > 0 ? (
                            questions.map((question, index) => {
                                const selectedCount = responses[question.id]?.response?.length ?? 0;
                                const maxSelect = question.answer_type === 'select_up_to_2' ? 2 : undefined;
                                const isAnswered = isQuestionFullyAnswered(question, responses);

                                return (
                                    <div
                                        key={question.id}
                                        className="p-3 sm:p-5 rounded-xl border border-[#e5e7eb] bg-white hover:border-[#d1d5db] transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#121431] text-white flex items-center justify-center text-sm sm:text-base font-bold shadow-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Label className="text-base font-semibold text-[#121431] block mb-3">
                                                    {question.question_text}
                                                </Label>

                                                {question.answer_type === 'select_up_to_2' && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-sm text-[#6b7280]">
                                                            Select up to 2 options
                                                        </span>
                                                        <span className="text-sm font-semibold text-[#059669]">
                                                            {selectedCount}/{maxSelect} selected
                                                        </span>
                                                    </div>
                                                )}
                                                {question.answer_type === 'select_all_that_apply' && (
                                                    <p className="text-sm text-[#6b7280] mb-3">Select all that apply</p>
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
                                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2.5 px-3 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb]"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <RadioGroupItem
                                                                        value={option}
                                                                        id={`q${question.id}-${option}`}
                                                                        className="shrink-0"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`q${question.id}-${option}`}
                                                                        className="font-normal text-[#374151] cursor-pointer flex-1"
                                                                    >
                                                                        {option}
                                                                    </Label>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="shrink-0 h-8 px-3 text-[#6b7280] border-[#d1d5db] hover:bg-[#f3f4f6] self-end sm:self-auto"
                                                                    onClick={(e) => handleViewClick(e, option)}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1.5" />
                                                                    View
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
                                                                            ? 'border-[#059669] bg-[#f0fdf4]'
                                                                            : 'border-[#e5e7eb] hover:bg-[#f9fafb]'
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
                                                                            className="font-normal text-[#374151] cursor-pointer flex-1"
                                                                        >
                                                                            {option}
                                                                        </Label>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="shrink-0 h-8 px-3 text-[#6b7280] border-[#d1d5db] hover:bg-[#f3f4f6] self-end sm:self-auto"
                                                                        onClick={(e) => handleViewClick(e, option)}
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                                        View
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
                                                            <Label className="text-sm font-semibold text-[#374151]">
                                                                Please specify:
                                                            </Label>
                                                            <Input
                                                                value={responses[question.id]?.text_response ?? ''}
                                                                onChange={(e) =>
                                                                    handleTextResponseChange(question.id, e.target.value)
                                                                }
                                                                placeholder="Enter details..."
                                                                className="mt-1 w-full sm:max-w-md border-[#e5e7eb]"
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[#6b7280]">No performance snapshot questions available.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-[#e5e7eb]">
                    {onBack && (
                        <Button
                            onClick={onBack}
                            variant="outline"
                            size="lg"
                            className="flex items-center justify-center gap-2 border-[#e5e7eb] w-full sm:w-auto"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                    )}
                    <div className="flex-1 flex items-center justify-center text-center">
                        <span className="text-sm text-[#6b7280]">
                            <span className="font-semibold text-[#121431]">{answeredCount}</span>/{totalQuestions} questions
                            answered
                            {!allQuestionsAnswered && totalQuestions > 0 && (
                                <span className="text-amber-600 ml-1">— answer all to continue</span>
                            )}
                        </span>
                    </div>
                    <Button
                        onClick={handleContinue}
                        size="lg"
                        disabled={!allQuestionsAnswered}
                        className="flex items-center justify-center gap-2 bg-[#121431] hover:bg-[#1e2a4a] disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                    >
                        Continue to KPI Review
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title="Option Guidance"
            />
        </>
    );
}
