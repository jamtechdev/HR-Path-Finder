import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/diagnosis`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
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
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/job_analysis`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
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
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/performance`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
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
                                onClick={() => window.open(`/hr-manager/report/${projectId}/download/compensation`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
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
                                onClick={() => {
                                    window.open(`/hr-manager/report/${projectId}/download`, '_blank');
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Full Report (PDF)
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    window.open(`/hr-manager/report/${projectId}/download`, '_blank');
                                    setTimeout(() => window.print(), 500);
                                }}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
