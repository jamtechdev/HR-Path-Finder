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
        consultant_reviews?: Array<{
            opinions?: string;
            risk_notes?: string;
            alignment_observations?: string;
        }>;
    };
}

export default function CeoApproval({ project }: Props) {
    const approveForm = useForm({
        comments: '',
    });

    const requestChangesForm = useForm({
        comments: '',
    });

    const handleApprove: FormEventHandler = (e) => {
        e.preventDefault();
        approveForm.post(`/hr-projects/${project.id}/ceo-approval/approve`);
    };

    const handleRequestChanges: FormEventHandler = (e) => {
        e.preventDefault();
        requestChangesForm.post(`/hr-projects/${project.id}/ceo-approval/request-changes`);
    };

    const steps = [
        { id: 'diagnosis', name: 'Diagnosis', completed: true, current: false, locked: false },
        { id: 'ceo_philosophy', name: 'CEO Philosophy', completed: true, current: false, locked: false },
        { id: 'organization', name: 'Organization', completed: true, current: false, locked: false },
        { id: 'performance', name: 'Performance', completed: true, current: false, locked: false },
        { id: 'compensation', name: 'Compensation', completed: true, current: false, locked: false },
        { id: 'consultant_review', name: 'Consultant Review', completed: true, current: false, locked: false },
        { id: 'ceo_approval', name: 'CEO Approval', completed: false, current: true, locked: false },
    ];

    const latestReview = project.consultant_reviews?.[0];

    return (
        <AppLayout>
            <Head title="Step 7: CEO Final Approval" />
            <div className="container mx-auto max-w-4xl py-8">
                <StepNavigation steps={steps} currentStep={project.current_step} />

                <div className="mt-8 space-y-6">
                    {latestReview && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Consultant Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {latestReview.opinions && (
                                    <div>
                                        <p className="font-semibold mb-2">Opinions:</p>
                                        <p className="text-sm text-muted-foreground">{latestReview.opinions}</p>
                                    </div>
                                )}
                                {latestReview.risk_notes && (
                                    <div>
                                        <p className="font-semibold mb-2">Risk Notes:</p>
                                        <p className="text-sm text-muted-foreground">{latestReview.risk_notes}</p>
                                    </div>
                                )}
                                {latestReview.alignment_observations && (
                                    <div>
                                        <p className="font-semibold mb-2">Alignment Observations:</p>
                                        <p className="text-sm text-muted-foreground">
                                            {latestReview.alignment_observations}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approve HR System</CardTitle>
                                <CardDescription>Approve and lock the HR system design.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleApprove} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="approve_comments">Comments (Optional)</Label>
                                        <Textarea
                                            id="approve_comments"
                                            value={approveForm.data.comments}
                                            onChange={(e) => approveForm.setData('comments', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={approveForm.processing}
                                        className="w-full bg-brand-green hover:bg-brand-green/90"
                                    >
                                        {approveForm.processing ? 'Approving...' : '✓ Approve HR System'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Request Changes</CardTitle>
                                <CardDescription>Request modifications to the HR system design.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleRequestChanges} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="request_comments">Comments *</Label>
                                        <Textarea
                                            id="request_comments"
                                            value={requestChangesForm.data.comments}
                                            onChange={(e) => requestChangesForm.setData('comments', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder="Specify what changes are needed..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={requestChangesForm.processing}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {requestChangesForm.processing ? 'Submitting...' : '🔄 Request Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
