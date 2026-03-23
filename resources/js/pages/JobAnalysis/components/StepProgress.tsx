import { Check } from 'lucide-react';
import React from 'react';
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
        <div className="w-full overflow-x-auto pb-1">
            <nav className="flex items-center justify-center gap-3 min-w-max" style={{ gap: 12 }}>
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isActive = step.id === activeStep;
                    const isClickable = onStepClick !== undefined;
                    const isInactive = !isCompleted && !isActive;

                    const pillContent = (
                        <>
                            {isCompleted && <Check className="w-3.5 h-3.5 shrink-0 text-current" />}
                            {isInactive && (
                                <span className="w-[18px] h-[18px] rounded-full bg-[#94a3b8]/30 text-[#94a3b8] flex items-center justify-center text-[11px] font-semibold shrink-0">
                                    {index + 1}
                                </span>
                            )}
                            <span className="whitespace-nowrap">{step.name}</span>
                        </>
                    );

                    const pillClass = cn(
                        'flex items-center gap-2 rounded-[30px] border px-5 py-2 text-[13px] transition-all flex-shrink-0',
                        isCompleted &&
                            'border-[#52b788] text-[#52b788] bg-white font-medium',
                        isActive &&
                            'bg-[#1a1a3d] border-[#1a1a3d] text-white font-semibold',
                        isInactive &&
                            'border-[#e0ddd5] text-[#94a3b8] bg-white'
                    );

                    const activeShadow = '0 4px 10px rgba(0,0,0,0.2)';

                    const wrapperClass = cn(
                        'flex-shrink-0',
                        isClickable && (isActive || isCompleted) && 'cursor-pointer',
                        isClickable && isInactive && 'cursor-default opacity-90'
                    );

                    const element =
                        isClickable && !isInactive ? (
                            <button
                                key={step.id}
                                onClick={() => onStepClick?.(step.id)}
                                type="button"
                                className={wrapperClass}
                            >
                                <span
                                    className={pillClass}
                                    style={isActive ? { boxShadow: activeShadow } : undefined}
                                >
                                    {pillContent}
                                </span>
                            </button>
                        ) : (
                            <div key={step.id} className={wrapperClass}>
                                <span
                                    className={pillClass}
                                    style={isActive ? { boxShadow: activeShadow } : undefined}
                                >
                                    {pillContent}
                                </span>
                            </div>
                        );

                    return (
                        <React.Fragment key={step.id}>
                            {element}
                            {index < steps.length - 1 && (
                                <div
                                    className="w-2 h-0.5 flex-shrink-0 bg-[#e0ddd5]"
                                    aria-hidden
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        </div>
    );
}
