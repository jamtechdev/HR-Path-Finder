import { Head, Link, router } from '@inertiajs/react';
import { Target, ArrowRight, FileText, Users, BarChart3, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PerformanceHeader from '@/components/Performance/PerformanceHeader';
import PerformanceProgressBar from '@/components/Performance/PerformanceProgressBar';
import PerformanceTabs, { TabId } from '@/components/Performance/PerformanceTabs';

interface Company {
    id: number;
    name: string;
}

interface OrganizationDesign {
    id?: number;
    structure_type?: string | null;
    job_grade_structure?: string | null;
}

interface PerformanceSystem {
    id?: number;
    performance_unit?: string | null;
    performance_method?: string | null;
    evaluation_structure_quantitative?: string | null;
    evaluation_structure_relative?: string | null;
}

interface Project {
    id: number;
    status: string;
    performance_system?: PerformanceSystem | null;
    organization_design?: OrganizationDesign | null;
}

interface PageProps {
    company: Company | null;
    project: Project | null;
}

const stepOrder = ['evaluation-unit', 'performance-method', 'evaluation-structure', 'review'] as const;

export default function PerformanceOverview({ company, project }: PageProps) {
    const currentProject = project;

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        (!company || !currentProject || !currentProject.performance_system) ? 'not_started' : 
        currentProject.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    const stepStatus = {
        'evaluation-unit': Boolean(currentProject?.performance_system?.performance_unit),
        'performance-method': Boolean(currentProject?.performance_system?.performance_method),
        'evaluation-structure': Boolean(
            currentProject?.performance_system?.evaluation_structure_quantitative && 
            currentProject?.performance_system?.evaluation_structure_relative
        ),
        'review': Boolean(currentProject?.performance_system && currentProject.performance_system.performance_unit),
    };

    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 4; // Overview + 3 steps + Review

    const handleStartDesign = () => {
        if (currentProject?.id) {
            router.visit(`/step3/${currentProject.id}/evaluation-unit`);
        } else {
            router.visit('/step3');
        }
    };

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/step3` },
        { id: 'evaluation-unit' as TabId, name: 'Evaluation Unit', icon: Users, route: currentProject?.id ? `/step3/${currentProject.id}/evaluation-unit` : '#' },
        { id: 'performance-method' as TabId, name: 'Performance Method', icon: Target, route: currentProject?.id ? `/step3/${currentProject.id}/performance-method` : '#' },
        { id: 'evaluation-structure' as TabId, name: 'Evaluation Structure', icon: BarChart3, route: currentProject?.id ? `/step3/${currentProject.id}/evaluation-structure` : '#' },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: currentProject?.id ? `/step3/${currentProject.id}/review` : '#' },
    ];

    if (!company || !currentProject) {
        return (
            <div className="flex h-screen bg-background">
                <RoleBasedSidebar />
                <main className="flex-1 overflow-auto md:pt-0 pt-14 flex items-center justify-center">
                    <div>Please complete Step 2: Organization Design first.</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Step 3: Performance System" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <PerformanceHeader
                        title="Step 3: Performance System"
                        description="Design your performance evaluation framework"
                        status={status}
                        backHref="/hr-manager/dashboard"
                        organizationDesign={currentProject.organization_design}
                    />

                    <PerformanceProgressBar
                        stepName="Overview"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <PerformanceTabs
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
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-2">Performance System Design</h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto">
                                        Design your performance evaluation framework including evaluation units, management methods (KPI/MBO/OKR/BSC), and assessment structures.
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
