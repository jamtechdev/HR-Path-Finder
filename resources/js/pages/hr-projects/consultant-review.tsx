import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    project: {
        id: number;
        current_step: string;
        company_attributes?: any;
        organizational_sentiment?: any;
        ceo_philosophy?: any;
        organization_design?: any;
        performance_system?: any;
        compensation_system?: any;
    };
}

export default function ConsultantReview({ project }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        opinions: '',
        risk_notes: '',
        alignment_observations: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/hr-projects/${project.id}/consultant-review`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: true, current: false, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: true, current: false, locked: false },
        { id: 'organization', name: 'Organization', completed: true, current: false, locked: false },
        { id: 'performance', name: 'Performance', completed: true, current: false, locked: false },
        { id: 'compensation', name: 'Compensation', completed: true, current: false, locked: false },
        { id: 'consultant_review', name: 'Consultant Review', completed: false, current: true, locked: false },
        { id: 'ceo_approval', name: 'CEO Approval', completed: false, current: false, locked: true },
    ];

    return (
        <AppLayout>
            <Head title="Step 6: Consultant Review" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <div className="mt-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>HR System Summary</CardTitle>
                            <CardDescription>Review all selections made in previous steps.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.organization_design && (
                                <div>
                                    <p className="font-semibold">Organization Structure:</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {project.organization_design.structure_type}
                                    </p>
                                </div>
                            )}
                            {project.performance_system && (
                                <div>
                                    <p className="font-semibold">Performance Method:</p>
                                    <p className="text-sm text-muted-foreground uppercase">
                                        {project.performance_system.performance_method}
                                    </p>
                                </div>
                            )}
                            {project.compensation_system && (
                                <div>
                                    <p className="font-semibold">Compensation Structure:</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {project.compensation_system.compensation_structure?.replace('_', ' ')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Consultant Review & Feedback</CardTitle>
                            <CardDescription>
                                Provide your professional opinion and observations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="opinions">Consulting Opinions *</Label>
                                    <Textarea
                                        id="opinions"
                                        value={data.opinions}
                                        onChange={(e) => setData('opinions', e.target.value)}
                                        rows={6}
                                        required
                                        placeholder="Provide your professional opinion on the HR system design..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="risk_notes">Risk Notes</Label>
                                    <Textarea
                                        id="risk_notes"
                                        value={data.risk_notes}
                                        onChange={(e) => setData('risk_notes', e.target.value)}
                                        rows={4}
                                        placeholder="Note any potential risks or concerns..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alignment_observations">Alignment Observations</Label>
                                    <Textarea
                                        id="alignment_observations"
                                        value={data.alignment_observations}
                                        onChange={(e) => setData('alignment_observations', e.target.value)}
                                        rows={4}
                                        placeholder="Observe alignment between CEO philosophy and HR system..."
                                    />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? 'Submitting...' : 'Submit Review & Send to CEO'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
