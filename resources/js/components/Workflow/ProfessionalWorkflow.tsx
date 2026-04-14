import { Link } from '@inertiajs/react';
import { CheckCircle2, Lock, Circle, ArrowRight, Check } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { StepKey } from '@/types/workflow';

interface Step {
    id: StepKey;
    step: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    route?: string;
}

interface ProfessionalWorkflowProps {
    steps: Step[];
    stepStatuses: Record<string, string>;
    getStepState: (stepKey: StepKey) => 'current' | 'locked' | 'completed';
    projectId?: number;
}

export default function ProfessionalWorkflow({
    steps,
    stepStatuses,
    getStepState,
    projectId,
}: ProfessionalWorkflowProps) {
    return (
        <Card className="border-2 shadow-lg overflow-hidden">
            <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">HR System Design Workflow</h3>
                    <p className="text-muted-foreground">
                        Follow the structured process to build your comprehensive HR system
                    </p>
                </div>

                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const state = getStepState(step.id);
                        const isCurrent = state === 'current';
                        const isComplete = state === 'completed';
                        const isLocked = state === 'locked';
                        const Icon = step.icon;
                        const status = stepStatuses[step.id];

                        return (
                            <div key={step.id} className="relative">
                                {/* Connection Line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'absolute left-6 top-16 w-0.5 h-full -z-10 transition-colors duration-300',
                                            isComplete || isCurrent
                                                ? 'bg-gradient-to-b from-primary via-primary/80 to-border'
                                                : 'bg-border'
                                        )}
                                    />
                                )}

                                <div
                                    className={cn(
                                        'relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300',
                                        isCurrent
                                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]'
                                            : isComplete
                                            ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900'
                                            : isLocked
                                            ? 'border-muted bg-muted/30 opacity-60'
                                            : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                                    )}
                                >
                                    {/* Step Icon */}
                                    <div
                                        className={cn(
                                            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300',
                                            isCurrent
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                                : isComplete
                                                ? 'bg-green-500 text-white border-green-500'
                                                : isLocked
                                                ? 'bg-muted text-muted-foreground border-muted'
                                                : 'bg-background text-foreground border-border'
                                        )}
                                    >
                                        {isComplete ? (
                                            <Check className="w-6 h-6" />
                                        ) : isLocked ? (
                                            <Lock className="w-6 h-6" />
                                        ) : (
                                            <Icon className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4
                                                        className={cn(
                                                            'text-lg font-semibold',
                                                            isCurrent
                                                                ? 'text-primary'
                                                                : isComplete
                                                                ? 'text-green-700 dark:text-green-400'
                                                                : 'text-foreground'
                                                        )}
                                                    >
                                                        Step {step.step}: {step.title}
                                                    </h4>
                                                    {isCurrent && (
                                                        <Badge className="bg-primary text-primary-foreground animate-pulse">
                                                            Active
                                                        </Badge>
                                                    )}
                                                    {isComplete && (
                                                        <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Completed
                                                        </Badge>
                                                    )}
                                                    {status === 'submitted' && !isComplete && (
                                                        <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                                                            Submitted
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {!isLocked && step.route && projectId && (
                                            <div className="mt-4">
                                                <Link
                                                    href={step.route.replace(':id', projectId.toString())}
                                                    className={cn(
                                                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                                        isCurrent
                                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                                    )}
                                                >
                                                    {isCurrent ? 'Continue' : isComplete ? 'Review' : 'Start'}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        )}

                                        {isLocked && (
                                            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-muted">
                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Lock className="w-3 h-3" />
                                                    Complete previous steps to unlock
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Summary */}
                <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center justify-between flex-wrap">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Overall Progress</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${
                                                (steps.filter((s) => getStepState(s.id) === 'completed').length /
                                                    steps.length) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                                    {Math.round(
                                        (steps.filter((s) => getStepState(s.id) === 'completed').length /
                                            steps.length) *
                                            100
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
