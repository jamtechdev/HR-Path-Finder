import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { CheckCircle2, Lock, FileText, Briefcase, Settings, DollarSign, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStepsSidebarProps {
    stepStatuses?: Record<string, string>;
    projectId?: number;
    activePath?: string;
}

interface StepConfig {
    id: string;
    step: number;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
}

const MAIN_STEPS: StepConfig[] = [
    {
        id: 'diagnosis',
        step: 1,
        title: 'Diagnosis (Company info.)',
        desc: 'Input company information, business profile, workforce details, and organizational culture.',
        icon: FileText,
        route: '/hr-manager/diagnosis',
    },
    {
        id: 'job_analysis',
        step: 2,
        title: 'Job Analysis',
        desc: 'Define job roles, responsibilities, competencies, and organizational mapping.',
        icon: Briefcase,
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

export default function WorkflowStepsSidebar({ 
    stepStatuses = {}, 
    projectId,
    activePath 
}: WorkflowStepsSidebarProps) {
    const { url } = usePage();
    const currentPath = activePath || url.split('?')[0];

    const getStepState = (stepId: string): 'current' | 'locked' | 'completed' => {
        const status = stepStatuses[stepId];
        const stepIndex = MAIN_STEPS.findIndex(s => s.id === stepId);
        
        if (status && ['submitted', 'approved', 'locked'].includes(status)) {
            return 'completed';
        }
        
        // Check if previous steps are completed
        if (stepIndex > 0) {
            const prevStep = MAIN_STEPS[stepIndex - 1];
            const prevStatus = stepStatuses[prevStep.id];
            if (!prevStatus || !['submitted', 'approved', 'locked'].includes(prevStatus)) {
                return 'locked';
            }
        }
        
        return stepIndex === 0 ? 'current' : (status === 'in_progress' ? 'current' : 'locked');
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
        <SidebarGroup className="px-4 py-5">
           
            <SidebarMenu className="space-y-1">
                {MAIN_STEPS.map((step) => {
                    const state = getStepState(step.id);
                    const status = stepStatuses[step.id] || 'not_started';
                    const isCompleted = state === 'completed';
                    const isLocked = state === 'locked';
                    const isActive = isStepActive(step);
                    const StepIcon = step.icon;

                    return (
                        <SidebarMenuItem key={step.id}>
                            {isLocked ? (
                                <SidebarMenuButton
                                    disabled
                                    className="px-3 py-2.5 opacity-50 cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-5 h-5 rounded-full border-2 border-sidebar-foreground/20 flex items-center justify-center flex-shrink-0">
                                            <Lock className="w-3 h-3 text-sidebar-foreground/30" />
                                        </div>
                                        <span className="text-sm font-medium text-sidebar-foreground/40">
                                            Step {step.step}: {step.title}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    className="px-3 py-2.5 w-full"
                                >
                                    <Link href={getStepRoute(step)}>
                                        <div className="flex items-center gap-3 w-full">
                                            {/* Status Indicator - Green circle for completed, icon for others */}
                                            {isCompleted ? (
                                                <div className="w-5 h-5 rounded-full bg-success/20 border-2 border-success flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-3 h-3 text-success" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                                    isActive 
                                                        ? "bg-sidebar-primary/20 border-sidebar-primary" 
                                                        : "bg-transparent border-sidebar-foreground/20"
                                                )}>
                                                    <StepIcon className={cn(
                                                        "w-3 h-3 transition-colors",
                                                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                                                    )} />
                                                </div>
                                            )}
                                            
                                            {/* Step Text */}
                                            <span className="text-sm font-medium text-sidebar-foreground flex-1 text-left">
                                                Step {step.step}: {step.title}
                                            </span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
