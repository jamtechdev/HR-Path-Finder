import React from 'react';
import StepHeader from '@/components/StepHeader/StepHeader';
import AppLayout from '@/layouts/AppLayout';

interface StepLayoutProps {
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'submitted';
    backHref?: string;
    progressLabel?: string;
    completedCount?: number;
    totalCount?: number;
    children: React.ReactNode;
    tabs?: React.ReactNode;
    projectId?: number;
    stepStatuses?: Record<string, string>;
}

export default function StepLayout({
    title,
    description,
    status,
    backHref,
    progressLabel,
    completedCount,
    totalCount,
    children,
    tabs,
    projectId,
    stepStatuses,
}: StepLayoutProps) {
    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <div className="p-6 md:p-8 max-w-7xl mx-auto bg-background">
                {/* Header */}
                <div className="mb-6">
                    <StepHeader
                        title={title}
                        description={description}
                        status={status}
                        backHref={backHref}
                    />
                </div>

                {/* Progress Overview */}
                {completedCount !== undefined && totalCount !== undefined && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between flex-wrap mb-2">
                            <span className="text-sm font-medium text-gray-700">{progressLabel || 'Progress'}</span>
                            <span className="text-sm text-gray-600">{completedCount} of {totalCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                {tabs && (
                    <div className="mb-6">
                        {tabs}
                    </div>
                )}

                {/* Content */}
                <div className="mb-6">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}
