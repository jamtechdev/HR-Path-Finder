import { Head } from '@inertiajs/react';
import { FileBarChart, Download, Printer } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
    };
    performance_management: {
        model?: string;
        cycle?: string;
        rating_scale?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
    };
    hr_system_report: {
        status: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function HrReportIndex({
    project,
    stepStatuses,
    projectId,
    hrSystemSnapshot,
}: Props) {
    const isCompleted = (status: string) => ['submitted', 'approved', 'locked', 'completed'].includes(status);
    const fullReady =
        isCompleted(stepStatuses.diagnosis || 'not_started') &&
        isCompleted(stepStatuses.job_analysis || 'not_started') &&
        isCompleted(stepStatuses.performance || 'not_started') &&
        isCompleted(stepStatuses.compensation || 'not_started');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
            case 'approved':
            case 'locked':
            case 'completed':
                return <Badge className="bg-green-500">Completed</Badge>;
            case 'in_progress':
                return <Badge variant="secondary">In Progress</Badge>;
            default:
                return <Badge variant="outline">Not Started</Badge>;
        }
    };

    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <Head title={`Report - ${project.company.name}`} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Project Report</h1>
                    <p className="text-sm text-muted-foreground">
                        Comprehensive report for {project.company.name}
                    </p>
                </div>

                {/* Report Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileBarChart className="h-5 w-5" />
                                Diagnosis Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span>Status:</span>
                                {getStatusBadge(stepStatuses.diagnosis || 'not_started')}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                disabled={!isCompleted(stepStatuses.diagnosis || 'not_started')}
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/diagnosis`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            {!isCompleted(stepStatuses.diagnosis || 'not_started') && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Complete and submit Diagnosis to generate this report.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileBarChart className="h-5 w-5" />
                                Job Analysis Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span>Status:</span>
                                {getStatusBadge(stepStatuses.job_analysis || 'not_started')}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                disabled={!isCompleted(stepStatuses.job_analysis || 'not_started')}
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/job_analysis`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            {!isCompleted(stepStatuses.job_analysis || 'not_started') && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Complete and submit Job Analysis to generate this report.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileBarChart className="h-5 w-5" />
                                Performance System Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span>Status:</span>
                                {getStatusBadge(stepStatuses.performance || 'not_started')}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                disabled={!isCompleted(stepStatuses.performance || 'not_started')}
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/performance`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            {!isCompleted(stepStatuses.performance || 'not_started') && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Complete and submit Performance System to generate this report.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileBarChart className="h-5 w-5" />
                                Compensation System Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span>Status:</span>
                                {getStatusBadge(stepStatuses.compensation || 'not_started')}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                disabled={!isCompleted(stepStatuses.compensation || 'not_started')}
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/compensation`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            {!isCompleted(stepStatuses.compensation || 'not_started') && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Complete and submit Compensation System to generate this report.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileBarChart className="h-5 w-5" />
                                Final Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span>Status:</span>
                                {getStatusBadge(stepStatuses.hr_policy_os || 'not_started')}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={!isCompleted(stepStatuses.hr_policy_os || 'not_started')}
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/hr_policy_os`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            {!isCompleted(stepStatuses.hr_policy_os || 'not_started') && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Final Dashboard report will be available after completion.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Full Report */}
                <Card>
                    <CardHeader>
                        <CardTitle>Complete Project Report</CardTitle>
                        <CardDescription>
                            Download the complete report including all steps and analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Button
                                disabled={!fullReady}
                                onClick={() => {
                                    window.open(`/hr-manager/report/${projectId}/download`, '_blank');
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Full Report (PDF)
                            </Button>
                            <Button 
                                variant="outline"
                                disabled={!fullReady}
                                onClick={() => {
                                    window.open(`/hr-manager/report/${projectId}/download`, '_blank');
                                    setTimeout(() => window.print(), 500);
                                }}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Report
                            </Button>
                        </div>
                        {!fullReady && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Full report is generated after completing and submitting Diagnosis, Job Analysis, Performance, and Compensation.
                            </p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
