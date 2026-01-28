import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, FileText, Layers, Link2, Users, Check, Users2, Grid3x3 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    company: Company;
    project: Project;
}

const structureOptions = [
    {
        id: 'functional',
        name: 'Functional Organization',
        description: 'Departments organized by function (HR, Finance, Marketing).',
        icon: Building2,
        recommended: true, // Based on reference - Functional is recommended
    },
    {
        id: 'team',
        name: 'Team-based Organization',
        description: 'Cross-functional teams with shared responsibility.',
        icon: Users2,
        recommended: false,
    },
    {
        id: 'divisional',
        name: 'Divisional Organization',
        description: 'Independent divisions by product, market, or region.',
        icon: Building2,
        recommended: false,
    },
    {
        id: 'matrix',
        name: 'Matrix Organization',
        description: 'Dual reporting: functional + project/product lines.',
        icon: Grid3x3,
        recommended: false,
    },
];

export default function OrganizationStructure({ company, project }: PageProps) {
    const organizationDesign = project.organization_design;

    const form = useForm({
        structure_type: organizationDesign?.structure_type || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step2/${project.id}/organization-structure`, {
            preserveScroll: true,
        });
    };

    const stepStatus = {
        'organization-structure': Boolean(organizationDesign?.structure_type),
        'job-grade-structure': Boolean(project.organization_design?.job_grade_structure),
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
                <Head title="Organization Structure - Step 2" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <OrganizationHeader
                        title="Step 2: Organization Design"
                        description="Define your organization structure and job system"
                        status={status}
                        backHref="/step2"
                        ceoPhilosophy={project.ceo_philosophy}
                    />

                    <OrganizationProgressBar
                        stepName="Organization Structure"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <OrganizationTabs
                        tabs={tabs}
                        activeTab="organization-structure"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Organization Structure</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select the organization structure that best fits your company. The recommended option is highlighted based on your company profile.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {structureOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = form.data.structure_type === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => form.setData('structure_type', option.id)}
                                                className={`relative p-6 rounded-lg border-2 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                {option.recommended && (
                                                    <Badge className="absolute top-3 right-3 bg-success/10 text-success">
                                                        Recommended
                                                    </Badge>
                                                )}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                        isSelected
                                                            ? 'border-primary bg-primary'
                                                            : 'border-border'
                                                    }`}>
                                                        {isSelected && (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                        )}
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
