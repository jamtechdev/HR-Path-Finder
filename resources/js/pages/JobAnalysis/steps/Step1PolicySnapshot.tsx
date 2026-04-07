import { ChevronLeft, ArrowRight, HelpCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { PolicyAnswer } from '../hooks/useJobAnalysisState';

interface Question {
    id: number;
    question_text: string;
    order: number;
    has_conditional_text: boolean;
}

interface Step1PolicySnapshotProps {
    questions: Question[];
    savedAnswers?: Record<number, PolicyAnswer>;
    onAnswersChange: (answers: Record<number, PolicyAnswer>) => void;
    onContinue: () => void;
    onBack: () => void;
    fieldErrors?: FieldErrors;
}

export default function Step1PolicySnapshot({
    questions,
    savedAnswers = {},
    onAnswersChange,
    onContinue,
    onBack,
    fieldErrors = {},
}: Step1PolicySnapshotProps) {
    const { t } = useTranslation();
    const OPTIONS = [
        { value: 'yes', label: t('job_analysis_pages.step1.options.yes') },
        { value: 'no', label: t('job_analysis_pages.step1.options.no') },
        { value: 'not_sure', label: t('job_analysis_pages.step1.options.not_sure') },
    ] as const;
    const [answers, setAnswers] = useState<Record<number, PolicyAnswer>>(savedAnswers);
    const prevAnswersRef = useRef<Record<number, PolicyAnswer>>({});
    const onAnswersChangeRef = useRef(onAnswersChange);

    useEffect(() => {
        onAnswersChangeRef.current = onAnswersChange;
    }, [onAnswersChange]);

    useEffect(() => {
        if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            setAnswers(savedAnswers);
            prevAnswersRef.current = savedAnswers;
        }
    }, [savedAnswers]);

    useEffect(() => {
        const answersChanged = JSON.stringify(prevAnswersRef.current) !== JSON.stringify(answers);
        if (answersChanged && onAnswersChangeRef.current) {
            prevAnswersRef.current = answers;
            onAnswersChangeRef.current(answers);
        }
    }, [answers]);

    const handleAnswerChange = (questionId: number, answer: string) => {
        const newAnswers = {
            ...answers,
            [questionId]: {
                answer,
                conditional_text: answers[questionId]?.conditional_text,
            },
        };
        setAnswers(newAnswers);
        prevAnswersRef.current = newAnswers;
        onAnswersChangeRef.current?.(newAnswers);
    };

    const handleConditionalTextChange = (questionId: number, text: string) => {
        const newAnswers = {
            ...answers,
            [questionId]: {
                answer: answers[questionId]?.answer || '',
                conditional_text: text,
            },
        };
        setAnswers(newAnswers);
        prevAnswersRef.current = newAnswers;
        onAnswersChangeRef.current?.(newAnswers);
    };

    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
    const answeredCount = sortedQuestions.filter((q) => answers[q.id]?.answer).length;
    const totalCount = sortedQuestions.length;
    const allAnswered = totalCount > 0 && answeredCount === totalCount;

    return (
        <div className="min-h-full flex flex-col bg-[#f5f3ef] text-[#1a1a3d]">
            {/* Main content - match HTML .main-content */}
            <main className="max-w-[900px] mx-auto w-full" style={{ margin: '40px auto 120px', padding: '0 20px' }}>
                <div className="text-[#b18c4d] text-[11px] font-extrabold uppercase mb-2" style={{ letterSpacing: '0.8px', marginBottom: 8 }}>
                    ● {t('job_analysis_pages.step1.stage')}
                </div>
                <h1 className="text-[#1a1a3d] text-[32px] font-extrabold m-0" style={{ letterSpacing: '-0.5px', marginBottom: 20 }}>
                    {t('job_analysis_pages.step1.title')}
                </h1>

                <div
                    className="border-l-2 border-[#b18c4d] py-0.5 text-[#57606a] text-[15px]"
                    style={{ paddingLeft: 25, paddingTop: 2, paddingBottom: 2, marginBottom: 40, lineHeight: 1.6 }}
                >
                    {t('job_analysis_pages.overview.hero.before_body')}
                </div>

                <div className="text-right text-[13px] font-bold text-[#94a3b8]" style={{ marginBottom: 12 }}>
                    {t('job_analysis_pages.step1.answered', { count: answeredCount, total: totalCount })}
                </div>

                {sortedQuestions.length > 0 ? (
                    <div className="space-y-[30px]" style={{ marginBottom: 30 }}>
                        {sortedQuestions.map((question, index) => {
                            const currentAnswer = answers[question.id]?.answer || '';
                            const isAnswered = !!currentAnswer;

                            return (
                                <div
                                    key={question.id}
                                    className={cn(
                                        'bg-white border relative',
                                        fieldErrors[`q-${question.id}`] || fieldErrors[`q-${question.id}-conditional`]
                                            ? 'border-destructive border-2'
                                            : 'border-[#e0ddd5]'
                                    )}
                                    style={{
                                        borderRadius: 16,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        marginBottom: 30,
                                        overflow: 'visible',
                                    }}
                                >
                                    {/* Number circle - overlaps left edge; no overflow-hidden on card so it shows */}
                                    <div
                                        className="absolute bg-[#1a1a3d] text-white rounded-full flex items-center justify-center text-[13px] font-bold z-10"
                                        style={{ left: -16, top: 28, width: 32, height: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                                        aria-hidden
                                    >
                                        {index + 1}
                                    </div>

                                    {isAnswered && (
                                        <div className="absolute text-[#52b788] text-xs font-bold flex items-center gap-1" style={{ right: 45, top: 28 }}>
                                            ✓ {t('job_analysis_pages.step1.answered_badge')}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start" style={{ padding: '30px 35px' }}>
                                        <div className="flex-1 pr-6">
                                            <p className="text-[#1a1a3d]" style={{ fontSize: 17, lineHeight: 1.5 }}>
                                                {question.question_text}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="shrink-0 rounded-full bg-[#f1f5f9] text-[#94a3b8] flex items-center justify-center cursor-pointer hover:bg-[#e2e8f0]"
                                            style={{ width: 20, height: 20, fontSize: 12 }}
                                            aria-label={t('job_analysis_pages.step1.help')}
                                        >
                                            <HelpCircle className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="border-t border-[#f1f5f9]">
                                        {OPTIONS.map((opt) => {
                                            const isActive = currentAnswer === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => handleAnswerChange(question.id, opt.value)}
                                                    className={`
                                                        w-full flex items-center text-left font-medium transition-colors border-b border-[#f1f5f9] last:border-b-0
                                                        hover:bg-[#fcfcfc]
                                                        ${isActive ? 'text-[#1a1a3d] font-bold bg-[#fcfcfc]' : 'text-[#475569]'}
                                                    `}
                                                    style={{ padding: '18px 35px', gap: 15 }}
                                                >
                                                    <span
                                                        className={`
                                                            rounded-full border-2 flex-shrink-0
                                                            ${isActive
                                                                ? 'border-[#1a1a3d] bg-[#1a1a3d]'
                                                                : 'border-[#cbd5e1] bg-transparent'
                                                            }
                                                        `}
                                                        style={{
                                                            width: 20,
                                                            height: 20,
                                                            ...(isActive ? { boxShadow: 'inset 0 0 0 4px white' } : {}),
                                                        }}
                                                    />
                                                    <span className="font-medium">{opt.label}</span>
                                                    {isActive && (
                                                        <span className="ml-auto text-[#52b788] font-bold">✓</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <FieldErrorMessage fieldKey={`q-${question.id}`} errors={fieldErrors} />

                                    {question.has_conditional_text && currentAnswer === 'yes' && (
                                        <div className="border-t border-[#f1f5f9]" style={{ padding: '16px 35px' }}>
                                            <Label className="text-sm font-semibold text-[#475569] block mb-2">
                                                {t('job_analysis_pages.step1.if_yes')}
                                            </Label>
                                            <Input
                                                value={answers[question.id]?.conditional_text || ''}
                                                onChange={(e) =>
                                                    handleConditionalTextChange(question.id, e.target.value)
                                                }
                                                placeholder={t('job_analysis_pages.step1.input_placeholder')}
                                                className="max-w-md border-[#e0ddd5] rounded-lg"
                                            />
                                            <FieldErrorMessage fieldKey={`q-${question.id}-conditional`} errors={fieldErrors} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-[#64748b]">
                        {t('job_analysis_pages.step1.no_questions')}
                    </div>
                )}
            </main>

            {/* Sticky footer - match HTML .bottom-nav */}
            <footer className="sticky bottom-0 w-full bg-white border-t border-[#e0ddd5] py-[18px] px-6 md:px-[60px] flex flex-wrap items-center justify-between gap-4 z-10 mt-auto">
                <p className="text-[13px] text-[#94a3b8] font-medium">
                    {t('job_analysis_pages.step1.complete_to_continue', { count: answeredCount, total: totalCount })}
                </p>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="border-[#e0ddd5] font-bold px-8 py-6 rounded-lg"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t('job_analysis_pages.step1.back')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onContinue}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold px-9 py-6 rounded-lg"
                    >
                        {t('job_analysis_pages.step1.continue')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
