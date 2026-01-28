import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Wallet, FileText, Building2, TrendingUp, Gift, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
    incentive_components?: string[] | null;
    differentiation_method?: string | null;
    compensation_structure?: string | null;
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

const incentiveComponentOptions = [
    {
        id: 'individual',
        label: 'Individual Incentives',
        description: 'Bonuses based on personal performance.',
    },
    {
        id: 'organizational',
        label: 'Organizational Incentives',
        description: 'Bonuses based on team/department results.',
    },
    {
        id: 'task_force',
        label: 'Task-Force Incentives',
        description: 'Project-based bonus for special initiatives.',
    },
    {
        id: 'long_term',
        label: 'Long-Term Incentives',
        description: 'Stock options, RSUs, or deferred compensation.',
    },
];

export default function IncentiveComponents({ company, project }: PageProps) {
    const compensationSystem = project.compensation_system;
    const selectedComponents = Array.isArray(compensationSystem?.incentive_components) 
        ? compensationSystem.incentive_components 
        : [];

    const form = useForm({
        incentive_components: selectedComponents,
    });

    const toggleComponent = (componentId: string) => {
        const current = form.data.incentive_components;
        if (current.includes(componentId)) {
            form.setData('incentive_components', current.filter((id) => id !== componentId));
        } else {
            form.setData('incentive_components', [...current, componentId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step4/${project.id}/incentive-components`, {
            preserveScroll: true,
        });
    };

    const stepStatus = {
        'compensation-structure': Boolean(compensationSystem?.compensation_structure),
        'differentiation-method': Boolean(compensationSystem?.differentiation_method),
        'incentive-components': Boolean(
            compensationSystem?.incentive_components && 
            Array.isArray(compensationSystem.incentive_components) &&
            compensationSystem.incentive_components.length > 0
        ),
        'review': false,
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

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Incentive Components - Step 4" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <CompensationHeader
                        title="Step 4: Compensation System"
                        description="Design your compensation and rewards framework"
                        status={status}
                        backHref={`/step4/${project.id}/differentiation-method`}
                        performanceSystem={project.performance_system}
                    />

                    <CompensationProgressBar
                        stepName="Incentive Components"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <CompensationTabs
                        tabs={tabs}
                        activeTab="incentive-components"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Incentive Components</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select the incentive components to include (select all that apply).
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {incentiveComponentOptions.map((component) => {
                                        const isSelected = form.data.incentive_components.includes(component.id);
                                        return (
                                            <div
                                                key={component.id}
                                                className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                                                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                                }`}
                                                onClick={() => toggleComponent(component.id)}
                                            >
                                                <Checkbox
                                                    id={component.id}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleComponent(component.id)}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor={component.id} className="cursor-pointer flex-1">
                                                    <div className="font-semibold">{component.label}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {component.description}
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
