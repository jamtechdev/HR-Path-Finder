import { Link } from '@inertiajs/react';
import { ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import type { StepKey, StepStatus } from '@/types/workflow';
import type { VerifiedSteps } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface StepCardProps {
    step: {
        id: StepKey;
        step: number;
        title: string;
        desc: string;
        icon: React.ComponentType<{ className?: string }>;
    };
    state: 'current' | 'locked' | 'completed';
    status: StepStatus;
    isVerified: boolean;
    route: string;
    onClick?: (event: React.MouseEvent) => void;
}

export default function StepCard({ step, state, status, isVerified, route, onClick }: StepCardProps) {
    const isLocked = state === 'locked';
    const Icon = state === 'completed' ? CheckCircle2 : step.icon;
    // Show "Review" for completed steps, "Continue" for current/in-progress steps
    const buttonLabel = (state === 'completed' || status === 'submitted' || status === 'approved' || status === 'locked' || status === 'completed') ? 'Review' : 'Continue';

    const getStatusText = () => {
        if (status === 'submitted' || status === 'completed' || status === 'approved' || status === 'locked') return 'Completed';
        if (status === 'in_progress') return 'In Progress';
        if (status === 'not_started' && state === 'current') return 'Not Started';
        return 'Locked';
    };

    const cardContent = (
        <div className="p-6">
            <div className="flex items-center gap-5">
                {/* Icon */}
                <div
                    className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                        state === 'completed'
                            ? 'bg-green-500/10 text-green-600 border-2 border-green-500/20'
                            : state === 'current'
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : isLocked
                            ? 'bg-muted/60 text-muted-foreground/60'
                            : 'bg-muted/40 text-muted-foreground'
                    )}
                >
                    {isLocked ? (
                        <Lock className="w-6 h-6" />
                    ) : (
                        <Icon className={cn(
                            'w-6 h-6',
                            state === 'completed' && 'text-green-600'
                        )} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Step {step.step}
                        </span>
                        <span
                            className={cn(
                                'text-xs font-medium px-3 py-1 rounded-full',
                                status === 'completed' || status === 'submitted' || status === 'approved' || status === 'locked'
                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                    : status === 'in_progress'
                                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                    : isLocked
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            {getStatusText()}
                        </span>
                        {isVerified && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                Verified
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg mb-1.5 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>

                {/* Action Button - Only show for completed or current steps */}
                {!isLocked && (
                    <div className="flex-shrink-0">
                        {state === 'completed' ? (
                            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-green-600 text-white hover:bg-green-700 h-9 rounded-lg px-4 shadow-sm hover:shadow-md transition-all duration-200">
                                <CheckCircle2 className="w-4 h-4" />
                                Review
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-lg px-4 shadow-sm hover:shadow-md transition-all duration-200">
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    if (isLocked) {
        return (
            <div
                className={cn(
                    'relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 opacity-75 cursor-not-allowed border-border/40 bg-muted/30'
                )}
            >
                {cardContent}
            </div>
        );
    }

    return (
        <Link
            href={route}
            onClick={onClick}
            className={cn(
                'group block relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer border-border',
                state === 'current' && 'border-primary/40 shadow-md ring-1 ring-primary/10'
            )}
        >
            {cardContent}
        </Link>
    );
}
