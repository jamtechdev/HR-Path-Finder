import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Target, FileText, Users, BarChart3, Check, Users2, Building2 } from 'lucide-react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const evaluationUnitOptions = [
    {
        id: 'individual',
        name: 'Individual',
        description: 'Performance evaluated at the individual employee level.',
        icon: Users,
    },
    {
        id: 'organization',
        name: 'Organizational',
        description: 'Performance evaluated at team or department level.',
        icon: Building2,
    },
    {
        id: 'hybrid',
        name: 'Hybrid',
        description: 'Combination of individual and organizational evaluation.',
        icon: Users2,
    },
];

export default function EvaluationUnit({ company, project }: PageProps) {
    const performanceSystem = project.performance_system;

    const form = useForm({
        performance_unit: performanceSystem?.performance_unit || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step3/${project.id}/evaluation-unit`, {
            preserveScroll: true,
        });
    };

    const stepStatus = {
        'evaluation-unit': Boolean(performanceSystem?.performance_unit),
        'performance-method': Boolean(performanceSystem?.performance_method),
        'evaluation-structure': Boolean(
            performanceSystem?.evaluation_structure_quantitative && 
            performanceSystem?.evaluation_structure_relative
        ),
        'review': false,
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

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Evaluation Unit - Step 3" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <PerformanceHeader
                        title="Step 3: Performance System"
                        description="Design your performance evaluation framework"
                        status={status}
                        backHref="/step3"
                        organizationDesign={project.organization_design}
                    />

                    <PerformanceProgressBar
                        stepName="Evaluation Unit"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <PerformanceTabs
                        tabs={tabs}
                        activeTab="evaluation-unit"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Performance Evaluation Unit</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select how performance will be evaluated - at individual, organizational, or hybrid level.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {evaluationUnitOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = form.data.performance_unit === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => form.setData('performance_unit', option.id)}
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
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon className="w-5 h-5 text-primary" />
                                                            <h3 className="font-semibold text-lg">{option.name}</h3>
                                                        </div>
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
