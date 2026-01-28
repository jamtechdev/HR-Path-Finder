import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PerformanceProgressBarProps {
    stepName: string;
    completedSteps: number;
    totalSteps: number;
}

export default function PerformanceProgressBar({ 
    stepName, 
    completedSteps, 
    totalSteps 
}: PerformanceProgressBarProps) {
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    return (
        <Card>
            <CardContent className="p-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{stepName}</span>
                    <span className="text-sm text-muted-foreground">{completedSteps} of {totalSteps}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
            </CardContent>
        </Card>
    );
}
