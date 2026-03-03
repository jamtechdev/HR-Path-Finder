import React, { useState, useEffect, useRef } from 'react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
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
}

export default function Step1PolicySnapshot({
    questions,
    savedAnswers = {},
    onAnswersChange,
    onContinue,
    onBack,
}: Step1PolicySnapshotProps) {
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
        if (onAnswersChangeRef.current) {
            onAnswersChangeRef.current(newAnswers);
        }
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
        if (onAnswersChangeRef.current) {
            onAnswersChangeRef.current(newAnswers);
        }
    };

    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
    const allAnswered = sortedQuestions.every(q => answers[q.id]?.answer);

    return (
        <StepContainer
            stepNumber={1}
            stepName="Policy Snapshot"
            description="This section provides a brief overview of how job roles and responsibilities are currently operated within your company. The information you provide will be used solely to support subsequent job analysis and potential adjustments to role and position frameworks."
        >
            <div className="space-y-6">
                {sortedQuestions.length > 0 ? (
                    sortedQuestions.map((question, index) => (
                        <div
                            key={`question-${question.id}-${index}`}
                            className="space-y-4 p-5 rounded-xl border-2 border-muted hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <Label className="text-lg font-semibold block mb-4">
                                        {question.question_text}
                                    </Label>
                                    <RadioGroup
                                        value={answers[question.id]?.answer || ''}
                                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                                        className="mt-3 space-y-3"
                                    >
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                                            <RadioGroupItem value="yes" id={`q${question.id}-yes`} />
                                            <Label htmlFor={`q${question.id}-yes`} className="font-normal cursor-pointer flex-1 text-base">
                                                Yes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                                            <RadioGroupItem value="no" id={`q${question.id}-no`} />
                                            <Label htmlFor={`q${question.id}-no`} className="font-normal cursor-pointer flex-1 text-base">
                                                No
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                                            <RadioGroupItem value="not_sure" id={`q${question.id}-not_sure`} />
                                            <Label htmlFor={`q${question.id}-not_sure`} className="font-normal cursor-pointer flex-1 text-base">
                                                Not sure
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {question.has_conditional_text && answers[question.id]?.answer === 'yes' && (
                                        <div className="ml-14 mt-4 space-y-2">
                                            <Label className="text-sm font-semibold">If yes, which job(s)?</Label>
                                            <Input
                                                value={answers[question.id]?.conditional_text || ''}
                                                onChange={(e) => handleConditionalTextChange(question.id, e.target.value)}
                                                placeholder="Enter job names"
                                                className="mt-1"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No policy snapshot questions available.</p>
                    </div>
                )}

                <StepNavigation
                    onBack={onBack}
                    onNext={onContinue}
                    nextLabel="Continue to Job List Selection"
                    nextDisabled={!allAnswered}
                />
            </div>
        </StepContainer>
    );
}
