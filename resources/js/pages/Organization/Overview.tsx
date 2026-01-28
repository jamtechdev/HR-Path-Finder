import { Head, Link, router } from '@inertiajs/react';
import { Building2, ArrowRight, FileText, Layers, Link2, Users, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OrganizationHeader from '@/components/Organization/OrganizationHeader';
import OrganizationProgressBar from '@/components/Organization/OrganizationProgressBar';
import OrganizationTabs, { TabId } from '@/components/Organization/OrganizationTabs';

interface Company {
    id: number;
    name: string;
}

interface CeoPhilosophy {
    id?: number;
    main_trait?: string | null;
    sub_trait?: string | null;
}

interface OrganizationDesign {
    id?: number;
    structure_type?: string | null;
    job_grade_structure?: string | null;
    grade_title_relationship?: string | null;
    managerial_role_definition?: string | null;
}

interface Project {
    id: number;
    status: string;
    organization_design?: OrganizationDesign | null;
    ceo_philosophy?: CeoPhilosophy | null;
}

interface PageProps {
    company: Company | null;
    project: Project | null;
}

const stepOrder = ['organization-structure', 'job-grade-structure', 'grade-title-relationship', 'managerial-definition', 'review'] as const;

export default function OrganizationOverview({ company, project }: PageProps) {
    // Always show Overview page - no redirects
    const currentProject = project;

    // Determine status
    const status: 'not_started' | 'in_progress' | 'submitted' = 
        (!company || !currentProject || !currentProject.organization_design) ? 'not_started' : 
        currentProject.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    // Calculate step completion status
    const stepStatus = {
        'organization-structure': Boolean(currentProject?.organization_design?.structure_type),
        'job-grade-structure': Boolean(currentProject?.organization_design?.job_grade_structure),
        'grade-title-relationship': Boolean(currentProject?.organization_design?.grade_title_relationship),
        'managerial-definition': Boolean(currentProject?.organization_design?.managerial_role_definition),
        'review': Boolean(currentProject?.organization_design && currentProject.organization_design.structure_type),
    };

    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 5; // Overview + 4 steps + Review

    const handleStartDesign = () => {
        if (currentProject?.id) {
            router.visit(`/step2/${currentProject.id}/organization-structure`);
        } else {
            router.visit('/step2');
        }
    };

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/step2` },
        { id: 'organization-structure' as TabId, name: 'Organization Structure', icon: Building2, route: currentProject?.id ? `/step2/${currentProject.id}/organization-structure` : '#' },
        { id: 'job-grade-structure' as TabId, name: 'Job Grade Structure', icon: Layers, route: currentProject?.id ? `/step2/${currentProject.id}/job-grade-structure` : '#' },
        { id: 'grade-title-relationship' as TabId, name: 'Grade-Title Relationship', icon: Link2, route: currentProject?.id ? `/step2/${currentProject.id}/grade-title-relationship` : '#' },
        { id: 'managerial-definition' as TabId, name: 'Managerial Definition', icon: Users, route: currentProject?.id ? `/step2/${currentProject.id}/managerial-definition` : '#' },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: currentProject?.id ? `/step2/${currentProject.id}/review` : '#' },
    ];

    if (!company || !currentProject) {
        return (
            <div className="flex h-screen bg-background">
                <RoleBasedSidebar />
                <main className="flex-1 overflow-auto md:pt-0 pt-14 flex items-center justify-center">
                    <div>Please complete Step 1: Diagnosis first.</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Step 2: Organization Design" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <OrganizationHeader
                        title="Step 2: Organization Design"
                        description="Define your organization structure and job system"
                        status={status}
                        backHref="/hr-manager/dashboard"
                        ceoPhilosophy={currentProject.ceo_philosophy}
                    />

                    <OrganizationProgressBar
                        stepName="Overview"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <OrganizationTabs
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
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-2">Organization Design</h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto">
                                        Based on your diagnosis and CEO's management philosophy, design your organization structure, job grade system, and managerial role definitions.
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
