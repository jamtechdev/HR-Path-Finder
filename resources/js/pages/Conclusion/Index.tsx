import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import WorkflowStepsSidebar from '@/components/Sidebar/WorkflowStepsSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Award } from 'lucide-react';

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
}

export default function ConclusionIndex({ project, stepStatuses, projectId }: Props) {
    const { post, processing } = useForm({});

    const handleFinalize = () => {
        if (confirm('Are you sure you want to finalize the HR System Design? This action cannot be undone.')) {
            post(`/hr-manager/conclusion/${projectId}/finalize`, {
                onSuccess: () => {
                    router.visit('/hr-manager/dashboard');
                },
            });
        }
    };

    const allStepsCompleted = Object.values(stepStatuses).every(status => 
        ['submitted', 'approved', 'locked'].includes(status)
    );

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
                <WorkflowStepsSidebar stepStatuses={stepStatuses} projectId={projectId} />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title={`Conclusion - ${project.company.name}`} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">Conclusion</h1>
                            <p className="text-muted-foreground">
                                Final review, approval, and system implementation summary.
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-6 h-6" />
                                    HR System Design Completion
                                </CardTitle>
                                <CardDescription>
                                    Review all completed steps and finalize your HR system design.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    {Object.entries(stepStatuses).map(([step, status]) => {
                                        const isCompleted = ['submitted', 'approved', 'locked'].includes(status);
                                        return (
                                            <div key={step} className="flex items-center gap-3 p-3 border rounded-lg">
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium capitalize">{step.replace('_', ' ')}</p>
                                                    <p className="text-sm text-muted-foreground">{status}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {allStepsCompleted ? (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 font-medium mb-2">
                                            All steps completed successfully!
                                        </p>
                                        <p className="text-sm text-green-700">
                                            You can now finalize your HR System Design.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-800 font-medium mb-2">
                                            Please complete all steps before finalizing.
                                        </p>
                                        <p className="text-sm text-yellow-700">
                                            Some steps are still in progress or not started.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleFinalize}
                                    disabled={!allStepsCompleted || processing}
                                    size="lg"
                                    className="w-full"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Finalize HR System Design
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
