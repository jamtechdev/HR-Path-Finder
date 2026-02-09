import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    name: string;
    required: boolean;
    completed: boolean;
}

interface ProgressIndicatorProps {
    steps: Step[];
    currentStep?: string;
}

export default function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
    const completedCount = steps.filter(s => s.completed).length;
    const requiredCompleted = steps.filter(s => s.required && s.completed).length;
    const requiredTotal = steps.filter(s => s.required).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-xs text-muted-foreground">
                        {completedCount} of {steps.length} steps completed
                        {requiredTotal > 0 && (
                            <span className="ml-2">
                                ({requiredCompleted}/{requiredTotal} required)
                            </span>
                        )}
                    </p>
                </div>
                <div className="text-sm font-semibold">
                    {Math.round((completedCount / steps.length) * 100)}%
                </div>
            </div>
            <div className="space-y-2">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-md",
                            currentStep === step.id && "bg-primary/10",
                            step.completed && "opacity-75"
                        )}
                    >
                        {step.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium">{step.name}</p>
                            {step.required && (
                                <span className="text-xs text-red-500">Required</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
