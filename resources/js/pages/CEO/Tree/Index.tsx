import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import FinalBoard, { type StageProgressPercent } from '@/components/Dashboard/HRManager/FinalBoard';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_group?: string;
}

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
    jobDefinitions: JobDefinition[];
    activeTab?: string;
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function CeoTreeIndex({
    project,
    stepStatuses = {},
    stageProgressPercent,
    projectId,
    jobDefinitions,
    activeTab = 'overview',
    hrSystemSnapshot,
}: Props) {
    void jobDefinitions;
    void activeTab;

    return (
        <AppLayout showWorkflowSteps={true} stepStatuses={stepStatuses} projectId={projectId}>
            <Head title={`Final Dashboard - ${project.company.name}`} />
            <FinalBoard
                projectId={projectId}
                companyName={project.company.name}
                stepStatuses={stepStatuses}
                stageProgressPercent={stageProgressPercent}
                hrSystemSnapshot={hrSystemSnapshot}
                viewerRole="ceo"
            />
        </AppLayout>
    );
}
