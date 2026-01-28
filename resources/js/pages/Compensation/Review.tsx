import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Wallet, FileText, Building2, TrendingUp, Gift, Check, CheckCircle2 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    company: Company;
    project: Project;
}

const structureLabels: Record<string, string> = {
    fixed: 'Fixed-pay Centered',
    mixed: 'Mixed',
    performance_based: 'Performance-pay Centered',
};

const differentiationLabels: Record<string, string> = {
    merit: 'Merit',
    incentive: 'Incentive',
    role_based: 'Role-Based',
};

const componentLabels: Record<string, string> = {
    individual: 'Individual',
    organizational: 'Organizational',
    task_force: 'Task-Force',
    long_term: 'Long-Term',
};

export default function Review({ company, project }: PageProps) {
    const form = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step4/${project.id}/submit`, {
            preserveScroll: true,
        });
    };

    const compensationSystem = project.compensation_system;
    const incentiveComponents = Array.isArray(compensationSystem?.incentive_components) 
        ? compensationSystem.incentive_components 
        : [];

    const stepStatus = {
        'compensation-structure': Boolean(compensationSystem?.compensation_structure),
        'differentiation-method': Boolean(compensationSystem?.differentiation_method),
        'incentive-components': Boolean(incentiveComponents.length > 0),
        'review': true,
    };

    const stepOrder = ['compensation-structure', 'differentiation-method', 'incentive-components', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 4;

    const status: 'not_started' | 'in_progress' | 'submitted' = 
        project.status === 'not_started' ? 'not_started' : 
        project.status === 'in_progress' ? 'in_progress' : 
        'submitted';

    const tabs = [
        { id: 'overview' as TabId, name: 'Overview', icon: FileText, route: `/step4` },
        { id: 'compensation-structure' as TabId, name: 'Compensation Structure', icon: Building2, route: `/step4/${project.id}/compensation-structure` },
        { id: 'differentiation-method' as TabId, name: 'Differentiation Method', icon: TrendingUp, route: `/step4/${project.id}/differentiation-method` },
        { id: 'incentive-components' as TabId, name: 'Incentive Components', icon: Gift, route: `/step4/${project.id}/incentive-components` },
        { id: 'review' as TabId, name: 'Review & Submit', icon: Check, route: `/step4/${project.id}/review` },
    ];

    const sections = [
        {
            id: 'compensation-structure',
            title: 'Compensation Structure',
            completed: stepStatus['compensation-structure'],
            value: compensationSystem?.compensation_structure
                ? structureLabels[compensationSystem.compensation_structure] || compensationSystem.compensation_structure
                : null,
        },
        {
            id: 'differentiation-method',
            title: 'Differentiation Method',
            completed: stepStatus['differentiation-method'],
            value: compensationSystem?.differentiation_method
                ? differentiationLabels[compensationSystem.differentiation_method] || compensationSystem.differentiation_method
                : null,
        },
        {
            id: 'incentive-components',
            title: 'Incentive Components',
            completed: stepStatus['incentive-components'],
            value: incentiveComponents.length > 0
                ? incentiveComponents.map((id) => componentLabels[id] || id).join(', ')
                : null,
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Review & Submit - Step 4" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <CompensationHeader
                        title="Step 4: Compensation System"
                        description="Design your compensation and rewards framework"
                        status={status}
                        backHref={`/step4/${project.id}/incentive-components`}
                        performanceSystem={project.performance_system}
                    />

                    <CompensationProgressBar
                        stepName="Review & Submit"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <CompensationTabs
                        tabs={tabs}
                        activeTab="review"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Review & Submit Compensation System</CardTitle>
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

                            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                                <p className="text-sm text-success font-medium">
                                    <strong>Congratulations!</strong> After submission, all 4 steps will be complete. The consultant will review your HR system, and then the CEO can give final approval.
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
                                        {form.processing ? 'Submitting...' : 'Submit & Lock Step 4'}
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
