import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Target, FileText, Users, BarChart3, Check } from 'lucide-react';
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
    evaluation_structure_quantitative?: string | null;
    evaluation_structure_relative?: string | null;
    performance_method?: string | null;
    performance_unit?: string | null;
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

const typeOptions = [
    { id: 'quantitative', name: 'Quantitative', description: 'Numeric metrics and measurable outcomes' },
    { id: 'qualitative', name: 'Qualitative', description: 'Descriptive assessments and behavioral evaluations' },
    { id: 'hybrid', name: 'Hybrid', description: 'Combination of quantitative and qualitative methods' },
];

const scaleOptions = [
    { id: 'relative', name: 'Relative', description: 'Ranking-based evaluation (e.g., top 10%, bottom 20%)' },
    { id: 'absolute', name: 'Absolute', description: 'Fixed scale evaluation (e.g., 1-5 rating scale)' },
];

export default function EvaluationStructure({ company, project }: PageProps) {
    const performanceSystem = project.performance_system;

    const form = useForm({
        evaluation_structure_quantitative: performanceSystem?.evaluation_structure_quantitative || '',
        evaluation_structure_relative: performanceSystem?.evaluation_structure_relative || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step3/${project.id}/evaluation-structure`, {
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
                <Head title="Evaluation Structure - Step 3" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <PerformanceHeader
                        title="Step 3: Performance System"
                        description="Design your performance evaluation framework"
                        status={status}
                        backHref={`/step3/${project.id}/performance-method`}
                        organizationDesign={project.organization_design}
                    />

                    <PerformanceProgressBar
                        stepName="Evaluation Structure"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <PerformanceTabs
                        tabs={tabs}
                        activeTab="evaluation-structure"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Evaluation Structure</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Define the type and scale of your performance evaluation structure.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Type Selection */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Type</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {typeOptions.map((option) => {
                                            const isSelected = form.data.evaluation_structure_quantitative === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => form.setData('evaluation_structure_quantitative', option.id)}
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
                                                            <h4 className="font-semibold mb-1">{option.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{option.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Scale Selection */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Scale</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {scaleOptions.map((option) => {
                                            const isSelected = form.data.evaluation_structure_relative === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => form.setData('evaluation_structure_relative', option.id)}
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
                                                            <h4 className="font-semibold mb-1">{option.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{option.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
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
