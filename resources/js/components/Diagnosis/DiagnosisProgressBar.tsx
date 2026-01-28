import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DiagnosisProgressBarProps {
    stepName: string;
    completedSteps: number;
    totalSteps: number;
    currentStep?: number; // Current step number (1-based)
}

export default function DiagnosisProgressBar({ 
    stepName, 
    completedSteps, 
    totalSteps,
    currentStep 
}: DiagnosisProgressBarProps) {
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);
    // Show current step number if provided, otherwise show completed steps
    const stepDisplay = currentStep ? `${currentStep} of ${totalSteps}` : `${completedSteps} of ${totalSteps}`;

    return (
        <Card>
            <CardContent className="p-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{stepName}</span>
                    <span className="text-sm text-muted-foreground">{stepDisplay}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
            </CardContent>
        </Card>
    );
}
