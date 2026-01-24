import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    name: string;
    completed: boolean;
    current: boolean;
    locked: boolean;
}

interface StepNavigationProps {
    steps: Step[];
    currentStep: string;
}

export function StepNavigation({ steps, currentStep }: StepNavigationProps) {
    return (
        <nav className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={cn(
                                'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                                step.completed && 'border-brand-green bg-brand-green text-white',
                                step.current && !step.completed && 'border-brand-blue bg-brand-blue text-white',
                                !step.current && !step.completed && !step.locked && 'border-gray-300 bg-white',
                                step.locked && 'border-gray-200 bg-gray-100 text-gray-400'
                            )}
                        >
                            {step.completed ? (
                                <CheckCircle2 className="size-5" />
                            ) : step.locked ? (
                                <Lock className="size-5" />
                            ) : (
                                <Circle className="size-5" />
                            )}
                        </div>
                        <span
                            className={cn(
                                'mt-2 text-xs font-medium',
                                step.current && 'text-brand-blue',
                                step.completed && 'text-brand-green',
                                step.locked && 'text-gray-400'
                            )}
                        >
                            {step.name}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                'mx-2 h-0.5 w-12',
                                step.completed ? 'bg-brand-green' : 'bg-gray-300'
                            )}
                        />
                    )}
                </div>
            ))}
        </nav>
    );
}
