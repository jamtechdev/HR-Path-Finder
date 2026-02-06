import { Card, CardContent } from '@/components/ui/card';

interface DiagnosisProgressBarProps {
    stepName: string;
    completedSteps: number;
    totalSteps: number;
    currentStep?: number; // Current step number (1-based)
    isCompleted?: boolean; // Whether all steps are completed
}

export default function DiagnosisProgressBar({ 
    stepName, 
    completedSteps, 
    totalSteps,
    currentStep,
    isCompleted = false
}: DiagnosisProgressBarProps) {
    const progressPercent = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
    // Show current step number if provided, otherwise show completed steps
    const stepDisplay = currentStep ? `${currentStep} of ${totalSteps}` : `${completedSteps} of ${totalSteps}`;

    return (
        <Card>
            <CardContent className="p-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{stepName}</span>
                    <span className={`text-sm ${isCompleted ? 'text-success font-semibold' : 'text-muted-foreground'}`}>
                        {stepDisplay}
                    </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className={`h-full transition-all duration-300 ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
