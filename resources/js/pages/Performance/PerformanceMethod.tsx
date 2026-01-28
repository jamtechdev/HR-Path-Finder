import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Target, FileText, Users, BarChart3, Check } from 'lucide-react';
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
    performance_method?: string | null;
    performance_unit?: string | null;
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

const performanceMethodOptions = [
    {
        id: 'kpi',
        name: 'KPI',
        fullName: 'KPI',
        description: 'Key Performance Indicators - Track measurable targets',
        recommended: true,
    },
    {
        id: 'mbo',
        name: 'MBO',
        fullName: 'MBO',
        description: 'Management by Objectives - Goal-setting approach',
        recommended: false,
    },
    {
        id: 'okr',
        name: 'OKR',
        fullName: 'OKR',
        description: 'Objectives & Key Results - Agile goal framework',
        recommended: false,
    },
    {
        id: 'bsc',
        name: 'BSC',
        fullName: 'BSC',
        description: 'Balanced Scorecard - Multi-perspective metrics',
        recommended: false,
    },
];

export default function PerformanceMethod({ company, project }: PageProps) {
    const performanceSystem = project.performance_system;

    const form = useForm({
        performance_method: performanceSystem?.performance_method || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/step3/${project.id}/performance-method`, {
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
                <Head title="Performance Method - Step 3" />

                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                    <PerformanceHeader
                        title="Step 3: Performance System"
                        description="Design your performance evaluation framework"
                        status={status}
                        backHref={`/step3/${project.id}/evaluation-unit`}
                        organizationDesign={project.organization_design}
                    />

                    <PerformanceProgressBar
                        stepName="Performance Method"
                        completedSteps={completedSteps}
                        totalSteps={totalSteps}
                    />

                    <PerformanceTabs
                        tabs={tabs}
                        activeTab="performance-method"
                        stepStatus={stepStatus}
                        stepOrder={stepOrder}
                        projectId={project.id}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Performance Management Method</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select the performance management methodology for your organization.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {performanceMethodOptions.map((option) => {
                                        const isSelected = form.data.performance_method === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => form.setData('performance_method', option.id)}
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
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold">{option.name}</span>
                                                        <span className="text-sm text-muted-foreground">{option.fullName}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                                </div>
                                                <div className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    isSelected
                                                        ? 'border-primary bg-primary'
                                                        : 'border-border'
                                                }`}>
                                                    {isSelected && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                    )}
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
