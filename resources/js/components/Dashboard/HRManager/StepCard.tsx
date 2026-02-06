import { Link } from '@inertiajs/react';
import { ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import type { StepKey, StepStatus } from '@/types/workflow';
import type { VerifiedSteps } from '@/types/dashboard';

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
    const buttonLabel = (status === 'completed' || status === 'submitted') ? 'View' : 'Continue';

    return (
        <Link
            href={isLocked ? '#' : route}
            onClick={(event) => {
                if (isLocked) {
                    event.preventDefault();
                }
                if (onClick) {
                    onClick(event);
                }
            }}
            aria-disabled={isLocked}
            className={`rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all duration-300 ${
                isLocked ? 'opacity-60 cursor-not-allowed' : 'card-hover cursor-pointer'
            } ${state === 'current' ? 'ring-2 ring-primary/20' : ''}`}
        >
            <div className="p-6">
                <div className="flex items-start gap-4 flex-col md:flex-row">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            state === 'completed'
                                ? 'bg-success/10 text-success'
                                : state === 'current'
                                ? 'gradient-primary text-white shadow-glow'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {isLocked ? <Lock className="w-5 h-5" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                Step {step.step}
                            </span>
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    status === 'completed' || status === 'submitted'
                                        ? 'bg-success/10 text-success'
                                        : status === 'in_progress'
                                        ? 'bg-primary/10 text-primary'
                                        : status === 'not_started' && state === 'current'
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {status === 'completed' || status === 'submitted' 
                                    ? 'Completed' 
                                    : status === 'in_progress' 
                                    ? 'In Progress' 
                                    : status === 'not_started' && state === 'current'
                                    ? 'Not Started'
                                    : 'Locked'}
                            </span>
                            {isVerified && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1 truncate">{step.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{step.desc}</p>
                    </div>
                    {!isLocked && (
                        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-primary text-white hover:bg-primary/90 h-9 rounded-md px-3 flex-shrink-0 transition-colors">
                            {buttonLabel}
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
