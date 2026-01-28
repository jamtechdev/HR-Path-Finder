import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, FileText, Layers, Link2, Users, Check, CheckCircle2 } from 'lucide-react';
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

const structureTypeLabels: Record<string, string> = {
    functional: 'Functional',
    team: 'Team-based',
    divisional: 'Divisional',
    matrix: 'Matrix',
};

const gradeStructureLabels: Record<string, string> = {
    single: 'Single',
    multi: 'Multi',
};

const relationshipLabels: Record<string, string> = {
    integrated: 'Integrated',
    separated: 'Separated',
};

export default function Review({ company, project }: PageProps) {
    const form = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step2/${project.id}/submit`, {
            preserveScroll: true,
        });
    };

    const organizationDesign = project.organization_design;

    const stepStatus = {
        'organization-structure': Boolean(organizationDesign?.structure_type),
        'job-grade-structure': Boolean(organizationDesign?.job_grade_structure),
        'grade-title-relationship': Boolean(organizationDesign?.grade_title_relationship),
        'managerial-definition': Boolean(organizationDesign?.managerial_role_definition),
        'review': true,
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

    const managerialCriteria = organizationDesign?.managerial_role_definition
        ? (organizationDesign.managerial_role_definition as string).split(',').filter(Boolean)
        : [];

    const sections = [
        {
            id: 'organization-structure',
            title: 'Organization Structure',
            completed: stepStatus['organization-structure'],
            value: organizationDesign?.structure_type 
                ? structureTypeLabels[organizationDesign.structure_type] || organizationDesign.structure_type
                : null,
        },
        {
            id: 'job-grade-structure',
            title: 'Job Grade Structure',
            completed: stepStatus['job-grade-structure'],
            value: organizationDesign?.job_grade_structure
                ? gradeStructureLabels[organizationDesign.job_grade_structure] || organizationDesign.job_grade_structure
                : null,
        },
        {
            id: 'grade-title-relationship',
            title: 'Grade-Title Relationship',
            completed: stepStatus['grade-title-relationship'],
            value: organizationDesign?.grade_title_relationship
                ? relationshipLabels[organizationDesign.grade_title_relationship] || organizationDesign.grade_title_relationship
                : null,
        },
        {
            id: 'managerial-definition',
            title: 'Managerial Role Criteria',
            completed: stepStatus['managerial-definition'],
            value: managerialCriteria.length > 0 
                ? managerialCriteria.map((id) => id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())).join(', ')
                : null,
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Review & Submit - Step 2" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <OrganizationHeader
                        title="Step 2: Organization Design"
                        description="Define your organization structure and job system"
                        status={status}
                        backHref={`/step2/${project.id}/managerial-definition`}
                        ceoPhilosophy={project.ceo_philosophy}
                    />

                    <OrganizationProgressBar
                        stepName="Review & Submit"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <OrganizationTabs
                        tabs={tabs}
                        activeTab="review"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Review & Submit Organization Design</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {sections.map((section) => (
                                <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">{section.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {section.value || '—'}
                                        </p>
                                    </div>
                                    {section.completed ? (
                                        <Badge className="bg-success/10 text-success">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Completed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Incomplete</Badge>
                                    )}
                                </div>
                            ))}

                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Important:</strong> After submission, Step 2 will be locked and Step 3: Performance System will be unlocked.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="pt-4">
                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={form.processing} size="lg">
                                        {form.processing ? 'Submitting...' : 'Submit & Lock Step'}
                                        <CheckCircle2 className="w-4 h-4 ml-2" />
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
