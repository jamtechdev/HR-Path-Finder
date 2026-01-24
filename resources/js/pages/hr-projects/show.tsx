import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '@/components/hr/StepNavigation';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
    project: {
        id: number;
        status: string;
        current_step: string;
        company?: {
            name: string;
        };
    };
}

export default function HrProjectShow({ project }: Props) {
    const getStepRoute = (step: string) => {
        const routes: Record<string, string> = {
            diagnosis: `/hr-projects/${project.id}/diagnosis/company-attributes`,
            ceo_philosophy: `/hr-projects/${project.id}/ceo-philosophy`,
            organization: `/hr-projects/${project.id}/organization-design`,
            performance: `/hr-projects/${project.id}/performance-system`,
            compensation: `/hr-projects/${project.id}/compensation-system`,
            consultant_review: `/hr-projects/${project.id}/consultant-review`,
            ceo_approval: `/hr-projects/${project.id}/ceo-approval`,
            dashboard: `/hr-projects/${project.id}/dashboard`,
        };
        return routes[step] || '#';
    };

    const steps = [
        {
            id: 'diagnosis',
            name: 'Diagnosis',
            completed: project.current_step !== 'diagnosis',
            current: project.current_step === 'diagnosis',
            locked: false,
        },
        {
            id: 'ceo_philosophy',
            name: 'CEO Philosophy',
            completed: ['organization', 'performance', 'compensation', 'consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
            current: project.current_step === 'ceo_philosophy',
            locked: project.current_step === 'diagnosis',
        },
        {
            id: 'organization',
            name: 'Organization',
            completed: ['performance', 'compensation', 'consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
            current: project.current_step === 'organization',
            locked: !['ceo_philosophy', 'organization', 'performance', 'compensation', 'consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
        },
        {
            id: 'performance',
            name: 'Performance',
            completed: ['compensation', 'consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
            current: project.current_step === 'performance',
            locked: !['organization', 'performance', 'compensation', 'consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
        },
        {
            id: 'compensation',
            name: 'Compensation',
            completed: ['consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
            current: project.current_step === 'compensation',
            locked: !['performance', 'compensation', 'consultant_review', 'ceo_approval', 'dashboard'].includes(project.current_step),
        },
    ];

    return (
        <AppLayout>
            <Head title={`HR Project - ${project.company?.name || 'Project'}`} />
            <div className="container mx-auto max-w-7xl py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">{project.company?.name || 'HR Project'}</h1>
                    <div className="mt-2 flex items-center gap-4">
                        <Badge variant={project.status === 'locked' ? 'default' : 'outline'}>
                            {project.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Current Step: {project.current_step?.replace('_', ' ') || 'Not started'}
                        </span>
                    </div>
                </div>

                <StepNavigation steps={steps} currentStep={project.current_step} />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Continue Your HR System Design</CardTitle>
                        <CardDescription>
                            Select the step you want to work on or continue from where you left off.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {steps.map((step) => (
                                <Link
                                    key={step.id}
                                    href={getStepRoute(step.id)}
                                    className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                                        step.locked
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:bg-accent cursor-pointer'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {step.completed ? (
                                            <CheckCircle2 className="size-5 text-brand-green" />
                                        ) : (
                                            <div
                                                className={`size-5 rounded-full border-2 ${
                                                    step.current
                                                        ? 'border-brand-blue bg-brand-blue'
                                                        : 'border-gray-300'
                                                }`}
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{step.name}</p>
                                            {step.current && (
                                                <p className="text-xs text-muted-foreground">Current step</p>
                                            )}
                                        </div>
                                    </div>
                                    {!step.locked && (
                                        <ArrowRight className="size-4 text-muted-foreground" />
                                    )}
                                </Link>
                            ))}
                            {project.status === 'locked' && (
                                <Link
                                    href={`/hr-projects/${project.id}/dashboard`}
                                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="size-5 text-brand-green" />
                                        <div>
                                            <p className="font-medium">HR System Dashboard</p>
                                            <p className="text-xs text-muted-foreground">View final system</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground" />
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
