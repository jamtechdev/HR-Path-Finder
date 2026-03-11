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
                    <div className="p-6 md:p-8 max-w-7xl mx-auto dark:bg-slate-900 min-h-screen">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/ceo/dashboard')}
                                className="mb-4 dark:text-slate-300"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold dark:text-slate-100">Compensation System Review</h1>
                                <Badge variant={isSubmitted ? 'default' : 'secondary'}>
                                    {isSubmitted ? 'Submitted' : compensationStatus}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground dark:text-slate-400">
                                Review the compensation system design for {project.company.name}
                            </p>
                        </div>

                        {!compensationSystem && (
                            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        <p className="text-yellow-800 dark:text-yellow-200">
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
                                    <CardContent className="dark:bg-slate-800">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground dark:text-slate-400">Selected Structure:</p>
                                            <p className="text-lg font-semibold dark:text-slate-200">
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
                                    <CardContent className="dark:bg-slate-800">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground dark:text-slate-400">Selected Method:</p>
                                            <p className="text-lg font-semibold dark:text-slate-200">
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
                                    <CardContent className="dark:bg-slate-800">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-3">Selected Components:</p>
                                            {compensationSystem.incentive_types && compensationSystem.incentive_types.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {compensationSystem.incentive_types.map((type) => (
                                                        <Badge key={type} variant="outline" className="text-sm dark:border-slate-600 dark:text-slate-300">
                                                            {INCENTIVE_LABELS[type] || type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground dark:text-slate-400">No incentive components selected</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                {isSubmitted && (
                                    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold mb-1 dark:text-slate-100">Review Actions</h3>
                                                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                                                        Approve this compensation system or request revisions from HR Manager.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleRequestRevision}
                                                        disabled={processing}
                                                    >
                                                        <AlertCircle className="w-4 h-4 mr-2" />
                                                        Request Revision
                                                    </Button>
                                                    <Button
                                                        onClick={handleVerify}
                                                        disabled={processing}
                                                        className="bg-green-600 hover:bg-green-700"
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

