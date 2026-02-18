import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LikertScale from '@/components/Forms/LikertScale';
import SliderQuestion from '@/components/Forms/SliderQuestion';
import TextQuestion from '@/components/Forms/TextQuestion';
import SelectQuestion from '@/components/Forms/SelectQuestion';
import MultiSelectQuestion from '@/components/Forms/MultiSelectQuestion';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface DiagnosisQuestion {
    id: number;
    question_text: string;
    question_type: string;
    options?: string[];
    metadata?: any;
}

interface HrIssue {
    id: number;
    name: string;
    category: string;
}

interface IntroText {
    content: string;
    title?: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    philosophy?: {
        management_philosophy_responses?: Record<string, number>;
        vision_mission_responses?: Record<string, any>;
        growth_stage?: string;
        leadership_responses?: Record<string, number>;
        general_responses?: Record<string, number>;
        organizational_issues?: string[];
        concerns?: string;
    };
    managementPhilosophyQuestions: DiagnosisQuestion[];
    visionMissionQuestions: DiagnosisQuestion[];
    growthStageQuestion?: DiagnosisQuestion;
    leadershipQuestions: DiagnosisQuestion[];
    generalQuestions: DiagnosisQuestion[];
    concernsQuestion?: DiagnosisQuestion;
    hrIssues: HrIssue[];
    introText?: IntroText;
    diagnosis?: {
        hr_issues?: string[];
    };
}

const STEPS = [
    { id: 'intro', name: 'Welcome' },
    { id: 'management', name: 'Management Philosophy' },
    { id: 'vision', name: 'Vision/Mission' },
    { id: 'growth', name: 'Growth Stage' },
    { id: 'leadership', name: 'Leadership' },
    { id: 'general', name: 'General Questions' },
    { id: 'issues', name: 'Organizational Issues' },
    { id: 'concerns', name: 'CEO Concerns' },
];

