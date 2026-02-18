import { Link, usePage } from '@inertiajs/react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { CheckCircle2, Lock, Target, DollarSign, Building2, FileText, LayoutGrid, TrendingUp, Award, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HRManagerSidebarProps {
    isCollapsed?: boolean;
}

interface StepConfig {
    id: string;
    step: number;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
}

// Updated step names as per user request - CEO step removed from HR side
const MAIN_STEPS: StepConfig[] = [
    {
        id: 'diagnosis',
        step: 1,
        title: 'Diagnosis (Company info.)',
        desc: 'Input company information, business profile, workforce details, and organizational culture.',
        icon: CheckCircle2,
        route: '/hr-manager/diagnosis',
    },
    {
        id: 'job_analysis',
        step: 2,
        title: 'Job Analysis',
        desc: 'Define job roles, responsibilities, competencies, and organizational mapping.',
        icon: Building2,
        route: '/hr-manager/job-analysis',
    },
    {
        id: 'performance',
        step: 3,
        title: 'Performance.Man.',
        desc: 'Design evaluation units, performance management methods, and assessment structures.',
        icon: Target,
        route: '/hr-manager/performance-system',
    },
    {
        id: 'compensation',
        step: 4,
        title: 'C&B',
        desc: 'Define compensation structure, differentiation methods, and incentive components.',
        icon: DollarSign,
        route: '/hr-manager/compensation-system',
    },
    {
        id: 'hr_policy_os',
        step: 5,
        title: 'HR Policy OS',
        desc: 'HR Policy Manual, System Handbook, Implementation Roadmap, and Analytics Blueprint.',
        icon: Award,
        route: '/hr-manager/hr-policy-os',
    },
];

