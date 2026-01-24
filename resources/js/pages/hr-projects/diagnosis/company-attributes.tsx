import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    project: {
        id: number;
        current_step: string;
        company_attributes?: {
            job_standardization_level?: number;
            performance_measurability?: number;
        };
        organizational_sentiment?: {
            openness_to_change?: number;
            trust_level?: number;
            evaluation_acceptance?: number;
            reward_sensitivity?: number;
            conflict_perception?: number;
        };
    };
}

export default function CompanyAttributes({ project }: Props) {
    const attributesForm = useForm({
        job_standardization_level: project.company_attributes?.job_standardization_level || 3,
        performance_measurability: project.company_attributes?.performance_measurability || 3,
    });

    const sentimentForm = useForm({
        openness_to_change: project.organizational_sentiment?.openness_to_change || 3,
        trust_level: project.organizational_sentiment?.trust_level || 3,
        evaluation_acceptance: project.organizational_sentiment?.evaluation_acceptance || 3,
        reward_sensitivity: project.organizational_sentiment?.reward_sensitivity || 3,
        conflict_perception: project.organizational_sentiment?.conflict_perception || 3,
    });

    const submitAttributes: FormEventHandler = (e) => {
        e.preventDefault();
        attributesForm.post(`/hr-projects/${project.id}/diagnosis/company-attributes`);
    };

    const submitSentiment: FormEventHandler = (e) => {
        e.preventDefault();
        sentimentForm.post(`/hr-projects/${project.id}/diagnosis/organizational-sentiment`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: false, current: true, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: false, current: false, locked: true },
        { id: 'organization', name: 'Organization', completed: false, current: false, locked: true },
        { id: 'performance', name: 'Performance', completed: false, current: false, locked: true },
        { id: 'compensation', name: 'Compensation', completed: false, current: false, locked: true },
    ];

    return (
        <AppLayout>
            <Head title="Step 1: Diagnosis - Company Attributes" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <div className="mt-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Attributes</CardTitle>
                            <CardDescription>
                                Assess the standardization and measurability of your company's operations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitAttributes} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="job_standardization_level">
                                        Job Standardization Level (1-5)
                                    </Label>
                                    <Input
                                        id="job_standardization_level"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={attributesForm.data.job_standardization_level}
                                        onChange={(e) =>
                                            attributesForm.setData(
                                                'job_standardization_level',
                                                parseInt(e.target.value)
                                            )
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        1 = Low standardization, 5 = High standardization
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="performance_measurability">
                                        Performance Measurability (1-5)
                                    </Label>
                                    <Input
                                        id="performance_measurability"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={attributesForm.data.performance_measurability}
                                        onChange={(e) =>
                                            attributesForm.setData(
                                                'performance_measurability',
                                                parseInt(e.target.value)
                                            )
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        1 = Difficult to measure, 5 = Easy to measure
                                    </p>
                                </div>

                                <Button type="submit" disabled={attributesForm.processing}>
                                    {attributesForm.processing ? 'Saving...' : 'Save Attributes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organizational Sentiment</CardTitle>
                            <CardDescription>
                                Evaluate the organizational culture and employee attitudes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitSentiment} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="openness_to_change">Openness to Change (1-5)</Label>
                                        <Input
                                            id="openness_to_change"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={sentimentForm.data.openness_to_change}
                                            onChange={(e) =>
                                                sentimentForm.setData(
                                                    'openness_to_change',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="trust_level">Trust Level (1-5)</Label>
                                        <Input
                                            id="trust_level"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={sentimentForm.data.trust_level}
                                            onChange={(e) =>
                                                sentimentForm.setData('trust_level', parseInt(e.target.value))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="evaluation_acceptance">
                                            Evaluation Acceptance (1-5)
                                        </Label>
                                        <Input
                                            id="evaluation_acceptance"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={sentimentForm.data.evaluation_acceptance}
                                            onChange={(e) =>
                                                sentimentForm.setData(
                                                    'evaluation_acceptance',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reward_sensitivity">
                                            Reward Sensitivity (1-5)
                                        </Label>
                                        <Input
                                            id="reward_sensitivity"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={sentimentForm.data.reward_sensitivity}
                                            onChange={(e) =>
                                                sentimentForm.setData(
                                                    'reward_sensitivity',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="conflict_perception">
                                            Conflict Perception (1-5)
                                        </Label>
                                        <Input
                                            id="conflict_perception"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={sentimentForm.data.conflict_perception}
                                            onChange={(e) =>
                                                sentimentForm.setData(
                                                    'conflict_perception',
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={sentimentForm.processing} className="w-full">
                                    {sentimentForm.processing ? 'Submitting...' : 'Submit & Continue to CEO Philosophy'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
