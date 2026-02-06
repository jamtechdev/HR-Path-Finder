import { Head, usePage } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SMTPWarning from '@/components/Dashboard/SMTPWarning';
import StatsCards from '@/components/Dashboard/HRManager/StatsCards';
import ProgressTracker from '@/components/Dashboard/HRManager/ProgressTracker';
import StepCard from '@/components/Dashboard/HRManager/StepCard';
import CTASection from '@/components/Dashboard/HRManager/CTASection';
import { ClipboardCheck, Building2, Target, Wallet } from 'lucide-react';
import type { StepStatuses, VerifiedSteps, HrProject } from '@/types/dashboard';
import type { StepKey } from '@/types/workflow';

interface Project {
    id: number;
    step_statuses?: StepStatuses;
}

interface PageProps {
    project: Project | null;
    stepStatuses: StepStatuses;
    verifiedSteps?: VerifiedSteps;
    progressCount: number;
    currentStepNumber: number;
    smtpConfigured?: boolean;
}

const stepCards = [
    {
        id: 'diagnosis' as StepKey,
        step: 1,
        title: 'Diagnosis',
        desc: 'Input company information, business profile, workforce details, and organizational culture.',
        icon: ClipboardCheck,
    },
    {
        id: 'organization' as StepKey,
        step: 2,
        title: 'Organization Design',
        desc: 'Define organization structure, job grades, titles, and managerial roles.',
        icon: Building2,
    },
    {
        id: 'performance' as StepKey,
        step: 3,
        title: 'Performance System',
        desc: 'Design evaluation units, performance management methods, and assessment structures.',
        icon: Target,
    },
    {
        id: 'compensation' as StepKey,
        step: 4,
        title: 'Compensation System',
        desc: 'Define compensation structure, differentiation methods, and incentive components.',
        icon: Wallet,
    },
];

export default function HRManagerDashboard({
    project,
    stepStatuses,
    verifiedSteps = {
        diagnosis: false,
        organization: false,
        performance: false,
        compensation: false,
    },
    progressCount,
    currentStepNumber,
    smtpConfigured = true,
}: PageProps) {
    const page = usePage<any>();
    const userName = page.props.auth?.user?.name?.split(' ')[0] || 'Sarah';
    
    const getStepState = (step: StepKey): 'current' | 'locked' | 'completed' => {
        const status = stepStatuses[step] || 'not_started';
        
        if (status === 'completed') {
            return 'completed';
        }
        
        const stepOrder: StepKey[] = ['diagnosis', 'organization', 'performance', 'compensation'];
        const stepIndex = stepOrder.indexOf(step);
        
        // First step (diagnosis) is always available, but check if it's actually started
        if (stepIndex === 0) {
            // If not_started, it's still 'current' (unlocked) but will show "Not Started" badge
            return 'current';
        }
        
        // For other steps, check if previous step is completed (verified by CEO)
        // Step 2 (Organization) requires Step 1 (Diagnosis) to be 'completed' (not just 'submitted')
        const previousStep = stepOrder[stepIndex - 1];
        const previousStatus = stepStatuses[previousStep] || 'not_started';
        
        // Only unlock if previous step is 'completed' (CEO verified)
        // 'submitted' means waiting for CEO verification, so it should remain locked
        if (previousStatus === 'completed') {
            return status === 'submitted' ? 'completed' : 'current';
        }
        
        return 'locked';
    };

    const getStepRoute = (step: StepKey) => {
        // Diagnosis route is always available, even without a project
        if (step === 'diagnosis') {
            return '/hr-manager/diagnosis/overview';
        }
        
        // Other steps require a project
        if (!project) {
            return '#';
        }
        
        const routes: Record<StepKey, string> = {
            'diagnosis': '/hr-manager/diagnosis/overview',
            'organization': `/hr-projects/${project.id}/organization-design`,
            'performance': `/hr-projects/${project.id}/performance-system`,
            'compensation': `/hr-projects/${project.id}/compensation-system`,
        };
        
        return routes[step] || '#';
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="HR Manager Dashboard" />
                    
                    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                        {!smtpConfigured && <SMTPWarning />}
                        
                        <DashboardHeader
                            title={`Welcome back, ${userName}`}
                            subtitle="Continue building your company's HR system"
                            userName={userName}
                        />
                        
                        <StatsCards
                            progressCount={progressCount}
                            currentStepNumber={currentStepNumber}
                        />
                        
                        <ProgressTracker
                            stepCards={stepCards}
                            stepStatuses={stepStatuses}
                            getStepState={getStepState}
                        />
                        
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Design Steps</h2>
                            <div className="grid gap-4">
                                {stepCards.map((card) => {
                                    const state = getStepState(card.id);
                                    const status = stepStatuses[card.id] || 'not_started';
                                    const isVerified = verifiedSteps[card.id];
                                    const route = getStepRoute(card.id);

                                    return (
                                        <StepCard
                                            key={card.id}
                                            step={card}
                                            state={state}
                                            status={status as any}
                                            isVerified={isVerified}
                                            route={route}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        
                        <CTASection
                            progressCount={progressCount}
                            project={project as HrProject | null}
                            currentStepNumber={currentStepNumber}
                        />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
