import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { RecommendationBadge } from '@/components/hr/RecommendationBadge';
import { ValidationWarning } from '@/components/hr/ValidationWarning';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    project: {
        id: number;
        current_step: string;
        performance_system?: {
            performance_unit?: string;
            performance_method?: string;
            evaluation_structure_quantitative?: string;
            evaluation_structure_relative?: string;
        };
    };
    recommendations?: Record<string, { recommended?: boolean; reasons?: string[] }>;
}

export default function PerformanceSystem({ project, recommendations = {} }: Props) {
    const { data, setData, put, post, processing, errors } = useForm({
        performance_unit: project.performance_system?.performance_unit || '',
        performance_method: project.performance_system?.performance_method || '',
        evaluation_structure_quantitative: project.performance_system?.evaluation_structure_quantitative || '',
        evaluation_structure_relative: project.performance_system?.evaluation_structure_relative || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/hr-projects/${project.id}/performance-system`);
    };

    const finalSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/hr-projects/${project.id}/performance-system/submit`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: true, current: false, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: true, current: false, locked: false },
        { id: 'organization', name: 'Organization', completed: true, current: false, locked: false },
        { id: 'performance', name: 'Performance', completed: false, current: true, locked: false },
        { id: 'compensation', name: 'Compensation', completed: false, current: false, locked: true },
    ];

    return (
        <AppLayout>
            <Head title="Step 4: Performance System" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Performance System Design</CardTitle>
                        <CardDescription>
                            Design your performance evaluation framework.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <ValidationWarning warnings={[]} errors={Object.values(errors).flat()} />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="performance_unit">Performance Unit *</Label>
                                    <RecommendationBadge
                                        recommended={recommendations[data.performance_unit]?.recommended}
                                    />
                                </div>
                                <Select
                                    value={data.performance_unit}
                                    onValueChange={(value) => setData('performance_unit', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select performance unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="organization">Organization</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="performance_method">Performance Method *</Label>
                                    <RecommendationBadge
                                        recommended={recommendations[data.performance_method]?.recommended}
                                    />
                                </div>
                                <Select
                                    value={data.performance_method}
                                    onValueChange={(value) => setData('performance_method', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kpi">KPI (Key Performance Indicators)</SelectItem>
                                        <SelectItem value="mbo">MBO (Management by Objectives)</SelectItem>
                                        <SelectItem value="okr">OKR (Objectives and Key Results)</SelectItem>
                                        <SelectItem value="bsc">BSC (Balanced Scorecard)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {recommendations[data.performance_method]?.reasons && (
                                    <p className="text-xs text-muted-foreground">
                                        {recommendations[data.performance_method].reasons?.join(', ')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="evaluation_structure_quantitative">
                                    Evaluation Structure (Quantitative/Qualitative) *
                                </Label>
                                <Select
                                    value={data.evaluation_structure_quantitative}
                                    onValueChange={(value) => setData('evaluation_structure_quantitative', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select structure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quantitative">Quantitative</SelectItem>
                                        <SelectItem value="qualitative">Qualitative</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="evaluation_structure_relative">
                                    Evaluation Structure (Relative/Absolute) *
                                </Label>
                                <Select
                                    value={data.evaluation_structure_relative}
                                    onValueChange={(value) => setData('evaluation_structure_relative', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select structure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relative">Relative</SelectItem>
                                        <SelectItem value="absolute">Absolute</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} variant="outline">
                                    {processing ? 'Saving...' : 'Save Progress'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={finalSubmit}
                                    disabled={processing || !data.performance_method}
                                >
                                    {processing ? 'Submitting...' : 'Submit & Continue'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
