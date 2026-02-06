import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FileText, ArrowRight } from 'lucide-react';
import StepVerificationItem from './StepVerificationItem';
import type { StepStatuses, VerifiedSteps, HrProject } from '@/types/dashboard';
import { STEP_LABELS, STEP_ORDER } from '@/types/workflow';

interface HRSystemProgressCardProps {
    stepStatuses: StepStatuses;
    verifiedSteps: VerifiedSteps;
    pendingVerifications: string[];
    project: HrProject | null;
    onVerify: (step: string) => void;
}

export default function HRSystemProgressCard({
    stepStatuses,
    verifiedSteps,
    pendingVerifications,
    project,
    onVerify,
}: HRSystemProgressCardProps) {
    const allStepsComplete = Object.values(stepStatuses).every(status =>
        status === 'submitted' || status === 'completed'
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>HR System Design Progress</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {STEP_ORDER.map((stepKey) => {
                    const status = stepStatuses[stepKey] as string;
                    const isVerified = verifiedSteps[stepKey];
                    const isPending = pendingVerifications.includes(stepKey);

                    return (
                        <StepVerificationItem
                            key={stepKey}
                            step={stepKey}
                            label={STEP_LABELS[stepKey]}
                            status={status as any}
                            isVerified={isVerified}
                            isPending={isPending}
                            onVerify={onVerify}
                        />
                    );
                })}
                {allStepsComplete && project && (
                    <Link href={`/hr-projects/${project.id}/overview`}>
                        <Button size="lg" className="w-full mt-4">
                            <FileText className="w-4 h-4 mr-2" />
                            Review Full System
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
