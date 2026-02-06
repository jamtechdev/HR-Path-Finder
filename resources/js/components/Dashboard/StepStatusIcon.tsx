import { CheckCircle2, Clock, Lock } from 'lucide-react';
import type { StepStatus } from '@/types/workflow';

interface StepStatusIconProps {
    status: StepStatus;
    isVerified?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

const colorClasses = {
    verified: 'text-green-500',
    submitted: 'text-blue-500',
    default: 'text-gray-400',
};

export default function StepStatusIcon({ status, isVerified = false, size = 'md' }: StepStatusIconProps) {
    const sizeClass = sizeClasses[size];

    if (isVerified || status === 'completed') {
        return <CheckCircle2 className={`${sizeClass} ${colorClasses.verified}`} />;
    }

    if (status === 'submitted' || status === 'in_progress') {
        return <Clock className={`${sizeClass} ${colorClasses.submitted}`} />;
    }

    return <Lock className={`${sizeClass} ${colorClasses.default}`} />;
}
