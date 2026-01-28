import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Target, FileText, Users, BarChart3, Check, CheckCircle2 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    company: Company;
    project: Project;
}

const unitLabels: Record<string, string> = {
    individual: 'Individual',
    organization: 'Organizational',
    hybrid: 'Hybrid',
};

const methodLabels: Record<string, string> = {
    kpi: 'KPI',
    mbo: 'MBO',
    okr: 'OKR',
    bsc: 'BSC',
};

const typeLabels: Record<string, string> = {
    quantitative: 'Quantitative',
    qualitative: 'Qualitative',
    hybrid: 'Hybrid',
};

const scaleLabels: Record<string, string> = {
    relative: 'Relative',
    absolute: 'Absolute',
};

export default function Review({ company, project }: PageProps) {
    const form = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step3/${project.id}/submit`, {
            preserveScroll: true,
        });
    };

    const performanceSystem = project.performance_system;

    const stepStatus = {
        'evaluation-unit': Boolean(performanceSystem?.performance_unit),
        'performance-method': Boolean(performanceSystem?.performance_method),
        'evaluation-structure': Boolean(
            performanceSystem?.evaluation_structure_quantitative && 
            performanceSystem?.evaluation_structure_relative
        ),
        'review': true,
    };

    const stepOrder = ['evaluation-unit', 'performance-method', 'evaluation-structure', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 4;

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        project.status === 'not_started' ? 'not_started' : 
        project.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/step3` },
        { id: 'evaluation-unit' as TabId, name: 'Evaluation Unit', icon: Users, route: `/step3/${project.id}/evaluation-unit` },
        { id: 'performance-method' as TabId, name: 'Performance Method', icon: Target, route: `/step3/${project.id}/performance-method` },
        { id: 'evaluation-structure' as TabId, name: 'Evaluation Structure', icon: BarChart3, route: `/step3/${project.id}/evaluation-structure` },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: `/step3/${project.id}/review` },
    ];

    const sections = [
        {
            id: 'evaluation-unit',
            title: 'Evaluation Unit',
            completed: stepStatus['evaluation-unit'],
            value: performanceSystem?.performance_unit 
                ? unitLabels[performanceSystem.performance_unit] || performanceSystem.performance_unit
                : null,
        },
        {
            id: 'performance-method',
            title: 'Performance Method',
            completed: stepStatus['performance-method'],
            value: performanceSystem?.performance_method
                ? methodLabels[performanceSystem.performance_method] || performanceSystem.performance_method.toUpperCase()
                : null,
        },
        {
            id: 'evaluation-structure',
            title: 'Evaluation Structure',
            completed: stepStatus['evaluation-structure'],
            value: performanceSystem?.evaluation_structure_quantitative && performanceSystem?.evaluation_structure_relative
                ? `Type: ${typeLabels[performanceSystem.evaluation_structure_quantitative] || performanceSystem.evaluation_structure_quantitative} | Scale: ${scaleLabels[performanceSystem.evaluation_structure_relative] || performanceSystem.evaluation_structure_relative}`
                : null,
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Review & Submit - Step 3" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <PerformanceHeader
                        title="Step 3: Performance System"
                        description="Design your performance evaluation framework"
                        status={status}
                        backHref={`/step3/${project.id}/evaluation-structure`}
                        organizationDesign={project.organization_design}
                    />

                    <PerformanceProgressBar
                        stepName="Review & Submit"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <PerformanceTabs
                        tabs={tabs}
                        activeTab="review"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Review & Submit Performance System</CardTitle>
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
                                    <strong>Important:</strong> After submission, Step 3 will be locked and Step 4: Compensation System will be unlocked.
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
                                        {form.processing ? 'Submitting...' : 'Submit & Lock Step 3'}
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
