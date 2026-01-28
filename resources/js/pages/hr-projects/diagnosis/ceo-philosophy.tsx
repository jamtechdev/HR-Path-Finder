import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Building2, Eye, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Props {
    project: {
        id: number;
        current_step: string;
        company?: {
            id: number;
            name?: string;
            industry?: string;
        };
        ceo_philosophy?: {
            responses?: Record<string, string>;
            main_trait?: string;
            sub_trait?: string;
            completed_at?: string | null;
        };
    };
    allowCompanyReview?: boolean;
}

// CEO Philosophy Survey Questions - Step by Step
const surveyQuestions = [
    {
        id: 'q1',
        question: 'When making important business decisions, I prefer to:',
        options: [
            { value: 'intuitive', label: 'Make quick decisions based on intuition and experience' },
            { value: 'data_driven', label: 'Analyze data thoroughly before deciding' },
            { value: 'consensus', label: 'Consult with team members and build consensus' },
            { value: 'process_driven', label: 'Follow established procedures and best practices' },
        ],
    },
    {
        id: 'q2',
        question: 'My approach to goal setting is:',
        options: [
            { value: 'autocratic', label: 'Set clear, specific goals for the team' },
            { value: 'democratic', label: 'Collaborate with team to set shared goals' },
            { value: 'laissez_faire', label: 'Provide general direction and let team define goals' },
            { value: 'strategic', label: 'Align goals with long-term strategic vision' },
        ],
    },
    {
        id: 'q3',
        question: 'When conflicts arise, I:',
        options: [
            { value: 'decisive', label: 'Resolve them quickly with a clear decision' },
            { value: 'facilitative', label: 'Facilitate discussion to find consensus' },
            { value: 'delegative', label: 'Let the team resolve conflicts themselves' },
            { value: 'analytical', label: 'Analyze root causes before addressing' },
        ],
    },
    {
        id: 'q4',
        question: 'I prefer to communicate with my team:',
        options: [
            { value: 'direct', label: 'Directly and clearly, one-on-one' },
            { value: 'open', label: 'Openly in team meetings' },
            { value: 'written', label: 'Through written documentation and emails' },
            { value: 'informal', label: 'Informally through casual conversations' },
        ],
    },
    {
        id: 'q5',
        question: 'My leadership style is best described as:',
        options: [
            { value: 'visionary', label: 'Visionary - I inspire and motivate with big picture thinking' },
            { value: 'coaching', label: 'Coaching - I develop people and help them grow' },
            { value: 'affiliative', label: 'Affiliative - I build relationships and harmony' },
            { value: 'commanding', label: 'Commanding - I take charge and make decisions quickly' },
        ],
    },
];