export default function HRManagerSidebar({ isCollapsed = false }: HRManagerSidebarProps) {
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    
    // Get step statuses and project ID from page props
    const stepStatuses = (props as any).stepStatuses || (props as any).mainStepStatuses || {};
    const projectId = (props as any).projectId || (props as any).project?.id;

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/';
        }
        if (path === '/dashboard') {
            return currentPath === '/dashboard' || currentPath === '/hr-manager/dashboard' || currentPath.startsWith('/hr-manager/dashboard/');
        }
        if (path === '/companies') {
            return currentPath === '/companies' || currentPath.startsWith('/companies/');
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const getStepState = (stepId: string): 'current' | 'locked' | 'completed' => {
        const status = stepStatuses[stepId];
        const stepIndex = MAIN_STEPS.findIndex(s => s.id === stepId);
        const isCurrentlyActive = isStepActive({ id: stepId, route: '', step: 0, title: '', desc: '', icon: CheckCircle2 });
        
        // Check CEO Philosophy status from props
        const ceoPhilosophyStatus = (props as any).ceoPhilosophyStatus || 'not_started';
        const diagnosisStatus = stepStatuses['diagnosis'];
        const isDiagnosisSubmitted = diagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(diagnosisStatus);
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // For diagnosis step: completed only if submitted AND CEO survey is done
        if (stepId === 'diagnosis') {
            if (isDiagnosisSubmitted && isCeoSurveyCompleted) {
                return 'completed';
            }
            if (isDiagnosisSubmitted && !isCeoSurveyCompleted) {
                return 'current'; // Waiting for CEO survey
            }
            if (status && ['approved', 'locked', 'completed'].includes(status)) {
                return 'completed';
            }
        } else {
            // For other steps: completed if approved/locked/completed
            if (status && ['approved', 'locked', 'completed'].includes(status)) {
                return 'completed';
            }
        }
        
        // If this step is currently active (user is on this page), it's current
        if (isCurrentlyActive) {
            return 'current';
        }
        
        // Check if this is the first step and it's not started yet
        if (stepIndex === 0 && (!status || status === 'not_started')) {
            return 'current';
        }
        
        // Check if previous steps are completed to unlock this step
        // Only unlock if CEO survey is completed (for step 2+)
        if (stepIndex > 0) {
            if (!isCeoSurveyCompleted) {
                return 'locked'; // Step 2+ locked until CEO survey
            }
            
            // Check if all previous steps are completed
            let allPreviousCompleted = true;
            for (let i = 0; i < stepIndex; i++) {
                const prevStep = MAIN_STEPS[i];
                const prevStatus = stepStatuses[prevStep.id];
                
                // For diagnosis, need both submitted and CEO survey done
                if (prevStep.id === 'diagnosis') {
                    const prevDiagnosisStatus = stepStatuses['diagnosis'];
                    const prevIsSubmitted = prevDiagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(prevDiagnosisStatus);
                    if (!prevIsSubmitted || !isCeoSurveyCompleted) {
                        allPreviousCompleted = false;
                        break;
                    }
                } else {
                    // For other steps, must be approved/locked/completed
                    if (!prevStatus || !['approved', 'locked', 'completed'].includes(prevStatus)) {
                        allPreviousCompleted = false;
                        break;
                    }
                }
            }
            
            // If all previous completed and this step is in_progress or not_started, it's current
            if (allPreviousCompleted) {
                if (!status || status === 'not_started' || status === 'in_progress') {
                    return 'current';
                }
            } else {
                return 'locked';
            }
        }
        
        // All other steps are locked
        return 'locked';
    };
    
    // Check if step should actually be locked
    const isStepActuallyLocked = (stepId: string): boolean => {
        const diagnosisStatus = stepStatuses['diagnosis'];
        const isDiagnosisSubmitted = diagnosisStatus && ['submitted', 'approved', 'locked', 'completed'].includes(diagnosisStatus);
        const ceoPhilosophyStatus = (props as any).ceoPhilosophyStatus || 'not_started';
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // If diagnosis is submitted but CEO survey not done, all steps except diagnosis are locked
        if (isDiagnosisSubmitted && !isCeoSurveyCompleted && stepId !== 'diagnosis') {
            return true;
        }
        
        // Otherwise use normal lock logic
        const state = getStepState(stepId);
        return state === 'locked';
    };

    const isStepActive = (step: StepConfig): boolean => {
        return currentPath.startsWith(step.route);
    };

    const getStepRoute = (step: StepConfig): string => {
        if (projectId) {
            if (step.id === 'diagnosis') {
                return `${step.route}/${projectId}/overview`;
            }
            if (step.id === 'job_analysis') {
                return `${step.route}/${projectId}/intro`;
            }
            if (step.id === 'performance') {
                return `${step.route}/${projectId}/overview`;
            }
            if (step.id === 'compensation') {
                return `${step.route}/${projectId}/overview`;
            }
            if (step.id === 'tree') {
                return `${step.route}/${projectId}/overview`;
            }
            if (step.id === 'conclusion') {
                return `${step.route}/${projectId}`;
            }
            return `${step.route}/${projectId}`;
        }
        return step.route;
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header - Match dashboard style */}
            <div className={cn(
                "flex items-center border-b border-sidebar-border/30 gap-3 transition-all duration-200",
                isCollapsed ? "h-16 px-4 justify-center" : "h-20 px-6"
            )}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-200">
                    <span className="text-white font-bold text-base">HR</span>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sidebar-foreground text-lg leading-none">HR Path-Finder</span>
                        <span className="text-xs text-sidebar-foreground/60 leading-none">by BetterCompany</span>
                    </div>
                )}
            </div>
            
            {/* Navigation - Match dashboard style */}
            <nav className="flex-1 overflow-y-auto">
                <SidebarGroup className={cn("transition-all duration-200", isCollapsed ? "px-3 py-6" : "px-3 py-8")}>
                    <SidebarMenu className={cn("transition-all duration-200", isCollapsed ? "space-y-2" : "space-y-2")}>
                        {/* Dashboard Menu Item */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive('/dashboard')}
                                className={cn(
                                    "transition-all duration-200 rounded-lg",
                                    isCollapsed ? "px-3 py-3 justify-center w-full" : "px-4 py-6 gap-3"
                                )}
                            >
                                <Link href="/hr-manager/dashboard" className="flex items-center w-full">
                                    <LayoutGrid className={cn("flex-shrink-0 transition-all duration-200", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="font-medium">Dashboard</span>}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Companies Menu Item */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive('/companies')}
                                className={cn(
                                    "transition-all duration-200 rounded-lg",
                                    isCollapsed ? "px-3 py-3 justify-center w-full" : "px-4 py-3 gap-3"
                                )}
                            >
                                <Link href="/companies" className="flex items-center w-full">
                                    <Briefcase className={cn("flex-shrink-0 transition-all duration-200", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="font-medium">Companies</span>}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        {/* Workflow Steps */}
                        {MAIN_STEPS.map((step) => {
                            const state = getStepState(step.id);
                            const status = stepStatuses[step.id] || 'not_started';
                            const isCompleted = state === 'completed';
                            const isActuallyLocked = isStepActuallyLocked(step.id);
                            const isStepActiveState = isStepActive(step);
                            const StepIcon = step.icon;

                            return (
                                <SidebarMenuItem key={step.id}>
                                    {isActuallyLocked ? (
                                        <SidebarMenuButton
                                            disabled
                                            className={cn(
                                                "transition-all duration-200 rounded-lg cursor-not-allowed opacity-50",
                                                isCollapsed ? "px-3 py-3 justify-center w-full" : "px-4 py-6 gap-3"
                                            )}
                                        >
                                            <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "gap-3")}>
                                                <div className={cn(
                                                    "rounded-full border-2 border-sidebar-foreground/20 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                    isCollapsed ? "w-7 h-7" : "w-6 h-6"
                                                )}>
                                                    <Lock className={cn(
                                                        "text-sidebar-foreground/30 transition-all duration-200",
                                                        isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"
                                                    )} />
                                                </div>
                                                {!isCollapsed && (
                                                    <div className="flex-1 text-left">
                                                        <span className="text-sm font-medium text-sidebar-foreground/40 block">
                                                            Step {step.step}: {step.title}
                                                        </span>
                                                        <span className="text-xs text-sidebar-foreground/30 mt-0.5 block">
                                                            Locked
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </SidebarMenuButton>
                                    ) : (
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isStepActiveState}
                                            className={cn(
                                                "transition-all duration-200 rounded-lg w-full",
                                                isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-6 gap-3"
                                            )}
                                        >
                                            <Link href={getStepRoute(step)} className="flex items-center w-full">
                                                {/* Status Indicator - Green dot/circle for completed, icon for others */}
                                                {isCompleted ? (
                                                    <div className={cn(
                                                        "rounded-full bg-success/20 border-2 border-success flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                        isCollapsed ? "w-7 h-7" : "w-6 h-6"
                                                    )}>
                                                        <CheckCircle2 className={cn(
                                                            "text-success transition-all duration-200",
                                                            isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"
                                                        )} />
                                                    </div>
                                                ) : (
                                                    <div className={cn(
                                                        "rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                        isCollapsed ? "w-7 h-7" : "w-6 h-6",
                                                        isStepActiveState 
                                                            ? "bg-sidebar-primary/20 border-sidebar-primary" 
                                                            : "bg-transparent border-sidebar-foreground/20"
                                                    )}>
                                                        <StepIcon className={cn(
                                                            "transition-all duration-200",
                                                            isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5",
                                                            isStepActiveState ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                                                        )} />
                                                    </div>
                                                )}
                                                
                                                {/* Step Text */}
                                                {!isCollapsed && (
                                                    <div className="flex-1 text-left">
                                                        <span className="text-xs font-medium text-sidebar-foreground block">
                                                            Step {step.step}: {step.title}
                                                        </span>
                                                        {isCompleted && (
                                                            <span className="text-xs text-success font-medium mt-0.5 block">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </nav>
        </div>
    );
}
