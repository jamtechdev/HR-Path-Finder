import { Button } from '@/components/ui/button';
import StepStatusBadge from '@/components/Dashboard/StepStatusBadge';
import StepStatusIcon from '@/components/Dashboard/StepStatusIcon';
import type { StepKey, StepStatus } from '@/types/workflow';

interface StepVerificationItemProps {
    step: StepKey;
    label: string;
    status: StepStatus;
    isVerified: boolean;
    isPending: boolean;
    onVerify?: (step: StepKey) => void;
}

export default function StepVerificationItem({
    step,
    label,
    status,
    isVerified,
    isPending,
    onVerify,
}: StepVerificationItemProps) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <StepStatusIcon status={status} isVerified={isVerified} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <StepStatusBadge status={status} isVerified={isVerified} isPending={isPending} />
                {isPending && onVerify && (
                    <Button
                        size="sm"
                        onClick={() => onVerify(step)}
                        className="ml-2"
                    >
                        Verify
                    </Button>
                )}
            </div>
        </div>
    );
}
