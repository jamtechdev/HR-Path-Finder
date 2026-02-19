import React, { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ConditionalField from '@/components/Forms/ConditionalField';
import { ChevronRight, ChevronLeft, FileText } from 'lucide-react';

interface PolicySnapshotQuestion {
    id: number;
    question_text: string;
    has_conditional_text: boolean;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    questions: PolicySnapshotQuestion[];
}

export default function PolicySnapshot({ project, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, { answer: string; conditional_text?: string }>>({});

    const { data, setData, post, processing } = useForm({
        answers: [] as Array<{ question_id: number; answer: string; conditional_text?: string }>,
    });

    useEffect(() => {
        const answersArray = Object.entries(answers).map(([questionId, answerData]) => ({
            question_id: parseInt(questionId),
            answer: answerData.answer,
            conditional_text: answerData.conditional_text,
        }));
        setData('answers', answersArray);
    }, [answers]);

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers({
            ...answers,
            [questionId]: {
                answer,
                conditional_text: answers[questionId]?.conditional_text,
            },
        });
    };

    const handleConditionalTextChange = (questionId: number, text: string) => {
        setAnswers({
            ...answers,
            [questionId]: {
                answer: answers[questionId]?.answer || '',
                conditional_text: text,
            },
        });
    };

    const handleSubmit = () => {
        // Allow submission even if no answers are selected
        post(`/hr-manager/job-analysis/${project.id}/policy-snapshot`, {
            onSuccess: () => {
                router.visit(`/hr-manager/job-analysis/${project.id}/job-list-selection`);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Policy Snapshot - ${project?.company?.name || 'Job Analysis'}`} />
            <div className="p-6 md:p-8 max-w-5xl mx-auto">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Policy Snapshot
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                This section provides a brief overview of how job roles and responsibilities are currently operated within your company.
                            </p>
                        </div>

                        <Card className="border-2 shadow-lg py-0">
                            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border-b">
                                <CardTitle className="text-2xl font-bold">Policy Snapshot Questions</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    The information you provide will be used solely to support subsequent job analysis and potential adjustments to role and position frameworks.
                                    <span className="block mt-2 text-sm text-muted-foreground/80">
                                        You can skip questions if needed. All fields are optional.
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {questions && questions.length > 0 ? (
                                    questions.map((question, index) => (
                                        <div key={question.id} className="space-y-4 p-4 rounded-lg border border-muted hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-base font-semibold text-foreground">{question.question_text}</Label>
                                                    <RadioGroup
                                                        value={answers[question.id]?.answer || ''}
                                                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                                                        className="mt-3 space-y-2"
                                                    >
                                                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                                                            <RadioGroupItem value="yes" id={`q${question.id}-yes`} />
                                                            <Label htmlFor={`q${question.id}-yes`} className="font-normal cursor-pointer flex-1">Yes</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                                                            <RadioGroupItem value="no" id={`q${question.id}-no`} />
                                                            <Label htmlFor={`q${question.id}-no`} className="font-normal cursor-pointer flex-1">No</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                                                            <RadioGroupItem value="not_sure" id={`q${question.id}-not_sure`} />
                                                            <Label htmlFor={`q${question.id}-not_sure`} className="font-normal cursor-pointer flex-1">Not sure</Label>
                                                        </div>
                                                    </RadioGroup>
                                                    
                                                    {question.has_conditional_text && answers[question.id]?.answer === 'yes' && (
                                                        <div className="ml-11 mt-3 space-y-2">
                                                            <Label className="text-sm font-medium">If yes, which job(s)?</Label>
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
                                        <p className="text-muted-foreground text-lg">
                                            No policy snapshot questions available at this time.
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            You can proceed to the next step.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/intro`)}
                                className="flex items-center"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={processing}
                                size="lg"
                                className="flex items-center shadow-lg hover:shadow-xl transition-all"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
        </AppLayout>
    );
}
