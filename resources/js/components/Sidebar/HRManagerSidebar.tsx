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
    // Try multiple prop names to ensure we get stepStatuses
    const stepStatuses: Record<string, string> = (props as any).stepStatuses 
        || (props as any).mainStepStatuses 
        || (props as any).step_statuses 
        || (props as any).activeProject?.step_statuses
        || {};
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
        
        // For diagnosis step: completed only if approved/locked
        if (stepId === 'diagnosis') {
            if (status && ['approved', 'locked', 'completed'].includes(status)) {
                return 'completed';
            }
            // If submitted but not approved yet, it's current (accessible for review)
            if (status === 'submitted') {
                return 'current';
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
        
        // If step is submitted by HR, it's accessible (not locked) but not completed until CEO approves
        if (status === 'submitted') {
            return 'current'; // Allow HR to view their submitted work
        }
        
        // Check if this is the first step and it's not started yet
        if (stepIndex === 0 && (!status || status === 'not_started')) {
            return 'current';
        }
        
        // Check if previous steps are VERIFIED (approved/locked) to unlock this step
        // Only unlock if CEO survey is completed (for step 2+)
        if (stepIndex > 0) {
            if (!isCeoSurveyCompleted) {
                return 'locked'; // Step 2+ locked until CEO survey
            }
            
            // Check if all previous steps are VERIFIED (approved/locked) to unlock this step
            let allPreviousVerified = true;
            for (let i = 0; i < stepIndex; i++) {
                const prevStep = MAIN_STEPS[i];
                const prevStatus = stepStatuses[prevStep.id];
                
                // For diagnosis, need to be approved/locked (verified)
                if (prevStep.id === 'diagnosis') {
                    const prevDiagnosisStatus = stepStatuses['diagnosis'];
                    // Must be approved or locked (verified) to unlock next step
                    if (!prevDiagnosisStatus || !['approved', 'locked', 'completed'].includes(prevDiagnosisStatus)) {
                        allPreviousVerified = false;
                        break;
                    }
                } else {
                    // For other steps, must be APPROVED/LOCKED (verified) by CEO to unlock next step
                    if (!prevStatus || !['approved', 'locked', 'completed'].includes(prevStatus)) {
                        allPreviousVerified = false;
                        break;
                    }
                }
            }
            
            // If all previous verified and this step is in_progress or not_started, it's current
            if (allPreviousVerified) {
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
    
    // Check if step should actually be locked - match dashboard logic exactly
    // Steps are locked until previous step is VERIFIED (approved/locked)
    const isStepActuallyLocked = (stepId: string): boolean => {
        const status = stepStatuses[stepId] || 'not_started';
        const stepIndex = MAIN_STEPS.findIndex(s => s.id === stepId);
        
        // First step (diagnosis) is never locked
        if (stepIndex === 0) {
            return false;
        }
        
        // If step is currently active, it should NOT be locked (user can be on it)
        if (isStepActive({ id: stepId, route: '', step: 0, title: '', desc: '', icon: CheckCircle2 })) {
            return false;
        }
        
        // If step is submitted, it should NOT be locked (accessible for review/view)
        if (status === 'submitted') {
            return false; // Submitted steps are accessible for HR to view
        }
        
        // If step is verified (approved/locked), it should NOT be locked
        if (status && ['approved', 'locked', 'completed'].includes(status)) {
            return false; // Verified steps are accessible
        }
        
        const ceoPhilosophyStatus = (props as any).ceoPhilosophyStatus || 'not_started';
        const isCeoSurveyCompleted = ceoPhilosophyStatus === 'completed';
        
        // If CEO survey not done, all steps except diagnosis are locked
        if (!isCeoSurveyCompleted && stepId !== 'diagnosis') {
            return true;
        }
        
        // Check if all previous steps are VERIFIED (approved/locked) to unlock this step
        for (let i = 0; i < stepIndex; i++) {
            const prevStep = MAIN_STEPS[i];
            const prevStatus = stepStatuses[prevStep.id];
            
            // Previous step must be VERIFIED (approved/locked) to unlock next step
            // If previous step is not verified (undefined, not_started, in_progress, or submitted), this step is locked
            if (!prevStatus || !['approved', 'locked', 'completed'].includes(prevStatus)) {
                return true; // Locked because previous step is not verified
            }
        }
        
        // If all previous steps are verified, this step is unlocked
        return false;
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
                                                "transition-all duration-200 rounded-lg cursor-not-allowed",
                                                isCollapsed ? "px-3 py-3 justify-center w-full opacity-70" : "px-4 py-6 gap-3 opacity-65"
                                            )}
                                        >
                                            <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "gap-3")}>
                                                <div className={cn(
                                                    "rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                    isCollapsed ? "w-7 h-7 border-sidebar-foreground/50 bg-sidebar-background/60" : "w-6 h-6 border-sidebar-foreground/50 bg-sidebar-background/60"
                                                )}>
                                                    <Lock className={cn(
                                                        "text-sidebar-foreground/60 transition-all duration-200",
                                                        isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"
                                                    )} />
                                                </div>
                                                {!isCollapsed && (
                                                    <div className="flex-1 text-left">
                                                        <span className="text-sm font-medium text-sidebar-foreground/60 block">
                                                            Step {step.step}: {step.title}
                                                        </span>
                                                        <span className="text-xs text-sidebar-foreground/50 mt-0.5 block">
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
                                                isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-6 gap-3",
                                                isCompleted && !isStepActiveState
                                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                                    : isStepActiveState
                                                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                                        : "bg-transparent hover:bg-sidebar-accent"
                                            )}
                                        >
                                            <Link href={getStepRoute(step)} className="flex items-center w-full">
                                                {/* Status Indicator - Green background for completed, icon for others */}
                                                {isCompleted && !isStepActiveState ? (
                                                    <CheckCircle2 className={cn(
                                                        "text-white transition-all duration-200 flex-shrink-0",
                                                        isCollapsed ? "w-5 h-5" : "w-5 h-5"
                                                    )} />
                                                ) : (
                                                    <div className={cn(
                                                        "rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                        isCollapsed ? "w-7 h-7" : "w-6 h-6",
                                                        isStepActiveState 
                                                            ? "bg-sidebar-primary/20 border-sidebar-primary" 
                                                            : "bg-transparent border-sidebar-foreground/20"
                                                    )}>
                                                        {isStepActiveState ? (
                                                            <StepIcon className={cn(
                                                                "transition-all duration-200",
                                                                isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5",
                                                                "text-sidebar-primary"
                                                            )} />
                                                        ) : isCompleted ? (
                                                            <CheckCircle2 className={cn(
                                                                "transition-all duration-200",
                                                                isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5",
                                                                "text-green-600"
                                                            )} />
                                                        ) : (
                                                            <StepIcon className={cn(
                                                                "transition-all duration-200",
                                                                isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5",
                                                                "text-sidebar-foreground/60"
                                                            )} />
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Step Text */}
                                                {!isCollapsed && (
                                                    <div className="flex-1 text-left">
                                                        <span className={cn(
                                                            "text-sm font-medium block",
                                                            isStepActiveState 
                                                                ? "text-sidebar-primary-foreground" 
                                                                : isCompleted 
                                                                    ? "text-white" 
                                                                    : "text-sidebar-foreground"
                                                        )}>
                                                            Step {step.step}: {step.title}
                                                        </span>
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
