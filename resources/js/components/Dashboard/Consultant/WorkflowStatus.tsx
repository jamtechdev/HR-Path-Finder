import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkflowStatusProps {
    workflowStatus: {
        step1: number;
        step2: number;
        step3: number;
        step4: number;
    };
}

const steps = [
    { key: 'step1', label: 'Step 1: Diagnosis' },
    { key: 'step2', label: 'Step 2: Organization' },
    { key: 'step3', label: 'Step 3: Performance' },
    { key: 'step4', label: 'Step 4: Compensation' },
];

export default function WorkflowStatus({ workflowStatus }: WorkflowStatusProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Workflow Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {steps.map((step) => {
                        const count = workflowStatus[step.key as keyof typeof workflowStatus] || 0;
                        return (
                            <div key={step.key} className="p-4 border rounded-lg">
                                <p className="text-sm font-medium mb-2">{step.label}</p>
                                <Badge className="bg-blue-500 text-white">
                                    {count} Submitted
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
