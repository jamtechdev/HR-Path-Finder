import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
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
}

export default function PerformanceSnapshotTab({ 
    project, 
    questions = [], 
    savedResponses = {},
    onContinue,
    onBack 
}: Props) {
    const [responses, setResponses] = useState<Record<number, { response: string[]; text_response?: string }>>(savedResponses);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightPanelContent, setRightPanelContent] = useState<any>(null);

    useEffect(() => {
        if (Object.keys(savedResponses).length > 0) {
            setResponses(savedResponses);
        }
    }, [savedResponses]);

    const handleResponseChange = (questionId: number, option: string, checked: boolean) => {
        const question = questions.find(q => q.id === questionId);
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
                    [questionId]: { response: currentResponse.filter(r => r !== option) },
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
                    [questionId]: { response: currentResponse.filter(r => r !== option) },
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

    const handleOptionClick = async (option: string) => {
        // Fetch guidance content for this option (would be implemented with API call)
        // For now, show placeholder
        setRightPanelContent({
            concept: `Guidance for: ${option}`,
            key_characteristics: 'Key characteristics will be loaded from admin configuration.',
            example: 'Example usage will be shown here.',
        });
        setRightPanelOpen(true);
    };

    const handleContinue = () => {
        onContinue(responses);
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                        <CardTitle className="text-2xl font-bold">Strategic Performance Snapshot</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Answer 10 questions about your company's performance management philosophy and current state. All questions and options are managed by Admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {questions && questions.length > 0 ? (
                            questions.map((question, index) => (
                                <div key={question.id} className="space-y-4 p-5 rounded-xl border-2 border-muted hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-lg font-semibold block mb-4">{question.question_text}</Label>
                                            
                                            {question.answer_type === 'select_one' && (
                                                <RadioGroup
                                                    value={responses[question.id]?.response?.[0] || ''}
                                                    onValueChange={(value) => handleResponseChange(question.id, value, true)}
                                                    className="mt-3 space-y-3"
                                                >
                                                    {question.options.map((option) => (
                                                        <div
                                                            key={option}
                                                            className="flex items-center space-x-3 p-3 rounded-lg border-2 border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                                            onClick={() => handleOptionClick(option)}
                                                        >
                                                            <RadioGroupItem value={option} id={`q${question.id}-${option}`} />
                                                            <Label htmlFor={`q${question.id}-${option}`} className="font-normal cursor-pointer flex-1 text-base flex items-center gap-2">
                                                                {option}
                                                                <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            )}

                                            {(question.answer_type === 'select_up_to_2' || question.answer_type === 'select_all_that_apply') && (
                                                <div className="mt-3 space-y-3">
                                                    {question.answer_type === 'select_up_to_2' && (
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Select up to 2 options
                                                            {responses[question.id]?.response?.length === 2 && (
                                                                <span className="text-orange-600 font-semibold ml-2">(Maximum reached)</span>
                                                            )}
                                                        </p>
                                                    )}
                                                    {question.options.map((option) => {
                                                        const isChecked = responses[question.id]?.response?.includes(option) || false;
                                                        const isDisabled = question.answer_type === 'select_up_to_2' && 
                                                                          !isChecked && 
                                                                          (responses[question.id]?.response?.length || 0) >= 2;
                                                        return (
                                                            <div
                                                                key={option}
                                                                className={`
                                                                    flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer
                                                                    ${isChecked ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}
                                                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                                                `}
                                                                onClick={() => !isDisabled && handleOptionClick(option)}
                                                            >
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) => handleResponseChange(question.id, option, checked === true)}
                                                                    disabled={isDisabled}
                                                                    id={`q${question.id}-${option}`}
                                                                />
                                                                <Label htmlFor={`q${question.id}-${option}`} className="font-normal cursor-pointer flex-1 text-base flex items-center gap-2">
                                                                    {option}
                                                                    <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Text input for "Other" option */}
                                            {question.options.some(opt => opt.toLowerCase().includes('other')) && 
                                             responses[question.id]?.response?.some(r => r.toLowerCase().includes('other')) && (
                                                <div className="ml-14 mt-4 space-y-2">
                                                    <Label className="text-sm font-semibold">Please specify:</Label>
                                                    <Input
                                                        value={responses[question.id]?.text_response || ''}
                                                        onChange={(e) => handleTextResponseChange(question.id, e.target.value)}
                                                        placeholder="Enter details..."
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
                                <p className="text-muted-foreground">No performance snapshot questions available.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
                    {onBack && (
                        <Button 
                            onClick={onBack} 
                            variant="outline" 
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                    )}
                    <div className="flex-1" />
                    <Button 
                        onClick={handleContinue} 
                        size="lg"
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                    >
                        Continue to KPI Review
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Right Side Panel */}
            <RightSidePanel
                isOpen={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
                content={rightPanelContent}
                title="Option Guidance"
            />
        </>
    );
}