export default function CeoPhilosophy({ project, allowCompanyReview = false }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState<Record<string, string>>(
        project.ceo_philosophy?.responses || {}
    );
    const [isSaving, setIsSaving] = useState(false);

    const { data, setData, put, post, processing } = useForm({
        responses: responses,
        main_trait: project.ceo_philosophy?.main_trait || '',
        sub_trait: project.ceo_philosophy?.sub_trait || '',
    });

    // Calculate progress
    const totalQuestions = surveyQuestions.length;
    const answeredQuestions = Object.keys(responses).filter(key => responses[key]).length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    // Auto-save when response changes
    useEffect(() => {
        if (Object.keys(responses).length > 0 && !isSaving) {
            const saveTimeout = setTimeout(() => {
                saveProgress();
            }, 1000); // Debounce auto-save

            return () => clearTimeout(saveTimeout);
        }
    }, [responses]);

    const handleResponseChange = (questionId: string, value: string) => {
        const newResponses = { ...responses, [questionId]: value };
        setResponses(newResponses);
        setData('responses', newResponses);

        // Calculate main trait based on responses
        const traitCounts: Record<string, number> = {};
        Object.values(newResponses).forEach((trait) => {
            traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        });
        const mainTrait = Object.keys(traitCounts).length > 0 
            ? Object.keys(traitCounts).reduce((a, b) =>
                traitCounts[a] > traitCounts[b] ? a : b
            )
            : '';
        setData('main_trait', mainTrait);
    };

    const saveProgress = async () => {
        if (Object.keys(responses).length === 0) return;
        
        setIsSaving(true);
        put(`/hr-projects/${project.id}/ceo-philosophy`, {
            preserveScroll: true,
            only: ['project'],
            onSuccess: () => {
                setIsSaving(false);
            },
            onError: () => {
                setIsSaving(false);
            },
        });
    };

    const handleNext = () => {
        if (currentStep < totalQuestions - 1) {
            setCurrentStep(currentStep + 1);
            // Auto-save when moving to next question
            saveProgress();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure all responses are saved before final submit
        if (Object.keys(responses).length > 0) {
            post(`/hr-projects/${project.id}/ceo-philosophy/submit`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['project'] });
                },
            });
        }
    };

    const isCompleted = project.ceo_philosophy?.completed_at !== null && project.ceo_philosophy?.completed_at !== undefined;
    const currentQuestion = surveyQuestions[currentStep];
    const isLastQuestion = currentStep === totalQuestions - 1;
    const canProceed = responses[currentQuestion.id] !== undefined && responses[currentQuestion.id] !== '';

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />
            
            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Management Philosophy Survey" />
                
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit('/ceo/dashboard')}
                                    className="cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Return to Dashboard
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
                                    Management Philosophy Survey
                                </h1>
                                {isCompleted ? (
                                    <Badge className="bg-green-500 text-white px-3 py-1">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Complete
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="px-3 py-1">
                                        In Progress
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm md:text-base">
                                {isCompleted ? 'Your survey has been submitted' : 'Define your leadership style and organizational values'}
                            </p>
                        </div>

                        {/* Company Info Review Alert */}
                        {!isCompleted && allowCompanyReview && project.company && (
                            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <span className="text-sm text-blue-900 dark:text-blue-100">
                                        Before completing the survey, you can review and modify the company information provided by the HR Manager.
                                    </span>
                                    <Link href={`/diagnosis/${project.id}/company-info`} className="flex-shrink-0">
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                            <Eye className="w-4 h-4 mr-2" />
                                            Review Company Info
                                        </Button>
                                    </Link>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Survey Form or Completion Card */}
                        {isCompleted ? (
                            <Card className="shadow-lg border-2">
                                <CardContent className="p-8 md:p-12">
                                    <div className="text-center space-y-6">
                                        {/* Success Icon */}
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>

                                        {/* Success Message */}
                                        <div className="space-y-2">
                                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                                Survey Complete
                                            </h2>
                                            <p className="text-muted-foreground text-sm md:text-base">
                                                Your management philosophy has been analyzed and will guide the HR system design.
                                            </p>
                                        </div>

                                        {/* Traits Display */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                                            <div className="bg-muted/50 rounded-lg p-4 border">
                                                <p className="text-xs text-muted-foreground mb-1">Main Trait</p>
                                                <p className="text-lg font-semibold text-foreground capitalize">
                                                    {project.ceo_philosophy?.main_trait?.replace('_', ' ') || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-4 border">
                                                <p className="text-xs text-muted-foreground mb-1">Sub Trait</p>
                                                <p className="text-lg font-semibold text-foreground capitalize">
                                                    {project.ceo_philosophy?.sub_trait?.replace('_', ' ') || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Return Button */}
                                        <div className="pt-6">
                                            <Button
                                                onClick={() => router.visit('/ceo/dashboard')}
                                                size="lg"
                                                className="w-full sm:w-auto min-w-[200px]"
                                            >
                                                Return to Dashboard
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Progress Card */}
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Question {currentStep + 1} of {totalQuestions}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {Math.round(progressPercentage)}% Complete
                                            </span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </CardContent>
                                </Card>

                                {/* Question Card */}
                                <Card className="shadow-lg">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="space-y-6">
                                            {/* Question */}
                                            <div>
                                                <Label className="text-lg md:text-xl font-semibold text-foreground">
                                                    {currentQuestion.question}
                                                </Label>
                                            </div>

                                            {/* Options */}
                                            <RadioGroup
                                                value={responses[currentQuestion.id] || ''}
                                                onValueChange={(value) => handleResponseChange(currentQuestion.id, value)}
                                                className="space-y-3"
                                            >
                                                {currentQuestion.options.map((option) => (
                                                    <div 
                                                        key={option.value} 
                                                        className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                                                            responses[currentQuestion.id] === option.value
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:bg-muted/50'
                                                        }`}
                                                        onClick={() => handleResponseChange(currentQuestion.id, option.value)}
                                                    >
                                                        <RadioGroupItem 
                                                            value={option.value} 
                                                            id={`${currentQuestion.id}-${option.value}`} 
                                                            className="mt-1" 
                                                        />
                                                        <Label
                                                            htmlFor={`${currentQuestion.id}-${option.value}`}
                                                            className="font-normal cursor-pointer text-sm md:text-base flex-1 leading-relaxed"
                                                        >
                                                            {option.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>

                                            {/* Navigation Buttons */}
                                            <div className="flex items-center justify-between pt-6 border-t">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleBack}
                                                    disabled={currentStep === 0 || processing}
                                                    className="cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                                    Back
                                                </Button>
                                                
                                                {isSaving && (
                                                    <span className="text-sm text-muted-foreground">Saving...</span>
                                                )}

                                                {isLastQuestion ? (
                                                    <form onSubmit={handleFinalSubmit} className="inline">
                                                        <Button
                                                            type="submit"
                                                            disabled={!canProceed || processing}
                                                            className="cursor-pointer"
                                                        >
                                                            {processing ? 'Submitting...' : 'Submit'}
                                                            <CheckCircle2 className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={handleNext}
                                                        disabled={!canProceed || processing}
                                                        className="cursor-pointer"
                                                    >
                                                        Next
                                                        <ChevronRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Question Progress Dots */}
                                <div className="flex items-center justify-center gap-2">
                                    {surveyQuestions.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                // Only allow navigation to answered questions or next unanswered
                                                const canNavigate = index <= answeredQuestions;
                                                if (canNavigate) {
                                                    setCurrentStep(index);
                                                }
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                index === currentStep
                                                    ? 'bg-primary w-8'
                                                    : responses[surveyQuestions[index].id]
                                                    ? 'bg-primary/50'
                                                    : 'bg-muted'
                                            } ${index <= answeredQuestions ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            aria-label={`Question ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
