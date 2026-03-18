import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Download, Printer, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface ReportUploadItem {
    id: number;
    original_name: string;
    file_path: string;
    created_at: string;
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
    reportUploads?: ReportUploadItem[];
}

export default function HrReportIndex({
    project,
    stepStatuses,
    projectId,
    hrSystemSnapshot,
    reportUploads = [],
}: Props) {
    const { data, setData, post, processing, errors } = useForm<{ file: File | null }>({ file: null });

    const isCompleted = (status: string) => ['submitted', 'approved', 'locked', 'completed'].includes(status);
    const fullReady =
        isCompleted(stepStatuses.diagnosis || 'not_started') &&
        isCompleted(stepStatuses.job_analysis || 'not_started') &&
        isCompleted(stepStatuses.performance || 'not_started') &&
        isCompleted(stepStatuses.compensation || 'not_started');

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;
        post(`/hr-manager/report/${projectId}/upload`, {
            forceFormData: true,
            onSuccess: () => setData('file', null),
        });
    };

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

                {/* Upload Report */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Report
                        </CardTitle>
                        <CardDescription>
                            Upload a final report document (PDF, max 50MB) to attach to this project.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="report-file">PDF file</Label>
                                <Input
                                    id="report-file"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="mt-1"
                                    onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                />
                                {errors.file && <p className="text-sm text-destructive mt-1">{errors.file}</p>}
                            </div>
                            <Button type="submit" disabled={!data.file || processing}>
                                <Upload className="w-4 h-4 mr-2" />
                                {processing ? 'Uploading...' : 'Upload'}
                            </Button>
                        </form>
                        {reportUploads.length > 0 && (
                            <div className="pt-4 border-t">
                                <Label className="text-sm font-medium">Uploaded reports</Label>
                                <ul className="mt-2 space-y-2">
                                    {reportUploads.map((upload) => (
                                        <li key={upload.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <span className="text-sm truncate">{upload.original_name}</span>
                                            <a
                                                href={`/hr-manager/report/${projectId}/upload/${upload.id}/download`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                <Download className="w-4 h-4 inline mr-1" />
                                                Download
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
