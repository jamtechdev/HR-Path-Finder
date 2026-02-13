import { Check, Lock, CheckCircle2 } from 'lucide-react';
import type { StepStatuses } from '@/types/dashboard';
import type { StepKey } from '@/types/workflow';
import { cn } from '@/lib/utils';

interface StepCard {
    id: StepKey;
    step: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface ProgressTrackerProps {
    stepCards: StepCard[];
    stepStatuses: StepStatuses;
    getStepState: (step: StepKey) => 'current' | 'locked' | 'completed';
}

export default function ProgressTracker({ stepCards, stepStatuses, getStepState }: ProgressTrackerProps) {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <h3 className="font-semibold tracking-tight text-lg">HR System Design Progress</h3>
            </div>
            <div className="p-3 md:p-6 pt-0">
                <div className="flex items-center justify-between gap-2">
                    {stepCards.map((step, index) => {
                        const state = getStepState(step.id);
                        const isCurrent = state === 'current';
                        const isComplete = state === 'completed';
                        const isLocked = state === 'locked';
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                            isCurrent
                                                ? 'bg-green-800 text-white border-green-800 shadow-lg scale-110'
                                                : isComplete
                                                ? 'bg-green-100/50 text-green-500 border-green-200'
                                                : 'bg-muted text-muted-foreground border-border'
                                        )}
                                    >
                                        {isCurrent ? (
                                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        ) : isComplete ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : isLocked ? (
                                            <Lock className="w-4 h-4" />
                                        ) : (
                                            <span className="text-sm font-semibold">{step.step}</span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p
                                            className={cn(
                                                "text-xs font-medium",
                                                isCurrent
                                                    ? 'text-green-700 dark:text-green-400 font-semibold'
                                                    : isComplete
                                                    ? 'text-green-600 dark:text-green-500'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                                {index < stepCards.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-0.5 mx-3 transition-colors duration-300 hidden md:block",
                                        isCurrent || isComplete ? 'bg-green-800' : 'bg-border',
                                        isCurrent && 'h-1'
                                    )}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
