import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import type { StepStatus } from '@/types/workflow';

interface StepStatusBadgeProps {
    status: StepStatus;
    isVerified?: boolean;
    isPending?: boolean;
}

export default function StepStatusBadge({ status, isVerified = false, isPending = false }: StepStatusBadgeProps) {
    if (isVerified) {
        return (
            <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified
            </Badge>
        );
    }

    if (isPending) {
        return (
            <Badge className="bg-orange-500 text-white">
                <Clock className="w-3 h-3 mr-1" />
                Pending Verification
            </Badge>
        );
    }

    if (status === 'submitted') {
        return (
            <Badge className="bg-blue-500 text-white">
                <Clock className="w-3 h-3 mr-1" />
                Submitted
            </Badge>
        );
    }

    if (status === 'in_progress') {
        return (
            <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
            </Badge>
        );
    }

    if (status === 'completed') {
        return (
            <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
            </Badge>
        );
    }

    return (
        <Badge variant="outline">
            <Lock className="w-3 h-3 mr-1" />
            Not Started
        </Badge>
    );
}
