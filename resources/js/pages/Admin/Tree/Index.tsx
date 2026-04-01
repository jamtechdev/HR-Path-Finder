import { Head } from '@inertiajs/react';
import React from 'react';
import FinalBoard, { type StageProgressPercent } from '@/components/Dashboard/HRManager/FinalBoard';
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
    stageProgressPercent?: StageProgressPercent;
    projectId: number;
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function AdminTreeIndex({
    project,
    stepStatuses,
    stageProgressPercent,
    projectId,
    hrSystemSnapshot,
}: Props) {
    return (
        <AppLayout showWorkflowSteps={true} stepStatuses={stepStatuses} projectId={projectId}>
            <Head title={`Final Board - ${project.company.name}`} />
            <FinalBoard
                projectId={projectId}
                companyName={project.company.name}
                stepStatuses={stepStatuses}
                stageProgressPercent={stageProgressPercent}
                hrSystemSnapshot={hrSystemSnapshot}
                viewerRole="admin"
            />
        </AppLayout>
    );
}
