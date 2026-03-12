import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    CheckCircle2,
    ArrowRight,
    Target,
    Settings,
    LayoutGrid,
    Send,
    Lock,
    Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepConfig {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    estMin: number;
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
    completedTabsCount?: number;
    tabsLength?: number;
    hideProgressCard?: boolean;
}

const STEPS: StepConfig[] = [
    {
        id: 'performance-snapshot',
        name: 'Strategic Performance Snapshot',
        description: "Answer 10 questions about your company's performance management approach",
        icon: <FileText className="w-5 h-5" />,
        route: 'performance-snapshot',
        estMin: 5,
    },
    {
        id: 'kpi-review',
        name: 'KPI Review',
        description: 'Review and manage organizational KPIs',
        icon: <Target className="w-5 h-5" />,
        route: 'kpi-review',
        estMin: 4,
    },
    {
        id: 'model-assignment',
        name: 'Evaluation Model Assignment',
        description: 'Assign evaluation models (MBO, BSC, OKR) to jobs',
        icon: <Settings className="w-5 h-5" />,
        route: 'model-assignment',
        estMin: 5,
    },
    {
        id: 'evaluation-structure',
        name: 'Evaluation Structure',
        description: 'Configure evaluation structure and assessment methods',
        icon: <LayoutGrid className="w-5 h-5" />,
        route: 'evaluation-structure',
        estMin: 3,
    },
    {
        id: 'review-submit',
        name: 'Review & Submit',
        description: 'Final review and submission of performance system',
        icon: <Send className="w-5 h-5" />,
        route: 'review-submit',
        estMin: 2,
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
    completedTabsCount: completedCountProp,
    tabsLength: totalStepsProp,
    hideProgressCard = false,
}: Props) {
    const completedCount = completedCountProp ?? STEPS.filter((s) => completedSteps.has(s.id)).length;
    const totalSteps = totalStepsProp ?? STEPS.length;
    const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

    const isStepEnabled = (index: number) => {
        if (index === 0) return true;
        for (let i = 0; i < index; i++) {
            if (!completedSteps.has(STEPS[i].id)) return false;
        }
        return true;
    };

    const handleStart = (step: StepConfig, index: number) => {
        if (!isStepEnabled(index)) return;
        if (onStepClick) {
            onStepClick(step.id);
        } else {
            window.location.href = `/hr-manager/performance-system/${projectId}/${step.route}`;
        }
    };

    return (
        <div className="space-y-6 pb-8 px-2">
            {!hideProgressCard && (
            <Card className="rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-[#121431]">
                        Progress Summary
                    </CardTitle>
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
            )}

            {/* Timeline — same as Job Analysis: vertical line + numbered circles + step cards */}
            <div className="flex-1 relative w-full">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-[#d1d5db] z-[1]" aria-hidden />
                <div className="space-y-6 relative z-[2]">
                    {STEPS.map((step, index) => {
                        const completed = completedSteps.has(step.id);
                        const enabled = isStepEnabled(index);
                        const isActive = enabled && !completed;

                        return (
                            <div key={step.id} className="flex gap-6">
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-5 border',
                                        completed && 'bg-emerald-500 border-emerald-500 text-white',
                                        isActive && 'bg-[#1e293b] text-white border-[#1e293b]',
                                        !enabled && 'bg-white border-[#d1d5db] text-[#94a3b8]'
                                    )}
                                >
                                    {completed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                </div>
                                <div
                                    className={cn(
                                        'flex-1 bg-white rounded-xl border border-[#e2e8f0] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all',
                                        isActive && 'border-2 border-[#1e293b] shadow-lg',
                                        !enabled && 'opacity-60 bg-[#fafafa]'
                                    )}
                                >
                                    <div className="min-w-0">
                                        <div
                                            className={cn(
                                                'text-[11px] font-bold uppercase',
                                                enabled ? 'text-[#b38e5d]' : 'text-[#cbd5e1]'
                                            )}
                                        >
                                            STEP {index + 1} OF {STEPS.length}
                                        </div>
                                        <div
                                            className={cn(
                                                'text-xl font-bold mt-1 flex items-center gap-2',
                                                enabled ? 'text-[#1e293b]' : 'text-[#94a3b8]'
                                            )}
                                        >
                                            {step.icon}
                                            {step.name}
                                        </div>
                                        <p
                                            className={cn(
                                                'text-sm mt-1 mb-3',
                                                enabled ? 'text-[#64748b]' : 'text-[#cbd5e1]'
                                            )}
                                        >
                                            {step.description}
                                        </p>
                                        <div
                                            className={cn('text-xs', enabled ? 'text-[#94a3b8]' : 'text-[#cbd5e1]')}
                                        >
                                            ~{step.estMin} min
                                            {!enabled && index > 0 && ` • Complete Step ${index} first`}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        {enabled && !completed && (
                                            <>
                                                <div className="bg-[#f8fafc] text-[#64748b] px-3 py-1.5 rounded-lg text-xs">
                                                    Ready to Start
                                                </div>
                                                <Button
                                                    onClick={() => handleStart(step, index)}
                                                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                                >
                                                    Start <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {completed && (
                                            <Button
                                                onClick={() => handleStart(step, index)}
                                                variant="outline"
                                                className="font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                            >
                                                Review <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {!enabled && (
                                            <div className="bg-[#f1f5f9] text-[#94a3b8] px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
                                                <Lock className="w-3.5 h-3.5" />
                                                Locked
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer — same as Job Analysis */}
            <footer className="sticky bottom-0 w-full bg-white py-4 px-5 md:px-[10%] flex flex-wrap items-center justify-between gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 mt-auto border-t border-[#e2e8f0]">
                <p className="text-sm text-[#64748b]">
                    <b>{completedCount}</b> of {totalSteps} steps completed
                </p>
                <Button
                    onClick={() => handleStart(STEPS[0], 0)}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-8 py-3 rounded-lg"
                >
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Performance System
                </Button>
            </footer>
        </div>
    );
}
