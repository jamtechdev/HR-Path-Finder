import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowLeft, DollarSign, AlertCircle } from 'lucide-react';

interface CompensationSystem {
    id?: number;
    compensation_structure?: string;
    differentiation_logic?: string;
    incentive_types?: string[];
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    compensationSystem?: CompensationSystem;
    stepStatuses?: Record<string, string>;
}

const STRUCTURE_LABELS: Record<string, string> = {
    'fixed': 'Fixed Compensation',
    'mixed': 'Mixed Compensation',
    'performance_based': 'Performance-Based Compensation',
};

const DIFFERENTIATION_LABELS: Record<string, string> = {
    'merit': 'Merit Increase',
    'incentives': 'Incentives',
    'role-based': 'Role-Based Pay',
};

const INCENTIVE_LABELS: Record<string, string> = {
    'individual': 'Individual Incentives',
    'organizational': 'Organizational Incentives',
    'task-force': 'Task-Force Incentives',
    'long-term': 'Long-Term Incentives',
};

export default function CeoCompensationReview({ 
    project, 
    compensationSystem,
    stepStatuses = {}
}: Props) {
    const { post, processing } = useForm({});

    const compensationStatus = stepStatuses['compensation'] || 'not_started';
    const isSubmitted = compensationStatus === 'submitted';

    const handleVerify = () => {
        post(`/ceo/verify/step/${project.id}`, {
            step: 'compensation',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit('/ceo/dashboard');
            },
        });
    };

    const handleRequestRevision = () => {
        post(`/ceo/revision/step/${project.id}`, {
            step: 'compensation',
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`Compensation System Review - ${project.company.name}`} />
                    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl sm:max-w-6xl lg:max-w-7xl mx-auto min-h-screen">
                        <div className="mb-4 sm:mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/ceo/dashboard')}
                                className="mb-3 sm:mb-4 h-11 min-h-[44px] dark:text-slate-300"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <h1 className="text-2xl sm:text-3xl font-bold dark:text-slate-100 leading-tight">Compensation System Review</h1>
                                <Badge variant={isSubmitted ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                                    {isSubmitted ? 'Submitted' : compensationStatus}
                                </Badge>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground dark:text-slate-400 leading-relaxed">
                                Review the compensation system design for {project.company.name}
                            </p>
                        </div>

                        {!compensationSystem && (
                            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                                            Compensation system has not been submitted yet. Please wait for HR Manager to complete this step.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {compensationSystem && (
                            <div className="space-y-6">
                                {/* Compensation Structure */}
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader className="dark:bg-slate-800">
                                        <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                                            <DollarSign className="w-5 h-5" />
                                            Compensation Structure
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="dark:bg-slate-800 p-4 sm:p-6">
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400">Selected Structure:</p>
                                            <p className="text-base sm:text-lg font-semibold dark:text-slate-200">
                                                {compensationSystem.compensation_structure 
                                                    ? STRUCTURE_LABELS[compensationSystem.compensation_structure] || compensationSystem.compensation_structure
                                                    : 'Not specified'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Differentiation Method */}
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader className="dark:bg-slate-800">
                                        <CardTitle className="dark:text-slate-100">Differentiation Method</CardTitle>
                                    </CardHeader>
                                    <CardContent className="dark:bg-slate-800 p-4 sm:p-6">
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400">Selected Method:</p>
                                            <p className="text-base sm:text-lg font-semibold dark:text-slate-200">
                                                {compensationSystem.differentiation_logic
                                                    ? DIFFERENTIATION_LABELS[compensationSystem.differentiation_logic] || compensationSystem.differentiation_logic
                                                    : 'Not specified'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Incentive Components */}
                                <Card className="dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader className="dark:bg-slate-800">
                                        <CardTitle className="dark:text-slate-100">Incentive Components</CardTitle>
                                    </CardHeader>
                                        <CardContent className="dark:bg-slate-800 p-4 sm:p-6">
                                            <div className="space-y-2">
                                                <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400 mb-2 sm:mb-3">Selected Components:</p>
                                                {compensationSystem.incentive_types && compensationSystem.incentive_types.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        {compensationSystem.incentive_types.map((type) => (
                                                            <Badge key={type} variant="outline" className="text-xs sm:text-sm dark:border-slate-600 dark:text-slate-300 py-1 px-2">
                                                                {INCENTIVE_LABELS[type] || type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400">No incentive components selected</p>
                                                )}
                                            </div>
                                        </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                {isSubmitted && (
                                    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="sm:text-right">
                                                    <h3 className="font-semibold mb-1 text-base sm:text-lg dark:text-slate-100">Review Actions</h3>
                                                    <p className="text-sm text-muted-foreground dark:text-slate-400 leading-relaxed">
                                                        Approve this compensation system or request revisions from HR Manager.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleRequestRevision}
                                                        disabled={processing}
                                                        className="min-h-[44px] flex-1 sm:flex-none"
                                                    >
                                                        <AlertCircle className="w-4 h-4 mr-2" />
                                                        Request Revision
                                                    </Button>
                                                    <Button
                                                        onClick={handleVerify}
                                                        disabled={processing}
                                                        className="min-h-[44px] flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Approve & Lock
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {!isSubmitted && (
                                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                                <p className="text-yellow-800 dark:text-yellow-200">
                                                    This compensation system is not yet submitted. Please wait for HR Manager to submit it for review.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
        </AppLayout>
    );
}

