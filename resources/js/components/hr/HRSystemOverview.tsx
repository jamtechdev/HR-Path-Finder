import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Step {
    id: number;
    name: string;
    completed: boolean;
}

interface HRSystemOverviewProps {
    steps: Step[];
    alignmentScore?: string;
    companyLogo?: string;
}

export function HRSystemOverview({ steps, alignmentScore = 'Medium', companyLogo }: HRSystemOverviewProps) {
    const completedCount = steps.filter((s) => s.completed).length;
    const totalSteps = steps.length;
    const progress = (completedCount / totalSteps) * 100;

    const alignmentPercentage = alignmentScore === 'High' ? 85 : alignmentScore === 'Medium' ? 60 : 40;

    return (
        <Card className="bg-slate-900 text-white">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">HR System Overview</CardTitle>
                    <span className="text-sm text-slate-400">
                        {completedCount}/{totalSteps} Complete
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3">
                            <CheckCircle2
                                className={step.completed ? 'size-5 text-brand-green' : 'size-5 text-slate-600'}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Step {step.id}: {step.name}</p>
                            </div>
                            {step.completed && (
                                <span className="text-xs text-brand-green">Completed</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CEO Alignment</span>
                        <span className="text-sm text-brand-green">{alignmentScore}</span>
                    </div>
                    <Progress value={alignmentPercentage} className="h-2" />
                    <p className="text-xs text-slate-400">
                        Your HR system design aligns {alignmentScore.toLowerCase()} with CEO management philosophy
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
