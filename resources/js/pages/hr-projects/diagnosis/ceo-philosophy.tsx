import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    project: {
        id: number;
        current_step: string;
        ceo_philosophy?: {
            responses?: Record<string, string>;
            main_trait?: string;
            sub_trait?: string;
        };
    };
}

// Sample questions for CEO Philosophy Survey
const surveyQuestions = [
    {
        id: 'q1',
        question: 'When making decisions, you prefer to:',
        options: [
            { value: 'autocratic', label: 'Make decisions independently and communicate them clearly' },
            { value: 'democratic', label: 'Gather input from team members before deciding' },
            { value: 'laissez_faire', label: 'Let team members make their own decisions' },
        ],
    },
    {
        id: 'q2',
        question: 'Your approach to goal setting:',
        options: [
            { value: 'autocratic', label: 'Set clear, specific goals for the team' },
            { value: 'democratic', label: 'Collaborate with team to set shared goals' },
            { value: 'laissez_faire', label: 'Provide general direction and let team define goals' },
        ],
    },
    {
        id: 'q3',
        question: 'When conflicts arise, you:',
        options: [
            { value: 'autocratic', label: 'Resolve them quickly with a clear decision' },
            { value: 'democratic', label: 'Facilitate discussion to find consensus' },
            { value: 'laissez_faire', label: 'Let the team resolve conflicts themselves' },
        ],
    },
];

export default function CeoPhilosophy({ project }: Props) {
    const [responses, setResponses] = useState<Record<string, string>>(
        project.ceo_philosophy?.responses || {}
    );

    const { data, setData, put, post, processing } = useForm({
        responses: responses,
        main_trait: project.ceo_philosophy?.main_trait || '',
        sub_trait: project.ceo_philosophy?.sub_trait || '',
    });

    const handleResponseChange = (questionId: string, value: string) => {
        const newResponses = { ...responses, [questionId]: value };
        setResponses(newResponses);
        setData('responses', newResponses);

        // Calculate main trait based on responses (simplified logic)
        const traitCounts: Record<string, number> = {};
        Object.values(newResponses).forEach((trait) => {
            traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        });
        const mainTrait = Object.keys(traitCounts).reduce((a, b) =>
            traitCounts[a] > traitCounts[b] ? a : b
        );
        setData('main_trait', mainTrait);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/hr-projects/${project.id}/ceo-philosophy`);
    };

    const finalSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/hr-projects/${project.id}/ceo-philosophy/submit`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: true, current: false, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: false, current: true, locked: false },
        { id: 'organization', name: 'Organization', completed: false, current: false, locked: true },
        { id: 'performance', name: 'Performance', completed: false, current: false, locked: true },
        { id: 'compensation', name: 'Compensation', completed: false, current: false, locked: true },
    ];

    return (
        <AppLayout>
            <Head title="Step 2: CEO Management Philosophy" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>CEO Management Philosophy Survey</CardTitle>
                        <CardDescription>
                            Complete this survey to help align HR systems with your leadership style.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-8">
                            {surveyQuestions.map((question) => (
                                <div key={question.id} className="space-y-4">
                                    <Label className="text-base font-semibold">{question.question}</Label>
                                    <RadioGroup
                                        value={responses[question.id] || ''}
                                        onValueChange={(value) => handleResponseChange(question.id, value)}
                                    >
                                        {question.options.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option.value} id={option.value} />
                                                <Label
                                                    htmlFor={option.value}
                                                    className="font-normal cursor-pointer"
                                                >
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}

                            {data.main_trait && (
                                <div className="rounded-lg bg-muted p-4">
                                    <p className="text-sm font-medium">Detected Management Style:</p>
                                    <p className="text-lg font-semibold capitalize">{data.main_trait.replace('_', ' ')}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} variant="outline">
                                    {processing ? 'Saving...' : 'Save Progress'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={finalSubmit}
                                    disabled={processing || !data.main_trait}
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