export default function CeoPhilosophySurvey({
    project,
    philosophy,
    managementPhilosophyQuestions,
    visionMissionQuestions,
    growthStageQuestion,
    leadershipQuestions,
    generalQuestions,
    concernsQuestion,
    hrIssues,
    introText,
    diagnosis,
}: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [hasSeenIntro, setHasSeenIntro] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        management_philosophy: philosophy?.management_philosophy_responses || {},
        vision_mission: philosophy?.vision_mission_responses || {},
        growth_stage: philosophy?.growth_stage || '',
        leadership: philosophy?.leadership_responses || {},
        general: philosophy?.general_responses || {},
        organizational_issues: philosophy?.organizational_issues || diagnosis?.hr_issues || [],
        concerns: philosophy?.concerns || '',
    });

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const handleNext = () => {
        if (currentStep === 0) {
            if (!hasAgreed) {
                return; // Cannot proceed without agreeing
            }
            if (!hasSeenIntro) {
                setHasSeenIntro(true);
            }
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        post(`/ceo/philosophy/survey/${project.id}`, {
            onSuccess: () => {
                router.visit('/ceo/dashboard');
            },
        });
    };

    const renderStepContent = () => {
        switch (STEPS[currentStep].id) {
            case 'intro':
                const defaultIntroContent = `This diagnostic is not an evaluation of your leadership or performance.
There are no right or wrong answers.
This assessment is designed to understand your current management priorities and decision-making perspective, based on your responses at this point in time.
Please note the following:
• Your individual responses will not be shared as-is with the HR manager or any other employees.
• No one will be able to view your original answers to individual questions.
• Results will be used only after being aggregated, interpreted, and anonymized into summary insights.
• Any comparison with HR input is intended to understand differences in perspective, not to judge or evaluate individuals.
For the most meaningful outcome, please answer honestly and instinctively, based on what you consider most important right now, rather than what may appear ideal or socially desirable.`;

                return (
                    <Card className="border-2 shadow-xl overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-1">
                            <CardHeader className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Welcome to Your Survey</CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            Let's begin your management philosophy assessment
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </div>
                        <CardContent className="space-y-8">
                            <div className="prose prose-lg max-w-none">
                                <div className="whitespace-pre-line text-base leading-relaxed text-foreground space-y-4">
                                    <p className="text-base font-medium text-foreground mb-4">
                                        {introText?.content || defaultIntroContent}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="border-t py-6">
                                <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all">
                                    <div className="flex-shrink-0 mt-1">
                                        <Checkbox
                                            id="agree-intro"
                                            checked={hasAgreed}
                                            onCheckedChange={(checked) => setHasAgreed(checked === true)}
                                            className="w-5 h-5 border-2"
                                        />
                                    </div>
                                    <label htmlFor="agree-intro" className="flex-1 cursor-pointer">
                                        <span className="text-lg font-semibold text-foreground block mb-2">
                                            I Understand & Ready to Start
                                        </span>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            By checking this box, you confirm that you understand the purpose of this diagnostic and agree to proceed with the survey.
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'management':
                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">Management Philosophy</CardTitle>
                            <CardDescription className="text-base my-2">
                                Please rate each statement on a scale of 1-7, where 1 = Strongly Disagree and 7 = Strongly Agree
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {managementPhilosophyQuestions.map((question) => (
                                <LikertScale
                                    key={question.id}
                                    question={question.question_text}
                                    value={data.management_philosophy[question.id.toString()]}
                                    onChange={(value) => {
                                        setData('management_philosophy', {
                                            ...data.management_philosophy,
                                            [question.id.toString()]: value,
                                        });
                                    }}
                                    scale={7}
                                    labels={question.metadata?.labels || []}
                                    required
                                />
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'vision':
                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">Vision/Mission/Ideal Talent Type</CardTitle>
                            <CardDescription className="text-base my-2">
                                This section clarifies the future direction of your company and the type of talent needed to achieve that vision.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {visionMissionQuestions.map((question) => {
                                if (question.question_type === 'select') {
                                    return (
                                        <SelectQuestion
                                            key={question.id}
                                            question={question.question_text}
                                            value={data.vision_mission[question.id.toString()]}
                                            onChange={(value) => {
                                                setData('vision_mission', {
                                                    ...data.vision_mission,
                                                    [question.id.toString()]: value,
                                                });
                                            }}
                                            options={question.options || []}
                                            required
                                        />
                                    );
                                } else if (question.question_type === 'number') {
                                    return (
                                        <TextQuestion
                                            key={question.id}
                                            question={question.question_text}
                                            value={data.vision_mission[question.id.toString()]}
                                            onChange={(value) => {
                                                setData('vision_mission', {
                                                    ...data.vision_mission,
                                                    [question.id.toString()]: value,
                                                });
                                            }}
                                            type="number"
                                            placeholder={question.metadata?.unit || ''}
                                            required
                                        />
                                    );
                                } else {
                                    return (
                                        <TextQuestion
                                            key={question.id}
                                            question={question.question_text}
                                            value={data.vision_mission[question.id.toString()]}
                                            onChange={(value) => {
                                                setData('vision_mission', {
                                                    ...data.vision_mission,
                                                    [question.id.toString()]: value,
                                                });
                                            }}
                                            type="textarea"
                                            required
                                        />
                                    );
                                }
                            })}
                        </CardContent>
                    </Card>
                );

            case 'growth':
                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">Growth Stage</CardTitle>
                            <CardDescription className="text-base mt-2">
                                This section identifies your company's current growth phase to align organizational structure and people strategy with business maturity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            {growthStageQuestion && (
                                <SelectQuestion
                                    question={growthStageQuestion.question_text}
                                    value={data.growth_stage}
                                    onChange={(value) => setData('growth_stage', value)}
                                    options={growthStageQuestion.options || []}
                                    required
                                />
                            )}
                        </CardContent>
                    </Card>
                );

            case 'leadership':
                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">Leadership</CardTitle>
                            <CardDescription className="text-base mt-2">
                                This section examines leadership style and management practices to assess how leadership impacts execution and organizational culture.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {leadershipQuestions.map((question) => (
                                <SliderQuestion
                                    key={question.id}
                                    question={question.question_text}
                                    value={data.leadership[question.id.toString()] || 4}
                                    onChange={(value) => {
                                        setData('leadership', {
                                            ...data.leadership,
                                            [question.id.toString()]: value,
                                        });
                                    }}
                                    optionA={question.metadata?.option_a}
                                    optionB={question.metadata?.option_b}
                                    required
                                />
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'general':
                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">General Questions</CardTitle>
                            <CardDescription className="text-base mt-2">
                                This section gathers overall operational context to support a balanced and accurate interpretation of your responses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {generalQuestions.map((question) => (
                                <SliderQuestion
                                    key={question.id}
                                    question={question.question_text}
                                    value={data.general[question.id.toString()] || 4}
                                    onChange={(value) => {
                                        setData('general', {
                                            ...data.general,
                                            [question.id.toString()]: value,
                                        });
                                    }}
                                    optionA={question.metadata?.option_a}
                                    optionB={question.metadata?.option_b}
                                    required
                                />
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'issues':
                // Group HR issues by category
                const groupedIssues = hrIssues.reduce((acc, issue) => {
                    const category = issue.category || 'others';
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(issue);
                    return acc;
                }, {} as Record<string, typeof hrIssues>);

                // Category display names
                const categoryNames: Record<string, string> = {
                    'recruitment_retention': 'Recruitment / Retention',
                    'organizations': 'Organizations',
                    'culture_leadership': 'Culture / Leadership',
                    'evaluation_compensation': 'Evaluation / Compensation',
                    'upskilling': 'Upskilling',
                    'others': 'Others',
                };

                const handleIssueToggle = (issueId: string, isChecked: boolean) => {
                    const currentIssues = data.organizational_issues || [];
                    if (isChecked) {
                        if (!currentIssues.includes(issueId)) {
                            setData('organizational_issues', [...currentIssues, issueId]);
                        }
                    } else {
                        setData('organizational_issues', currentIssues.filter((id: string | number) => id.toString() !== issueId));
                    }
                };

                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">Organizational Issues</CardTitle>
                            <CardDescription className="text-base mt-2">
                                These issues have been identified by your HR manager as key challenges currently facing the company. Please select the issues that you also agree are relevant from your perspective as CEO.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {Object.entries(groupedIssues).map(([category, issues]) => (
                                <div key={category} className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {categoryNames[category.toLowerCase()] || category}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {issues.map((issue) => {
                                            const issueIdStr = issue.id.toString();
                                            const isSelected = (data.organizational_issues || []).some((id: string | number) => id.toString() === issueIdStr);
                                            return (
                                                <div key={issue.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                                                    <Checkbox
                                                        id={`issue-${issue.id}`}
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => handleIssueToggle(issueIdStr, checked === true)}
                                                    />
                                                    <label
                                                        htmlFor={`issue-${issue.id}`}
                                                        className="text-sm font-medium leading-none cursor-pointer"
                                                    >
                                                        {issue.name}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'concerns':
                return (
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                            <CardTitle className="text-2xl">CEO's Concerns</CardTitle>
                            <CardDescription className="text-base">
                                This section captures the key concerns and priorities you currently have as CEO, providing direct input for defining practical focus areas and next steps.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            {concernsQuestion && (
                                <TextQuestion
                                    question={concernsQuestion.question_text}
                                    value={data.concerns}
                                    onChange={(value) => setData('concerns', value)}
                                    type="textarea"
                                    rows={6}
                                    required
                                />
                            )}
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Management Philosophy Survey - ${project?.company?.name || 'Company'}`} />
                    <div className="p-6 md:p-8 max-w-5xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        Management Philosophy Survey
                                    </h1>
                                    <p className="text-muted-foreground text-lg">
                                        Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Complete</div>
                                </div>
                            </div>
                            <Progress value={progress} className="h-3 rounded-full" />
                        </div>

                        {renderStepContent()}

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                size="lg"
                                className="min-w-[140px]"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                            {currentStep < STEPS.length - 1 ? (
                                <Button 
                                    onClick={handleNext}
                                    disabled={currentStep === 0 && !hasAgreed}
                                    size="lg"
                                    className="min-w-[180px] bg-primary hover:bg-primary/90"
                                >
                                    {currentStep === 0 ? 'I Understand & Start' : 'Next'}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={processing}
                                    size="lg"
                                    className="min-w-[180px] bg-primary hover:bg-primary/90"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submit Survey
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
