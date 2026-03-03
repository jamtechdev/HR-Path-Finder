import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    name: string;
}

interface StepProgressProps {
    steps: Step[];
    activeStep: string;
    completedSteps: Set<string>;
    onStepClick?: (stepId: string) => void;
}

export default function StepProgress({
    steps,
    activeStep,
    completedSteps,
    onStepClick,
}: StepProgressProps) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 scrollbar-thin">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isActive = step.id === activeStep;
                    const isClickable = onStepClick !== undefined;

                    const stepContent = (
                        <div
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap min-w-fit',
                                !isClickable && 'cursor-default',
                                isClickable && !isActive && !isCompleted && 'cursor-pointer hover:bg-muted/50',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2'
                                    : isCompleted
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            {isCompleted && (
                                <Check className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium">{step.name}</span>
                        </div>
                    );

                    if (isClickable) {
                        return (
                            <button
                                key={step.id}
                                onClick={() => onStepClick?.(step.id)}
                                className="flex-shrink-0"
                                type="button"
                            >
                                {stepContent}
                            </button>
                        );
                    }

                    return (
                        <div key={step.id} className="flex-shrink-0">
                            {stepContent}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
