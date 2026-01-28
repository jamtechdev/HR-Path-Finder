import { Head, Link, router } from '@inertiajs/react';
import { Wallet, ArrowRight, FileText, Building2, TrendingUp, Gift, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CompensationHeader from '@/components/Compensation/CompensationHeader';
import CompensationProgressBar from '@/components/Compensation/CompensationProgressBar';
import CompensationTabs, { TabId } from '@/components/Compensation/CompensationTabs';

interface Company {
    id: number;
    name: string;
}

interface PerformanceSystem {
    id?: number;
    performance_method?: string | null;
    performance_unit?: string | null;
}

interface CompensationSystem {
    id?: number;
    compensation_structure?: string | null;
    differentiation_method?: string | null;
    incentive_components?: string[] | null;
}

interface Project {
    id: number;
    status: string;
    compensation_system?: CompensationSystem | null;
    performance_system?: PerformanceSystem | null;
}

interface PageProps {
    company: Company | null;
    project: Project | null;
}

const stepOrder = ['compensation-structure', 'differentiation-method', 'incentive-components', 'review'] as const;

export default function CompensationOverview({ company, project }: PageProps) {
    const currentProject = project;

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        (!company || !currentProject || !currentProject.compensation_system) ? 'not_started' : 
        currentProject.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    const stepStatus = {
        'compensation-structure': Boolean(currentProject?.compensation_system?.compensation_structure),
        'differentiation-method': Boolean(currentProject?.compensation_system?.differentiation_method),
        'incentive-components': Boolean(
            currentProject?.compensation_system?.incentive_components && 
            Array.isArray(currentProject.compensation_system.incentive_components) &&
            currentProject.compensation_system.incentive_components.length > 0
        ),
        'review': Boolean(currentProject?.compensation_system && currentProject.compensation_system.compensation_structure),
    };

    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 4; // Overview + 3 steps + Review

    const handleStartDesign = () => {
        if (currentProject?.id) {
            router.visit(`/step4/${currentProject.id}/compensation-structure`);
        } else {
            router.visit('/step4');
        }
    };

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/step4` },
        { id: 'compensation-structure' as TabId, name: 'Compensation Structure', icon: Building2, route: currentProject?.id ? `/step4/${currentProject.id}/compensation-structure` : '#' },
        { id: 'differentiation-method' as TabId, name: 'Differentiation Method', icon: TrendingUp, route: currentProject?.id ? `/step4/${currentProject.id}/differentiation-method` : '#' },
        { id: 'incentive-components' as TabId, name: 'Incentive Components', icon: Gift, route: currentProject?.id ? `/step4/${currentProject.id}/incentive-components` : '#' },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: currentProject?.id ? `/step4/${currentProject.id}/review` : '#' },
    ];

    if (!company || !currentProject) {
        return (
            <div className="flex h-screen bg-background">
                <RoleBasedSidebar />
                <main className="flex-1 overflow-auto md:pt-0 pt-14 flex items-center justify-center">
                    <div>Please complete Step 3: Performance System first.</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Step 4: Compensation System" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <CompensationHeader
                        title="Step 4: Compensation System"
                        description="Design your compensation and rewards framework"
                        status={status}
                        backHref="/hr-manager/dashboard"
                        performanceSystem={currentProject.performance_system}
                    />

                    <CompensationProgressBar
                        stepName="Overview"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <CompensationTabs
                        tabs={tabs}
                        activeTab="overview"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={currentProject.id}
                    />

                    {/* Overview Card */}
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-2">Compensation System Design</h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto">
                                        Design your compensation structure, differentiation methods, and incentive components based on your performance system design.
                                    </p>
                                </div>

                                {/* Start Button */}
                                <Button 
                                    onClick={handleStartDesign}
                                    size="lg"
                                    className="mt-6 h-11 px-8"
                                >
                                    Start Design
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
