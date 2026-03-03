import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    CheckCircle2, 
    ArrowRight,
    Shield,
    Target,
    Users,
    Settings,
    CheckCircle
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
    snapshotResponses?: Record<number, any>;
    organizationalKpis?: any[];
    evaluationModelAssignments?: any[];
    evaluationStructure?: any;
}

const STEPS: Omit<Step, 'isCompleted' | 'isEnabled'>[] = [
    {
        id: 'performance-snapshot',
        name: 'Strategic Performance Snapshot',
        description: 'Answer 10 questions about your company\'s performance management approach',
        icon: <FileText className="w-5 h-5" />,
        route: 'performance-snapshot',
    },
    {
        id: 'kpi-review',
        name: 'KPI Review',
        description: 'Review and manage organizational KPIs',
        icon: <Target className="w-5 h-5" />,
        route: 'kpi-review',
    },
    {
        id: 'ceo-kpi-review',
        name: 'CEO KPI Review',
        description: 'CEO review of organizational KPIs',
        icon: <Users className="w-5 h-5" />,
        route: 'ceo-kpi-review',
    },
    {
        id: 'model-assignment',
        name: 'Evaluation Model Assignment',
        description: 'Assign evaluation models (MBO, BSC, OKR) to jobs',
        icon: <Settings className="w-5 h-5" />,
        route: 'model-assignment',
    },
    {
        id: 'evaluation-structure',
        name: 'Evaluation Structure',
        description: 'Configure evaluation structure and assessment methods',
        icon: <CheckCircle className="w-5 h-5" />,
        route: 'evaluation-structure',
    },
];

export default function PerformanceSystemOverview({ 
    projectId, 
    stepStatuses = {},
    completedSteps = new Set(),
    onStepClick,
    snapshotResponses = {},
    organizationalKpis = [],
    evaluationModelAssignments = [],
    evaluationStructure,
}: Props) {
    const performanceStatus = stepStatuses?.performance || 'not_started';
    const isInProgress = performanceStatus === 'in_progress';
    const isSubmitted = ['submitted', 'approved', 'locked'].includes(performanceStatus);

    const stepsWithStatus: Step[] = STEPS.map(step => {
        let isCompleted = false;
        switch (step.id) {
            case 'performance-snapshot':
                isCompleted = Object.keys(snapshotResponses).length > 0 || completedSteps.has(step.id);
                break;
            case 'kpi-review':
                isCompleted = organizationalKpis.length > 0 || completedSteps.has(step.id);
                break;
            case 'ceo-kpi-review':
                isCompleted = completedSteps.has(step.id);
                break;
            case 'model-assignment':
                isCompleted = evaluationModelAssignments.length > 0 || completedSteps.has(step.id);
                break;
            case 'evaluation-structure':
                isCompleted = !!evaluationStructure || completedSteps.has(step.id);
                break;
            default:
                isCompleted = completedSteps.has(step.id);
        }
        return {
            ...step,
            isCompleted,
            isEnabled: true, // All steps are enabled from overview
        };
    });

    const handleStepClick = (step: Step) => {
        if (onStepClick) {
            onStepClick(step.id);
        } else {
            router.visit(`/hr-manager/performance-system/${projectId}/${step.route}`);
        }
    };

    const getStartRoute = () => {
        // Find first incomplete step, or default to performance-snapshot
        const firstIncomplete = stepsWithStatus.find(step => !step.isCompleted);
        return firstIncomplete?.route || 'performance-snapshot';
    };

    const handleStart = () => {
        const startRoute = getStartRoute();
        if (onStepClick) {
            onStepClick(startRoute);
        } else {
            router.visit(`/hr-manager/performance-system/${projectId}/${startRoute}`);
        }
    };

    const completedCount = stepsWithStatus.filter(s => s.isCompleted).length;
    const totalSteps = stepsWithStatus.length;
    const progressPercentage = (completedCount / totalSteps) * 100;

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Performance System Overview</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Design your performance management system including evaluation units, methods, and assessment structures.
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
                        <h3 className="text-lg font-semibold text-gray-900">About Performance System</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            The Performance System allows you to design a comprehensive performance management framework for your organization. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                            <li>Strategic performance snapshot and assessment</li>
                            <li>Organizational KPIs and key performance indicators</li>
                            <li>Evaluation model assignments (MBO, BSC, OKR) for different jobs</li>
                            <li>Evaluation structure and assessment methods</li>
                        </ul>
                        <p className="text-sm text-gray-700 leading-relaxed mt-4">
                            <strong>Note:</strong> The performance system you design will be used to evaluate and manage employee performance across your organization. All configurations will be based on the job analysis data you've already completed.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Information Only - No Action Buttons */}
            <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                    Click on any step card above to navigate to that section.
                </p>
            </div>
        </div>
    );
}
