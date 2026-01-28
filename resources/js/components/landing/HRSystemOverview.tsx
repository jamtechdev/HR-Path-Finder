import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function HRSystemOverview() {
    const steps = [
        { id: 1, name: 'Diagnosis', completed: true },
        { id: 2, name: 'Organization', completed: true },
        { id: 3, name: 'Performance', completed: true },
        { id: 4, name: 'Compensation', completed: true },
    ];

    return (
        <Card className="bg-slate-900 text-white py-0">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">HR System Overview</CardTitle>
                    <span className="text-sm text-slate-400">4/4 Complete</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3">
                            <CheckCircle2 className="size-5 text-brand-green" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Step {step.id}: {step.name}</p>
                            </div>
                            <span className="text-xs text-brand-green">Completed</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CEO Alignment</span>
                        <span className="text-sm text-brand-green">High</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full w-4/5 bg-brand-green" />
                    </div>
                    <p className="text-xs text-slate-400">
                        Your HR system design aligns well with CEO management philosophy
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
