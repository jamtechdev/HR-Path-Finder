import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, FileText, Layers, Link2, Users, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
    managerial_role_definition?: string | null;
    grade_title_relationship?: string | null;
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

const managerialCriteria = [
    {
        id: 'team_leadership',
        label: 'Team Leadership',
        description: 'Manages a team of direct reports',
    },
    {
        id: 'budget_authority',
        label: 'Budget Authority',
        description: 'Has budget approval responsibilities',
    },
    {
        id: 'hiring_authority',
        label: 'Hiring Authority',
        description: 'Participates in hiring decisions',
    },
    {
        id: 'performance_evaluation',
        label: 'Performance Evaluation',
        description: 'Evaluates subordinate performance',
    },
    {
        id: 'strategic_planning',
        label: 'Strategic Planning',
        description: 'Involved in strategic decision-making',
    },
];

export default function ManagerialDefinition({ company, project }: PageProps) {
    const organizationDesign = project.organization_design;
    const selectedCriteria = organizationDesign?.managerial_role_definition 
        ? (organizationDesign.managerial_role_definition as string).split(',').filter(Boolean)
        : [];

    const form = useForm({
        managerial_role_definition: selectedCriteria,
    });

    const toggleCriterion = (criterionId: string) => {
        const current = form.data.managerial_role_definition;
        if (current.includes(criterionId)) {
            form.setData('managerial_role_definition', current.filter((id) => id !== criterionId));
        } else {
            form.setData('managerial_role_definition', [...current, criterionId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert array to comma-separated string
        const data = {
            managerial_role_definition: form.data.managerial_role_definition.join(','),
        };
        form.transform(() => data).post(`/step2/${project.id}/managerial-definition`, {
            preserveScroll: true,
        });
    };

    const stepStatus = {
        'organization-structure': Boolean(organizationDesign?.structure_type),
        'job-grade-structure': Boolean(organizationDesign?.job_grade_structure),
        'grade-title-relationship': Boolean(organizationDesign?.grade_title_relationship),
        'managerial-definition': Boolean(organizationDesign?.managerial_role_definition),
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
                <Head title="Managerial Definition - Step 2" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <OrganizationHeader
                        title="Step 2: Organization Design"
                        description="Define your organization structure and job system"
                        status={status}
                        backHref={`/step2/${project.id}/grade-title-relationship`}
                        ceoPhilosophy={project.ceo_philosophy}
                    />

                    <OrganizationProgressBar
                        stepName="Managerial Definition"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <OrganizationTabs
                        tabs={tabs}
                        activeTab="managerial-definition"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Managerial Role Definition</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select the criteria that define managerial roles in your organization (select all that apply).
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {managerialCriteria.map((criterion) => {
                                        const isSelected = form.data.managerial_role_definition.includes(criterion.id);
                                        return (
                                            <div
                                                key={criterion.id}
                                                className="flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50"
                                                onClick={() => toggleCriterion(criterion.id)}
                                            >
                                                <Checkbox
                                                    id={criterion.id}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleCriterion(criterion.id)}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor={criterion.id} className="cursor-pointer flex-1">
                                                    <div className="font-semibold">{criterion.label}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {criterion.description}
                                                    </div>
                                                </Label>
                                            </div>
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
