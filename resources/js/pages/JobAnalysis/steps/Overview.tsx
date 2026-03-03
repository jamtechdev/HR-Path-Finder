import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    FileText, 
    CheckCircle2, 
    ArrowRight,
    Shield,
    List,
    Briefcase,
    Network,
    Send
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    isCompleted: boolean;
    isEnabled: boolean;
}

interface Props {
    projectId: number;
    stepStatuses?: Record<string, string>;
    completedSteps?: Set<string>;
    onStepClick?: (stepId: string) => void;
}

const STEPS: Omit<Step, 'isCompleted' | 'isEnabled'>[] = [
    {
        id: 'before-you-begin',
        name: 'Before You Begin',
        description: 'Introduction and overview of the job analysis process',
        icon: <FileText className="w-5 h-5" />,
        route: 'before-you-begin',
    },
    {
        id: 'policy-snapshot',
        name: 'Policy Snapshot',
        description: 'Answer questions about your company\'s job classification framework',
        icon: <Shield className="w-5 h-5" />,
        route: 'policy-snapshot',
    },
    {
        id: 'job-list-selection',
        name: 'Job List Selection',
        description: 'Select and organize jobs that exist within your company',
        icon: <List className="w-5 h-5" />,
        route: 'job-list-selection',
    },
    {
        id: 'job-definition',
        name: 'Job Definition',
        description: 'Define job descriptions, specifications, competencies, and CSFs',
        icon: <Briefcase className="w-5 h-5" />,
        route: 'job-definition',
    },
    {
        id: 'finalization',
        name: 'Finalization',
        description: 'Review and finalize all job definitions',
        icon: <CheckCircle2 className="w-5 h-5" />,
        route: 'finalization',
    },
    {
        id: 'org-chart-mapping',
        name: 'Org Chart Mapping',
        description: 'Map finalized jobs to organizational units',
        icon: <Network className="w-5 h-5" />,
        route: 'org-chart-mapping',
    },
    {
        id: 'review-submit',
        name: 'Review & Submit',
        description: 'Final review and submission of all job analysis data',
        icon: <Send className="w-5 h-5" />,
        route: 'review-submit',
    },
];

export default function JobAnalysisOverview({ 
    projectId, 
    stepStatuses = {},
    completedSteps = new Set(),
    onStepClick 
}: Props) {
    const jobAnalysisStatus = stepStatuses?.job_analysis || 'not_started';
    const isInProgress = jobAnalysisStatus === 'in_progress';
    const isSubmitted = ['submitted', 'approved', 'locked'].includes(jobAnalysisStatus);

    const stepsWithStatus: Step[] = STEPS.map(step => ({
        ...step,
        isCompleted: completedSteps.has(step.id),
        isEnabled: true, // All steps are enabled from overview
    }));

    const handleStepClick = (step: Step) => {
        if (onStepClick) {
            onStepClick(step.id);
        } else {
            router.visit(`/hr-manager/job-analysis/${projectId}/${step.route}`);
        }
    };

    const getStartRoute = () => {
        // Find first incomplete step, or default to before-you-begin
        const firstIncomplete = stepsWithStatus.find(step => !step.isCompleted);
        return firstIncomplete?.route || 'before-you-begin';
    };

    const handleStart = () => {
        const startRoute = getStartRoute();
        if (onStepClick) {
            onStepClick(startRoute);
        } else {
            router.visit(`/hr-manager/job-analysis/${projectId}/${startRoute}`);
        }
    };

    const completedCount = stepsWithStatus.filter(s => s.isCompleted).length;
    const totalSteps = stepsWithStatus.length;
    const progressPercentage = (completedCount / totalSteps) * 100;

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Job Analysis Overview</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Define job standards and role expectations for your organization. Complete each step to proceed.
                </p>
            </div>

            {/* Progress Summary */}
            <Card className="border-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Progress Summary</CardTitle>
                            <CardDescription>
                                {completedCount} of {totalSteps} steps completed
                            </CardDescription>
                        </div>
                        <Badge 
                            variant={isSubmitted ? 'default' : isInProgress ? 'secondary' : 'outline'}
                            className="text-sm px-4 py-2"
                        >
                            {isSubmitted ? 'Submitted' : isInProgress ? 'In Progress' : 'Not Started'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                            <div 
                                className="bg-primary h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stepsWithStatus.map((step, index) => (
                    <Card
                        key={step.id}
                        className={cn(
                            'cursor-pointer transition-all hover:shadow-lg border-2',
                            step.isCompleted 
                                ? 'border-green-300 bg-green-50/50' 
                                : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => handleStepClick(step)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'p-2 rounded-lg',
                                        step.isCompleted 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{step.name}</CardTitle>
                                    </div>
                                </div>
                                {step.isCompleted && (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {step.description}
                            </CardDescription>
                            <div className="flex items-center justify-between">
                                <Badge 
                                    variant={step.isCompleted ? 'default' : 'outline'}
                                    className="text-xs"
                                >
                                    {step.isCompleted ? 'Completed' : 'Pending'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepClick(step);
                                    }}
                                >
                                    {step.isCompleted ? 'Review' : 'Start'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Information Section */}
            <Card className="border-2 bg-blue-50/50">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">About Job Analysis</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Job Analysis is a systematic process to organize and clarify job standards and role expectations as they are currently operated within your company. This stage helps define:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                            <li>Job descriptions and specifications for each role</li>
                            <li>Competency levels required for different positions</li>
                            <li>Critical Success Factors (CSFs) for performance evaluation</li>
                            <li>Organizational chart mappings and role assignments</li>
                        </ul>
                        <p className="text-sm text-gray-700 leading-relaxed mt-4">
                            <strong>Note:</strong> This stage is not intended to redesign your organizational structure. All inputs are confidential and will be used as baseline inputs for designing performance management and compensation systems.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
                {completedCount === 0 ? (
                    <Button 
                        size="lg" 
                        onClick={handleStart}
                        className="min-w-[200px]"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Start Job Analysis
                    </Button>
                ) : completedCount < totalSteps ? (
                    <Button 
                        size="lg" 
                        variant="outline"
                        onClick={handleStart}
                        className="min-w-[200px]"
                    >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Continue Job Analysis
                    </Button>
                ) : (
                    <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => handleStepClick(stepsWithStatus[stepsWithStatus.length - 1])}
                        className="min-w-[200px]"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Review & Submit
                    </Button>
                )}
            </div>
        </div>
    );
}
