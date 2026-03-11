import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    CheckCircle2,
    ArrowRight,
    Target,
    Users,
    Settings,
    CheckCircle,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    isCompleted: boolean;
    isEnabled: boolean;
    progressLabel?: string;
    progressCurrent?: number;
    progressTotal?: number;
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
    jobCount?: number;
    snapshotQuestionsCount?: number;
}

const STEPS: Omit<Step, 'isCompleted' | 'isEnabled' | 'progressLabel' | 'progressCurrent' | 'progressTotal'>[] = [
    {
        id: 'performance-snapshot',
        name: 'Strategic Performance Snapshot',
        description: "Answer 10 questions about your company's performance management approach",
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
    jobCount = 0,
    snapshotQuestionsCount = 10,
}: Props) {
    const performanceStatus = stepStatuses?.performance || 'not_started';
    const isInProgress = performanceStatus === 'in_progress';
    const isSubmitted = ['submitted', 'approved', 'locked'].includes(performanceStatus);

    const stepsWithStatus: Step[] = STEPS.map((step, idx) => {
        let isCompleted = false;
        let progressLabel = '';
        let progressCurrent = 0;
        let progressTotal = 0;

        switch (step.id) {
            case 'performance-snapshot':
                isCompleted = Object.keys(snapshotResponses).length > 0 || completedSteps.has(step.id);
                progressLabel = 'questions';
                progressCurrent = isCompleted ? snapshotQuestionsCount : Object.keys(snapshotResponses).length;
                progressTotal = snapshotQuestionsCount;
                break;
            case 'kpi-review':
                isCompleted = organizationalKpis.length > 0 || completedSteps.has(step.id);
                progressLabel = 'units reviewed';
                progressCurrent = organizationalKpis.length;
                progressTotal = 1;
                break;
            case 'ceo-kpi-review':
                isCompleted = completedSteps.has(step.id);
                progressLabel = 'KPIs approved';
                progressCurrent = 0;
                progressTotal = 1;
                break;
            case 'model-assignment':
                isCompleted = evaluationModelAssignments.length > 0 || completedSteps.has(step.id);
                progressLabel = 'assigned';
                progressCurrent = evaluationModelAssignments.length;
                progressTotal = 1;
                break;
            case 'evaluation-structure':
                isCompleted = !!evaluationStructure || completedSteps.has(step.id);
                progressLabel = 'configured';
                progressCurrent = evaluationStructure ? 1 : 0;
                progressTotal = 1;
                break;
            default:
                isCompleted = completedSteps.has(step.id);
        }

        return {
            ...step,
            isCompleted,
            isEnabled: true,
            progressLabel,
            progressCurrent,
            progressTotal,
        };
    });

    const handleStepClick = (step: Step) => {
        if (onStepClick) {
            onStepClick(step.id);
        } else {
            window.location.href = `/hr-manager/performance-system/${projectId}/${step.route}`;
        }
    };

    const completedCount = stepsWithStatus.filter((s) => s.isCompleted).length;
    const totalSteps = stepsWithStatus.length;
    const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
    const firstIncompleteIndex = stepsWithStatus.findIndex((s) => !s.isCompleted);
    const recommendedNextId = firstIncompleteIndex >= 0 ? stepsWithStatus[firstIncompleteIndex].id : null;

    return (
        <div className="space-y-6 pb-8">
            {/* Connected From Previous Step banner */}
            <div className="rounded-xl overflow-hidden bg-[#151535] text-white px-5 py-4 md:px-6 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#22c55e]" />
                </div>
                <div>
                    <p className="text-xs font-bold tracking-wider text-[#94a3b8] uppercase">
                        Connected from previous step
                    </p>
                    <p className="text-sm md:text-base mt-0.5 text-slate-200">
                        Job Analysis complete — Start performance management based on {jobCount} job data.
                        {jobCount === 0 && ' (Complete Job Analysis first for job count.)'}
                    </p>
                </div>
            </div>

            {/* Progress Summary card */}
            <Card className="rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-[#121431]">
                            Progress Summary
                        </CardTitle>
                        <span
                            className={cn(
                                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                                isSubmitted
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isInProgress
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-[#f3f4f6] text-[#6b7280]'
                            )}
                        >
                            {isSubmitted ? 'Submitted' : isInProgress ? 'In Progress' : 'Not Started'}
                        </span>
                    </div>
                    <CardDescription className="text-[#6b7280]">
                        {completedCount} of {totalSteps} steps completed
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-xs font-medium text-[#6b7280] mb-2">Overall Progress</p>
                    <div className="w-full bg-[#e5e7eb] rounded-full h-2">
                        <div
                            className="bg-[#059669] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Step cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stepsWithStatus.map((step, index) => {
                    const isRecommendedNext = recommendedNextId === step.id;
                    return (
                        <Card
                            key={step.id}
                            className={cn(
                                'rounded-xl border shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md',
                                isRecommendedNext
                                    ? 'border-[#22c55e] border-2'
                                    : step.isCompleted
                                    ? 'border-[#22c55e]/50'
                                    : 'border-[#e5e7eb]'
                            )}
                            onClick={() => handleStepClick(step)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className={cn(
                                                'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                                                isRecommendedNext
                                                    ? 'bg-[#dcfce7] text-[#16a34a]'
                                                    : step.isCompleted
                                                    ? 'bg-[#dcfce7] text-[#16a34a]'
                                                    : 'bg-[#f3f4f6] text-[#6b7280]'
                                            )}
                                        >
                                            {step.icon}
                                        </div>
                                        <div className="min-w-0">
                                            {isRecommendedNext && (
                                                <span className="inline-block text-xs font-semibold text-[#16a34a] bg-[#dcfce7] px-2 py-0.5 rounded-full mb-1">
                                                    ▷ Recommended Next
                                                </span>
                                            )}
                                            <CardTitle className="text-base font-semibold text-[#121431]">
                                                {step.name}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    {step.isCompleted && (
                                        <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <CardDescription className="text-sm text-[#6b7280]">
                                    {step.description}
                                </CardDescription>
                                <div className="space-y-1.5">
                                    <p className="text-xs text-[#6b7280]">
                                        {step.id === 'performance-snapshot' && (
                                            <>
                                                {step.progressCurrent} / {step.progressTotal} questions
                                            </>
                                        )}
                                        {step.id === 'kpi-review' && (
                                            <>{step.progressCurrent} units reviewed</>
                                        )}
                                        {step.id === 'ceo-kpi-review' && (
                                            <>{step.progressCurrent} KPIs approved</>
                                        )}
                                        {step.id === 'model-assignment' && (
                                            <>{step.progressCurrent} models assigned</>
                                        )}
                                        {step.id === 'evaluation-structure' && (
                                            <>{step.progressCurrent > 0 ? 'Configured' : 'Not configured'}</>
                                        )}
                                    </p>
                                    <div className="w-full bg-[#e5e7eb] rounded-full h-1.5">
                                        <div
                                            className={cn(
                                                'h-1.5 rounded-full transition-all',
                                                step.isCompleted ? 'bg-[#22c55e]' : 'bg-[#d1d5db]'
                                            )}
                                            style={{
                                                width:
                                                    step.progressTotal > 0
                                                        ? `${(step.progressCurrent / step.progressTotal) * 100}%`
                                                        : '0%',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs font-medium text-[#6b7280]">
                                        {step.isCompleted ? 'Completed' : 'Pending'}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            'h-8 text-sm font-medium',
                                            isRecommendedNext
                                                ? 'text-[#16a34a] hover:text-[#15803d] hover:bg-[#dcfce7]'
                                                : 'text-[#6b7280] hover:text-[#374151]'
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStepClick(step);
                                        }}
                                    >
                                        {step.isCompleted ? 'Review' : 'Start'}
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
