import { Head, Link, usePage } from '@inertiajs/react';
import {
    TrendingUp,
    Users,
    Calendar,
    ClipboardCheck,
    Building2,
    Target,
    Wallet,
    FileText,
    ArrowRight,
    Lock,
    Check,
} from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';

interface Project {
    id: number;
    step_statuses?: {
        diagnosis?: string;
        organization?: string;
        performance?: string;
        compensation?: string;
    };
}

interface PageProps {
    project: Project | null;
    stepStatuses: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
    progressCount: number;
    currentStepNumber: number;
}

export default function HRManagerDashboard({ project, stepStatuses, progressCount, currentStepNumber }: PageProps) {
    const page = usePage<any>();
    const userName = page.props.auth?.user?.name?.split(' ')[0] || 'Sarah';
    
    const getStepState = (step: string): 'current' | 'locked' | 'completed' => {
        const status = stepStatuses[step as keyof typeof stepStatuses] || 'not_started';
        
        if (status === 'submitted') {
            return 'completed';
        }
        
        if (status === 'in_progress') {
            return 'current';
        }
        
        // Check if step is unlocked
        const stepOrder = ['diagnosis', 'organization', 'performance', 'compensation'];
        const stepIndex = stepOrder.indexOf(step);
        
        if (stepIndex === 0) {
            // First step (diagnosis) is always available
            return 'current';
        }
        
        // For steps 2, 3, 4: Check if previous step is submitted
        // If previous step is submitted, next step is unlocked (can be started)
        const previousStep = stepOrder[stepIndex - 1];
        const previousStatus = stepStatuses[previousStep as keyof typeof stepStatuses] || 'not_started';
        
        // Step is unlocked only if previous step is submitted (verified by CEO)
        if (previousStatus === 'submitted') {
            // Next step is unlocked and can be started
            return status === 'not_started' ? 'current' : status === 'in_progress' ? 'current' : 'current';
        }
        
        // By default, steps 2, 3, 4 are locked until previous step is submitted
        return 'locked';
    };

    const getStepBadge = (step: string) => {
        const status = stepStatuses[step as keyof typeof stepStatuses] || 'not_started';
        
        if (status === 'submitted') {
            return 'Submitted';
        }
        
        if (status === 'in_progress') {
            return 'In Progress';
        }
        
        const state = getStepState(step);
        if (state === 'locked') {
            return 'Locked';
        }
        
        return 'Not Started';
    };

    const getStepRoute = (step: string) => {
        const routes: Record<string, string> = {
            'diagnosis': '/diagnosis',
            'organization': '/step2',
            'performance': '/step3',
            'compensation': '/step4',
        };
        
        return routes[step] || '#';
    };

    const stepCards = [
        {
            id: 'diagnosis',
            step: 1,
            title: 'Diagnosis',
            desc: 'Input company information, business profile, workforce details, and organizational culture.',
            icon: ClipboardCheck,
        },
        {
            id: 'organization',
            step: 2,
            title: 'Organization Design',
            desc: 'Define organization structure, job grades, titles, and managerial roles.',
            icon: Building2,
        },
        {
            id: 'performance',
            step: 3,
            title: 'Performance System',
            desc: 'Design evaluation units, performance management methods, and assessment structures.',
            icon: Target,
        },
        {
            id: 'compensation',
            step: 4,
            title: 'Compensation System',
            desc: 'Define compensation structure, differentiation methods, and incentive components.',
            icon: Wallet,
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Head title="HR Manager Dashboard" />
                
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-display font-bold tracking-tight">Welcome back, {userName}</h1>
                                </div>
                                <p className="text-muted-foreground mt-1">Continue building your company's HR system</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Progress</p>
                                    <p className="text-2xl font-bold">{progressCount} / 4</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">CEO Survey</p>
                                    <p className="text-2xl font-bold text-foreground">Locked</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Step</p>
                                    <p className="text-2xl font-bold">Step {currentStepNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Tracker */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6 pb-4">
                            <h3 className="font-semibold tracking-tight text-lg">HR System Design Progress</h3>
                        </div>
                        <div className="p-3 md:p-6 pt-0">
                            <div className="flex items-center justify-between gap-2">
                                {stepCards.map((step, index) => {
                                    const state = getStepState(step.id);
                                    const isCurrent = state === 'current';
                                    const isComplete = state === 'completed';
                                    const isLocked = state === 'locked';
                                    const Icon = isComplete ? Check : step.icon;
                                    return (
                                        <div key={step.id} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                        isComplete
                                                            ? 'bg-success/10 text-success border-success'
                                                            : isCurrent
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'bg-muted text-muted-foreground border-border'
                                                    }`}
                                                >
                                                    {isComplete ? (
                                                        <Icon className="w-4 h-4" />
                                                    ) : isLocked ? (
                                                        <Lock className="w-4 h-4" />
                                                    ) : (
                                                        <span className="text-sm font-semibold">{step.step}</span>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <p
                                                        className={`text-xs font-medium ${
                                                            isCurrent || isComplete
                                                                ? 'text-foreground'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {step.step === 1 ? step.step + ' ' + step.title : step.title}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < stepCards.length - 1 && (
                                                <div className={`flex-1 h-0.5 mx-3 transition-colors duration-300 hidden md:block ${
                                                    isComplete ? 'bg-success' : 'bg-border'
                                                }`}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Design Steps */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Design Steps</h2>
                        <div className="grid gap-4">
                            {stepCards.map((card) => {
                                const state = getStepState(card.id);
                                const Icon = state === 'completed' ? Check : card.icon;
                                const badge = getStepBadge(card.id);
                                const isLocked = state === 'locked';
                                const route = getStepRoute(card.id);
                                const status = stepStatuses[card.id as keyof typeof stepStatuses] || 'not_started';
                                const buttonLabel = status === 'submitted' ? 'View' : 'Continue';

                                return (
                                    <Link
                                        key={card.id}
                                        href={isLocked ? '#' : route}
                                        onClick={(event) => {
                                            if (isLocked) {
                                                event.preventDefault();
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
                                                            Step {card.step}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                                state === 'completed'
                                                                    ? 'bg-success/10 text-success'
                                                                    : state === 'current'
                                                                    ? 'bg-primary/10 text-primary'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {badge}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-lg mb-1 truncate">{card.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{card.desc}</p>
                                                </div>
                                                {!isLocked && (
                                                    <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 flex-shrink-0">
                                                        {buttonLabel}
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* CTA Section */}
                    <div className="rounded-lg border bg-card shadow-sm gradient-primary text-white">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">Ready to continue?</h3>
                                <p className="text-white/80">
                                    Pick up where you left off and complete your HR system design.
                                </p>
                            </div>
                            <Link
                                href="/diagnosis"
                                className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 rounded-md px-8 whitespace-nowrap"
                            >
                                Continue Step 1
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}