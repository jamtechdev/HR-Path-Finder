import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinitions: JobDefinition[];
}

export default function Finalization({ project, jobDefinitions }: Props) {
    const [confirmed, setConfirmed] = useState(false);

    const { post, processing } = useForm({
        confirm: false,
    });

    const handleFinalize = () => {
        post(`/hr-manager/job-analysis/${project.id}/finalize`, {
            data: { confirm: true },
            onSuccess: () => {
                router.visit(`/hr-manager/job-analysis/${project.id}/org-chart-mapping`);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Finalization - ${project?.company?.name || 'Job Analysis'}`} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Finalization of Job List</h1>
                            <p className="text-muted-foreground">
                                Review and finalize all job definitions. Once finalized, these will be used for performance management and compensation system design.
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Job Structure Summary</CardTitle>
                                <CardDescription>
                                    {jobDefinitions.length} job{jobDefinitions.length !== 1 ? 's' : ''} defined
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {jobDefinitions.map((job) => (
                                        <div key={job.id} className="p-3 border rounded-md">
                                            <div className="font-medium">{job.job_name}</div>
                                            {job.job_description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {job.job_description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Finalize Job Setup</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                                    <Checkbox
                                        id="confirm-finalize"
                                        checked={confirmed}
                                        onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                                    />
                                    <Label htmlFor="confirm-finalize" className="flex-1 cursor-pointer">
                                        <span className="font-medium">I confirm that all job definitions are complete and accurate</span>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            By finalizing, you lock all job definitions. They will be used as baseline inputs for the performance management and compensation systems. You can request admin assistance if changes are needed after finalization.
                                        </p>
                                    </Label>
                                </div>

                                <Button
                                    onClick={handleFinalize}
                                    disabled={!confirmed || processing}
                                    size="lg"
                                    className="w-full"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Finalize Job Setup
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="mt-6">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(`/hr-manager/job-analysis/${project.id}/job-definition`)}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Job Definitions
                            </Button>
                        </div>
                    </div>
        </AppLayout>
    );
}
