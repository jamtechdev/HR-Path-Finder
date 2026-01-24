import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { RecommendationBadge } from '@/components/hr/RecommendationBadge';
import { ValidationWarning } from '@/components/hr/ValidationWarning';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    project: {
        id: number;
        current_step: string;
        compensation_system?: {
            compensation_structure?: string;
            differentiation_method?: string;
            incentive_components?: string[];
        };
    };
    recommendations?: Record<string, { recommended?: boolean; reasons?: string[] }>;
}

export default function CompensationSystem({ project, recommendations = {} }: Props) {
    const [incentiveComponents, setIncentiveComponents] = useState<string[]>(
        project.compensation_system?.incentive_components || []
    );

    const { data, setData, put, post, processing, errors } = useForm({
        compensation_structure: project.compensation_system?.compensation_structure || '',
        differentiation_method: project.compensation_system?.differentiation_method || '',
        incentive_components: incentiveComponents,
    });

    const handleIncentiveToggle = (component: string) => {
        const newComponents = incentiveComponents.includes(component)
            ? incentiveComponents.filter((c) => c !== component)
            : [...incentiveComponents, component];
        setIncentiveComponents(newComponents);
        setData('incentive_components', newComponents);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/hr-projects/${project.id}/compensation-system`);
    };

    const finalSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/hr-projects/${project.id}/compensation-system/submit`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: true, current: false, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: true, current: false, locked: false },
        { id: 'organization', name: 'Organization', completed: true, current: false, locked: false },
        { id: 'performance', name: 'Performance', completed: true, current: false, locked: false },
        { id: 'compensation', name: 'Compensation', completed: false, current: true, locked: false },
    ];

    return (
        <AppLayout>
            <Head title="Step 5: Compensation System" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Compensation System Design</CardTitle>
                        <CardDescription>
                            Design your compensation structure and incentive system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <ValidationWarning warnings={[]} errors={Object.values(errors).flat()} />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="compensation_structure">Compensation Structure *</Label>
                                    <RecommendationBadge
                                        recommended={recommendations[data.compensation_structure]?.recommended}
                                    />
                                </div>
                                <Select
                                    value={data.compensation_structure}
                                    onValueChange={(value) => setData('compensation_structure', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select structure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed-pay centered</SelectItem>
                                        <SelectItem value="mixed">Fixed + Variable</SelectItem>
                                        <SelectItem value="performance_based">Performance-pay centered</SelectItem>
                                    </SelectContent>
                                </Select>
                                {recommendations[data.compensation_structure]?.reasons && (
                                    <p className="text-xs text-muted-foreground">
                                        {recommendations[data.compensation_structure].reasons?.join(', ')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="differentiation_method">Differentiation Method *</Label>
                                <Select
                                    value={data.differentiation_method}
                                    onValueChange={(value) => setData('differentiation_method', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="merit">Merit Increase</SelectItem>
                                        <SelectItem value="incentive">Incentives</SelectItem>
                                        <SelectItem value="role_based">Job-based / Role-based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Incentive Components</Label>
                                <div className="space-y-2">
                                    {['individual', 'organizational', 'task_force', 'long_term'].map(
                                        (component) => (
                                            <div key={component} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={component}
                                                    checked={incentiveComponents.includes(component)}
                                                    onCheckedChange={() => handleIncentiveToggle(component)}
                                                />
                                                <Label
                                                    htmlFor={component}
                                                    className="font-normal cursor-pointer capitalize"
                                                >
                                                    {component.replace('_', ' ')}
                                                </Label>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} variant="outline">
                                    {processing ? 'Saving...' : 'Save Progress'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={finalSubmit}
                                    disabled={processing || !data.compensation_structure}
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
