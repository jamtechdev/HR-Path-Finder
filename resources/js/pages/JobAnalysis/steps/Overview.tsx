import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    CheckCircle2,
    ArrowRight,
    Shield,
    List,
    Briefcase,
    Network,
    Send,
    Lock,
} from 'lucide-react';
import { router } from '@inertiajs/react';
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
}

const STEPS: StepConfig[] = [
    { id: 'before-you-begin', name: 'Before You Begin', description: 'Introduction and overview of the job analysis process.', icon: <FileText className="w-5 h-5" />, route: 'before-you-begin', estMin: 2 },
    { id: 'policy-snapshot', name: 'Policy Snapshot', description: "Answer questions about your company's job classification framework.", icon: <Shield className="w-5 h-5" />, route: 'policy-snapshot', estMin: 4 },
    { id: 'job-list-selection', name: 'Job List Selection', description: 'Select and organize jobs that exist within your company.', icon: <List className="w-5 h-5" />, route: 'job-list-selection', estMin: 4 },
    { id: 'job-definition', name: 'Job Definition', description: 'Define job descriptions, specifications, competencies, and CSFs.', icon: <Briefcase className="w-5 h-5" />, route: 'job-definition', estMin: 5 },
    { id: 'finalization', name: 'Finalization', description: 'Review and finalize all job definitions.', icon: <CheckCircle2 className="w-5 h-5" />, route: 'finalization', estMin: 2 },
    { id: 'org-chart-mapping', name: 'Org Chart Mapping', description: 'Map finalized jobs to organizational units.', icon: <Network className="w-5 h-5" />, route: 'org-chart-mapping', estMin: 2 },
    { id: 'review-submit', name: 'Review & Submit', description: 'Final review and submission of all job analysis data.', icon: <Send className="w-5 h-5" />, route: 'review-submit', estMin: 1 },
];

const TOTAL_EST_MIN = 20;

export default function JobAnalysisOverview({
    projectId,
    stepStatuses = {},
    completedSteps = new Set(),
    onStepClick,
}: Props) {
    const jobAnalysisStatus = stepStatuses?.job_analysis || 'not_started';
    const isInProgress = jobAnalysisStatus === 'in_progress';
    const isSubmitted = ['submitted', 'approved', 'locked'].includes(jobAnalysisStatus);

    const completedCount = STEPS.filter((s) => completedSteps.has(s.id)).length;
    const progressPct = STEPS.length ? Math.round((completedCount / STEPS.length) * 100) : 0;

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
            router.visit(`/hr-manager/job-analysis/${projectId}/${step.route}`);
        }
    };

    const statusLabel = isSubmitted ? 'Submitted' : isInProgress ? 'In Progress' : 'Not Started';

    return (
        <div className="space-y-0">
            {/* Dark navy header */}
            <div className="rounded-t-[14px] bg-gradient-to-br from-[#0f2a4a] to-[#1a4070] dark:from-slate-800 dark:to-slate-900 px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#c8a84b] mb-1">
                            Stage 3 of 5 — Job Analysis
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                            Job Analysis Overview
                        </h1>
                        <p className="mt-2 text-sm text-white/70 max-w-xl">
                            Define job standards and role expectations for your organization. Complete each step in sequence to build a consultant-ready job framework.
                        </p>
                    </div>
                    <Badge
                        className={cn(
                            'shrink-0 px-3 py-1.5 text-xs font-semibold',
                            isSubmitted ? 'bg-emerald-500/90 text-white' : isInProgress ? 'bg-amber-500/90 text-white' : 'bg-white/20 text-white border border-white/30'
                        )}
                    >
                        {statusLabel.toUpperCase()}
                    </Badge>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Steps done</span>
                        <span className="text-lg font-bold text-white">
                            <span className="text-[#c8a84b]">{completedCount}</span>
                            <span className="text-white/50">/{STEPS.length}</span>
                            <span className="text-xs font-normal text-white/60 ml-1">completed</span>
                        </span>
                    </div>
                    <div className="flex-1 min-w-[140px] max-w-[240px]">
                        <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
                            <span>Overall progress</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[#c8a84b] transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-[11px] text-white/60">
                        Est. <span className="font-semibold text-white/80">~{TOTAL_EST_MIN} min</span> total
                    </div>
                </div>
            </div>

            {/* Steps list - cream/light background */}
            <div className="rounded-b-[14px] border border-t-0 border-slate-200 bg-[#F8F6F2] sm:bg-[#F5F3EF] px-4 sm:px-6 py-6 space-y-4">
                {STEPS.map((step, index) => {
                    const completed = completedSteps.has(step.id);
                    const enabled = isStepEnabled(index);
                    return (
                        <div
                            key={step.id}
                            className={cn(
                                'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all',
                                enabled ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-50/80 border-slate-100'
                            )}
                        >
                            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                                        completed ? 'bg-emerald-500 text-white' : enabled ? 'bg-[#0f2a4a] dark:bg-slate-700 text-white' : 'bg-slate-200 text-slate-500'
                                    )}
                                >
                                    {completed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                            Step {index + 1} of {STEPS.length}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-base font-bold text-slate-800 dark:text-slate-100">
                                            {step.icon}
                                            {step.name}
                                        </span>
                                        {enabled && !completed && (
                                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 border-0">
                                                Ready to Start
                                            </Badge>
                                        )}
                                        {!enabled && (
                                            <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-300">
                                                <Lock className="w-3 h-3 mr-0.5" />
                                                Locked
                                            </Badge>
                                        )}
                                        {completed && (
                                            <Badge className="text-[10px] bg-emerald-500/90 text-white border-0">
                                                Completed
                                            </Badge>
                                        )}
                                    </div>
                                    <p className={cn('mt-1 text-sm', enabled ? 'text-slate-600' : 'text-slate-400')}>
                                        {step.description}
                                    </p>
                                    {!enabled && index > 0 && (
                                        <p className="mt-1 text-[11px] text-amber-700">
                                            Complete Step {index} first
                                        </p>
                                    )}
                                    <p className="mt-1 text-[11px] text-slate-400">~{step.estMin} min</p>
                                </div>
                            </div>
                            <div className="sm:pl-4 shrink-0">
                                <Button
                                    size="sm"
                                    onClick={() => handleStart(step, index)}
                                    disabled={!enabled}
                                    className={cn(
                                        'min-w-[100px]',
                                        enabled ? 'bg-[#0f2a4a] dark:bg-slate-700 hover:bg-[#1a4070]' : 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    {completed ? 'Review' : 'Start'}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
