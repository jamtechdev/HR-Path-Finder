import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { RecommendationBadge } from '@/components/hr/RecommendationBadge';
import { ValidationWarning } from '@/components/hr/ValidationWarning';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    project: {
        id: number;
        current_step: string;
        organization_design?: {
            structure_type?: string;
            job_grade_structure?: string;
            grade_title_relationship?: string;
            managerial_role_definition?: string;
        };
    };
    recommendations?: Record<string, { recommended?: boolean; reasons?: string[] }>;
}

export default function OrganizationDesign({ project, recommendations = {} }: Props) {
    const { data, setData, put, post, processing, errors } = useForm({
        structure_type: project.organization_design?.structure_type || '',
        job_grade_structure: project.organization_design?.job_grade_structure || '',
        grade_title_relationship: project.organization_design?.grade_title_relationship || '',
        managerial_role_definition: project.organization_design?.managerial_role_definition || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/hr-projects/${project.id}/organization-design`);
    };

    const finalSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/hr-projects/${project.id}/organization-design/submit`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: true, current: false, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: true, current: false, locked: false },
        { id: 'organization', name: 'Organization', completed: false, current: true, locked: false },
        { id: 'performance', name: 'Performance', completed: false, current: false, locked: true },
        { id: 'compensation', name: 'Compensation', completed: false, current: false, locked: true },
    ];

    return (
        <AppLayout>
            <Head title="Step 3: Organization Design" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Organization Structure & Job System Design</CardTitle>
                        <CardDescription>
                            Design your organizational structure and job grade system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <ValidationWarning warnings={[]} errors={Object.values(errors).flat()} />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="structure_type">Organization Structure *</Label>
                                    <RecommendationBadge
                                        recommended={recommendations[data.structure_type]?.recommended}
                                    />
                                </div>
                                <Select
                                    value={data.structure_type}
                                    onValueChange={(value) => setData('structure_type', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select structure type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="functional">Functional</SelectItem>
                                        <SelectItem value="team">Team-based</SelectItem>
                                        <SelectItem value="divisional">Divisional</SelectItem>
                                        <SelectItem value="matrix">Matrix</SelectItem>
                                    </SelectContent>
                                </Select>
                                {recommendations[data.structure_type]?.reasons && (
                                    <p className="text-xs text-muted-foreground">
                                        {recommendations[data.structure_type].reasons?.join(', ')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_grade_structure">Job Grade Structure *</Label>
                                <Select
                                    value={data.job_grade_structure}
                                    onValueChange={(value) => setData('job_grade_structure', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade structure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single-grade</SelectItem>
                                        <SelectItem value="multi">Multi-grade</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade_title_relationship">
                                    Grade–Title Relationship *
                                </Label>
                                <Select
                                    value={data.grade_title_relationship}
                                    onValueChange={(value) => setData('grade_title_relationship', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="integrated">Integrated</SelectItem>
                                        <SelectItem value="separated">Separated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="managerial_role_definition">
                                    Managerial Role Definition
                                </Label>
                                <Textarea
                                    id="managerial_role_definition"
                                    value={data.managerial_role_definition}
                                    onChange={(e) => setData('managerial_role_definition', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} variant="outline">
                                    {processing ? 'Saving...' : 'Save Progress'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={finalSubmit}
                                    disabled={processing || !data.structure_type}
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
