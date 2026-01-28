import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Wallet, FileText, Building2, TrendingUp, Gift, Check } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    differentiation_method?: string | null;
    compensation_structure?: string | null;
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

const differentiationMethodOptions = [
    {
        id: 'merit',
        name: 'Merit Increase',
        description: 'Salary increases based on performance ratings and achievements.',
    },
    {
        id: 'incentive',
        name: 'Incentives',
        description: 'Bonus payments tied to specific goals or results.',
    },
    {
        id: 'role_based',
        name: 'Role-Based Pay',
        description: 'Compensation determined by job role and responsibility level.',
    },
];

export default function DifferentiationMethod({ company, project }: PageProps) {
    const compensationSystem = project.compensation_system;

    const form = useForm({
        differentiation_method: compensationSystem?.differentiation_method || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step4/${project.id}/differentiation-method`, {
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
                <Head title="Differentiation Method - Step 4" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <CompensationHeader
                        title="Step 4: Compensation System"
                        description="Design your compensation and rewards framework"
                        status={status}
                        backHref={`/step4/${project.id}/compensation-structure`}
                        performanceSystem={project.performance_system}
                    />

                    <CompensationProgressBar
                        stepName="Differentiation Method"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <CompensationTabs
                        tabs={tabs}
                        activeTab="differentiation-method"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Differentiation Method</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select how compensation differences will be determined.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {differentiationMethodOptions.map((option) => {
                                        const isSelected = form.data.differentiation_method === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => form.setData('differentiation_method', option.id)}
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
