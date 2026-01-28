import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, FileText, Layers, Link2, Users, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    job_grade_structure?: string | null;
    structure_type?: string | null;
}

interface Project {
    id: number;
    status: string;
    organization_design?: OrganizationDesign | null;
    ceo_philosophy?: CeoPhilosophy | null;
}

interface PageProps {
    company: Company;
    project: Project;
}

const gradeStructureOptions = [
    {
        id: 'single',
        name: 'Single-Grade Structure',
        description: 'One unified grade system across the organization. Best for smaller companies or flat hierarchies.',
    },
    {
        id: 'multi',
        name: 'Multi-Grade Structure',
        description: 'Multiple grade tracks for different functions or career paths. Suitable for larger organizations.',
    },
];

export default function JobGradeStructure({ company, project }: PageProps) {
    const organizationDesign = project.organization_design;

    const form = useForm({
        job_grade_structure: organizationDesign?.job_grade_structure || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step2/${project.id}/job-grade-structure`, {
            preserveScroll: true,
        });
    };

    const stepStatus = {
        'organization-structure': Boolean(organizationDesign?.structure_type),
        'job-grade-structure': Boolean(organizationDesign?.job_grade_structure),
        'grade-title-relationship': Boolean(project.organization_design?.grade_title_relationship),
        'managerial-definition': Boolean(project.organization_design?.managerial_role_definition),
        'review': false,
    };

    const stepOrder = ['organization-structure', 'job-grade-structure', 'grade-title-relationship', 'managerial-definition', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 5;

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        project.status === 'not_started' ? 'not_started' : 
        project.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/step2` },
        { id: 'organization-structure' as TabId, name: 'Organization Structure', icon: Building2, route: `/step2/${project.id}/organization-structure` },
        { id: 'job-grade-structure' as TabId, name: 'Job Grade Structure', icon: Layers, route: `/step2/${project.id}/job-grade-structure` },
        { id: 'grade-title-relationship' as TabId, name: 'Grade-Title Relationship', icon: Link2, route: `/step2/${project.id}/grade-title-relationship` },
        { id: 'managerial-definition' as TabId, name: 'Managerial Definition', icon: Users, route: `/step2/${project.id}/managerial-definition` },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: `/step2/${project.id}/review` },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Job Grade Structure - Step 2" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <OrganizationHeader
                        title="Step 2: Organization Design"
                        description="Define your organization structure and job system"
                        status={status}
                        backHref={`/step2/${project.id}/organization-structure`}
                        ceoPhilosophy={project.ceo_philosophy}
                    />

                    <OrganizationProgressBar
                        stepName="Job Grade Structure"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <OrganizationTabs
                        tabs={tabs}
                        activeTab="job-grade-structure"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Job Grade Structure</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Choose between a single-grade or multi-grade structure for your organization.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {gradeStructureOptions.map((option) => {
                                        const isSelected = form.data.job_grade_structure === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => form.setData('job_grade_structure', option.id)}
                                                className={`relative p-6 rounded-lg border-2 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                                                        isSelected
                                                            ? 'border-primary bg-primary'
                                                            : 'border-border'
                                                    }`}>
                                                        {isSelected && (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Saving...' : 'Next'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
